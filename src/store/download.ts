
import { defineStore } from 'pinia'
import type { Res, ResStatus, Source } from '@/types/common'
import { core } from '@tauri-apps/api'
import { wait } from '@/utils/tool'
import { db } from '@/db'
import { ElMessageBox } from 'element-plus'
import { useConfig } from './config'

const { invoke } = core

const lines = 10

const downloadList: Record<string, number[]> = {}

export const useDownload = defineStore('download', {
  state: () => ({
    list: [] as Source[],
  }),
  actions: {
    async load() {
      this.list = await db.downloadList.orderBy('lastLogin').reverse().toArray()
    },
    async add(download: Source) {
      const res = { ...download, lastLogin: Date.now() }
      await db.downloadList.put({ ...res, links: download.links.map(link => ({ ...link, url: '' })) })
      this.list.unshift(res)
      this.startDownload()
    },
    async remove(download: Source) {
      this.list = this.list.filter(item => item.id !== download.id)
      await db.downloadList.delete(download.id)
    },
    async update(download: Partial<Source>) {
      const item = this.list.find(item => item.id === download.id)
      if (!item) return
      this.list = this.list.map(item => item.id === download.id ? { ...item, ...download } : item)
      const res = { ...item, ...download }
      await db.downloadList.put({ ...res, links: res.links.map(link => ({ ...link, url: '' })) })
    },
    async startDownload() {
      const config = useConfig()
      if (this.list.filter(item => item.status === 'downloading').length >= config.tasks) return
      const startItem = this.list.find(item => item.status === 'ready')
      if (!startItem) return
      startItem.status = 'downloading'
      const waiter = new Waiter()
      await db.downloadList.put({ ...startItem, links: startItem.links.map(link => ({ ...link, url: '' })) })
      for (let i = 0; i < startItem.links.length; i++) {
        if (startItem.links[i].status === 'done') continue
        // console.log(startItem.title, 'map:', downloadList[startItem.title])
        if (downloadList[startItem.title] && downloadList[startItem.title].length >= config.process) {
          await waiter.wait()
        }
        this.downloadItem(startItem, i, waiter)
      }
    },
    downloadItem(video: Source, index: number, waiter: Waiter) {
      video.links[index].status = 'padding'
      downloadList[video.title] = [...(downloadList[video.title] || []), index]
      const path = `${video.title}/${String(index).padStart(5, '0')}${video.links[index].url.split('/').reverse()[0]}`
      return invoke<Res<ResStatus>>('download_item', {
        url: video.links[index].url,
        path,
      }).then(async (res) => {
        // console.log('download Finished', index)
        video.links[index].status = res.data.status
        const ind = downloadList[video.title].findIndex(ind => ind === index)
        downloadList[video.title].splice(ind, 1)
        await db.downloadList.put({ ...video, links: video.links.map(link => ({ ...link, url: '' })) })
        waiter.emit()
        if (!video.links.every(link => link.status === 'done')) return
        video.status = 'done'
        this.startDownload();
        await db.downloadList.put({ ...video, links: video.links.map(link => ({ ...link, url: '' })) })
        const combineRes = await invoke<Res<ResStatus>>('combine_splits', {
          name: video.title,
          fileType: video.links[index].url.split('.').reverse()[0],
        });
        if (combineRes.data.status !== 'success') {
          video.status = 'ready'
          video.links.forEach(link => link.status = '')
          await db.downloadList.put({ ...video, links: video.links.map(link => ({ ...link, url: '' })) })
          ElMessageBox.alert(video.title, '合并失败', {
            confirmButtonText: 'OK',
          })
          return
        }
      }).catch(async () => {
        console.log('download error', index)
        video.links[index].status = 'error'
        const ind = downloadList[video.title].findIndex(ind => ind === index)
        downloadList[video.title].splice(ind, 1)
        await wait()
        await this.downloadItem(video, index, waiter)
        return
      })
    }
  }
})

class Waiter {
  res: Function | null
  constructor() {
    this.res = null;
  }
  async wait() {
    return new Promise((res) => {
      this.res = res
    })
  }

  async emit() {
    if (!this.res) return
    await this.res()
    this.res = null
  }
}
