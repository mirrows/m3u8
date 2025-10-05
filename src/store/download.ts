
import { defineStore } from 'pinia'
import type { Res, ResStatus, Source } from '@/types/common'
import { core } from '@tauri-apps/api'
import { Finished } from '@element-plus/icons-vue'
import { wait } from '@/utils/tool'

const { invoke } = core

const process = 3
const lines = 10

const downloadList: Record<string, number[]> = {}

export const useDownload = defineStore('download', {
  state: () => ({
    list: [] as Source[],
  }),
  actions: {
    add(download: Source) {
      this.list.unshift(download)
      this.startDownload()
    },
    remove(download: Source) {
      this.list = this.list.filter(item => item.id !== download.id)
    },
    update(download: Partial<Source>) {
      this.list = this.list.map(item => item.id === download.id ? { ...item, ...download } : item)
    },
    async startDownload() {
      if (this.list.filter(item => item.status === 'downloading').length >= process) return
      const startItem = this.list.find(item => item.status === 'ready')
      if (!startItem) return
      startItem.status = 'downloading'
      const waiter = new Waiter()
      for (let i = 0; i < startItem.links.length; i++) {
        if (startItem.links[i].status === 'done') continue
        // console.log(startItem.title, 'map:', downloadList[startItem.title])
        if (downloadList[startItem.title] && downloadList[startItem.title].length > lines) {
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
      }).then(res => {
        // console.log('download Finished', index)
        video.links[index].status = res.data.status
        const ind = downloadList[video.title].findIndex(ind => ind === index)
        downloadList[video.title].splice(ind, 1)
        waiter.emit()
        if (!video.links.every(link => link.status === 'done')) return
        video.status = 'done'
        this.startDownload();
        invoke<Res<ResStatus>>('combine_splits', {
          name: video.title,
          fileType: video.links[index].url.split('.').reverse()[0],
        })
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
