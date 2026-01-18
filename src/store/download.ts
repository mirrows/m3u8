
import { defineStore } from 'pinia'
import type { Res, ResStatus, Source } from '@/types/common'
import { core } from '@tauri-apps/api'
import { wait } from '@/utils/tool'
import { db } from '@/db'
import { ElMessageBox } from 'element-plus'
import { useConfig } from './config'
import { pause } from '@/components/custom-icon/svg-list'

const { invoke } = core

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
      const config = useConfig()
      if (this.list.filter(item => item.status === 'downloading').length >= config.tasks) return
      const startItem = this.list.findLast(item => item.status === 'ready')
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
        if (startItem.links.filter(e => e.status === 'padding' || e.status === 'error').length >= config.process) {
          await waiter.wait()
        }
        this.downloadItem(startItem, i, waiter, config)
      }
    },
    downloadItem(video: Source, index: number, waiter: Waiter, config: ReturnType<typeof useConfig>) {
      video.links[index].status = 'padding'
      downloadList[video.id] = [...(downloadList[video.id] || []), index]
      const path = `${video.title}/${String(index).padStart(5, '0')}${video.links[index].url.split('/').reverse()[0]}`
      // console.log(
      //   '正在下载的进程数：',
      //   video.links.filter(e => e.status === 'padding').length,
      //   '包含错误的进程数',
      //   video.links.filter(e => e.status === 'padding' || e.status === 'error').length,
      // )
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
        video.links[index].status = res.data.status
        const ind = downloadList[video.id].findIndex(ind => ind === index)
        downloadList[video.id].splice(ind, 1)
        await db.downloadList.put({ ...video, links: video.links.map(link => ({ ...link, url: '' })) })
        if (video.links.filter(e => e.status === 'padding' || e.status === 'error').length < config.process) {
          waiter.emit()
        }
        if (!video.links.every(link => link.status === 'done') || video.status === 'done') return
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
      }).catch(async (error) => {
        // console.log('error:', error)
        if (video.status === 'paused') {
          this.pauseDownload(video)
          // await new Promise(resolve => this.pauseLine[video.id] = [...(this.pauseLine[video.id] || []), resolve]);
          return
        }
        video.links[index].status = 'error'
        const ind = downloadList[video.id].findIndex(ind => ind === index)
        downloadList[video.id].splice(ind, 1)
        await wait()
        await this.downloadItem(video, index, waiter, config)
        return
      })
    },
    pauseDownload(video: Source) {
      delete downloadList[video.id]
    }
  }
})

class Waiter {
  res: Function[]
  constructor() {
    this.res = [];
  }
  async wait() {
    return new Promise((res) => {
      this.res.push(res)
    })
  }

  async emit() {
    if (!this.res) return
    const fn = this.res.shift()
    if(!fn) return
    await fn()
  }
}
