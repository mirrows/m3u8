
import { defineStore } from 'pinia'
import type { Res, ResStatus, Source } from '@/types/common'
import { core } from '@tauri-apps/api'
import { wait } from '@/utils/tool'
import { db } from '@/db'
import { ElMessageBox } from 'element-plus'
import { pause } from '@/components/custom-icon/svg-list'

const { invoke } = core

const process = 3
const lines = 10

const downloadList: Record<string, number[]> = {}


export const useDownload = defineStore('download', {
  state: () => ({
    list: [] as Source[],
    deleteLine: {} as Record<string, boolean>,
    pauseLine: {} as Record<string, Function[]>,
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
    pause(download: Source) {
      download.status = 'paused'
      this.startDownload()
    },
    resume(download: Source) {
      download.status = 'ready'
      // this.pauseLine[download.id]?.forEach(res => {
      //   res()
      // })
      // delete this.pauseLine[download.id]
      this.startDownload()
    },
    async remove(download: Source) {
      if (download.status === 'downloading') {
        this.deleteLine[download.id] = true
      }
      this.list = this.list.filter(item => item.id !== download.id)
      await db.downloadList.delete(download.id)
      this.startDownload()
    },
    async update(download: Partial<Source>) {
      const item = this.list.find(item => item.id === download.id)
      if (!item) return
      this.list = this.list.map(item => item.id === download.id ? { ...item, ...download } : item)
      const res = { ...item, ...download }
      await db.downloadList.put({ ...res, links: res.links.map(link => ({ ...link, url: '' })) })
    },
    async startDownload() {
      if (this.list.filter(item => item.status === 'downloading').length >= process) return
      const startItem = this.list.find(item => item.status === 'ready')
      if (!startItem) return
      startItem.status = 'downloading'
      const waiter = new Waiter()
      await db.downloadList.put({ ...startItem, links: startItem.links.map(link => ({ ...link, url: '' })) })
      for (let i = 0; i < startItem.links.length; i++) {
        // 检查是否已删除
        if (this.deleteLine[startItem.id]) {
          delete this.deleteLine[startItem.id]
          return
        }
        if (startItem.status === 'paused') {
          // await new Promise(resolve => this.pauseLine[startItem.id] = [...(this.pauseLine[startItem.id] || []), resolve]);
          this.pauseDownload(startItem)
          return
        }
        if (startItem.links[i].status === 'done') continue
        // console.log(startItem.title, 'map:', downloadList[startItem.title])
        if (downloadList[startItem.id] && downloadList[startItem.id].length > lines) {
          await waiter.wait()
        }
        this.downloadItem(startItem, i, waiter)
      }
    },
    downloadItem(video: Source, index: number, waiter: Waiter) {
      video.links[index].status = 'padding'
      downloadList[video.id] = [...(downloadList[video.id] || []), index]
      const path = `${video.title}/${String(index).padStart(5, '0')}${video.links[index].url.split('/').reverse()[0]}`
      return invoke<Res<ResStatus>>('download_item', {
        url: video.links[index].url,
        path,
      }).then(async (res) => {
        if (!this.list.some(v => v.id === video.id)) return
        if (video.status === 'paused') {
          // await new Promise(resolve => this.pauseLine[video.id] = [...(this.pauseLine[video.id] || []), resolve]);
          this.pauseDownload(video)
          return
        }
        // console.log('download Finished', index)
        video.links[index].status = res.data.status
        const ind = downloadList[video.id].findIndex(ind => ind === index)
        downloadList[video.id].splice(ind, 1)
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
        if (combineRes.code !== 0) {
          video.status = 'ready'
          video.links.forEach(link => link.status = '')
          await db.downloadList.put({ ...video, links: video.links.map(link => ({ ...link, url: '' })) })
          ElMessageBox.alert(video.title, '合并失败', {
            confirmButtonText: 'OK',
          })
          return
        }
      }).catch(async () => {
        // console.log('download error', index)
        if (video.status === 'paused') {
          this.pauseDownload(video)
          // await new Promise(resolve => this.pauseLine[video.id] = [...(this.pauseLine[video.id] || []), resolve]);
          return
        }
        video.links[index].status = 'error'
        const ind = downloadList[video.id].findIndex(ind => ind === index)
        downloadList[video.id].splice(ind, 1)
        await wait()
        await this.downloadItem(video, index, waiter)
        return
      })
    },
    pauseDownload(video: Source) {
      delete downloadList[video.id]
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
