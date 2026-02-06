
import { defineStore } from 'pinia'
import type { Res, ResStatus, Source, VideoMsg } from '@/types/common'
import { core } from '@tauri-apps/api'
import { wait, Waiter } from '@/utils/tool'
import { db } from '@/db'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useConfig } from './config'
import { LINK_STATUS, SOURCE_STATUS } from '@/types/enum'

const { invoke } = core

const downloadList: Record<string, number[]> = {}


const startCount = (video: Source) => {
  if (video.timer) {
    clearInterval(video.timer)
  }
  video.timer = setInterval(() => {
    video.time += 1
    if(video.time > 10) {
      db.downloadList.put({ ...video })
    }
  }, 1000)
}
const stopCount = (video: Source) => {
  if (video.timer) {
    clearInterval(video.timer)
    video.timer = null
  }
  db.downloadList.put({ ...video })
}

const retryCombine = (video: Source) => {

  ElMessageBox.confirm(video.title, '合并失败', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning',
  }).then(() => {
    invoke<Res<ResStatus>>('combine_splits', {
      name: video.title,
      fileType: video.links[0].url.split('.').reverse()[0],
    }).then((res) => {
      if (res.code !== 0 || res.data.status !== SOURCE_STATUS.DONE) {
        retryCombine(video)
        return
      }
      stopCount(video)
    });
  })
}

const retryDownload = async (startItem: Source) => {
  const res = await invoke<Res<VideoMsg>>('parse_site', {
    url: startItem.siteUrl,
  })
  if (res.code !== 0 || !res.data) {
    ElMessage.error(`${startItem.title}解析失败`)
    return
  }
  const quality = res.data.quality.find(item => item.name === startItem.name)
  if(!quality) {
    ElMessage.error(`${startItem.title}解析失败，未找到${startItem.title}-${startItem.name}P资源`)
    return
  }
  const source = await invoke<Res<Source>>('download_video', {
    ...startItem,
    ...quality,
    title: startItem.title,
    checkExist: false,
    fileType: 'mp4',
  })
  if (!source.data.links?.length) {
    ElMessage.error('解析数据为空，请重新请求');
    return;
  }
  return {
    ...source.data,
    status: SOURCE_STATUS.READY,
  }
}


export const useDownload = defineStore('download', {
  state: () => ({
    list: [] as Source[],
    deleteLine: {} as Record<string, boolean>,
    pauseLine: {} as Record<string, Function[]>,
  }),
  actions: {
    async load() {
      const list = await db.downloadList.orderBy('lastLogin').reverse().toArray()
      // list.push({
      //   id: '1234',
      //   title: 'test video in youtubetest video in youtubetest',
      //   name: '1080*1920',
      //   posterUrl: 'https://img.shetu66.com/2023/06/26/1687770031227597.png',
      //   size: 'string',
      //   sizeStr: 'string',
      //   timestamp: Date.now(),
      //   timeStr: new Date().toLocaleString(),
      //   status: 'ready',
      //   url: 'string',
      //   siteUrl: 'http://baidu.com',
      //   links: [
      //     { status: 'done', url: 'string' },
      //     { status: 'done', url: 'string' },
      //     { status: 'done', url: 'string' },
      //     { status: 'done', url: 'string' },
      //     { status: 'error', url: 'string' },
      //     { status: 'done', url: 'string' },
      //     { status: 'error', url: 'string' },
      //     { status: 'done', url: 'string' },
      //     { status: 'done', url: 'string' },
      //     { status: 'padding', url: 'string' },
      //     { status: 'padding', url: 'string' },
      //     { status: 'padding', url: 'string' },
      //     { status: 'done', url: 'string' },
      //     { status: 'done', url: 'string' },
      //     { status: '', url: 'string' },
      //     { status: '', url: 'string' },
      //     { status: '', url: 'string' },
      //     { status: '', url: 'string' },
      //     { status: '', url: 'string' },
      //     { status: '', url: 'string' },
      //     { status: '', url: 'string' },
      //     { status: '', url: 'string' },
      //     { status: '', url: 'string' },
      //     { status: '', url: 'string' },
      //   ],
      //   lastLogin: Date.now(),
      // }),
      this.list = list.map(item => ({
        ...item,
        status: item.status === SOURCE_STATUS.DONE ? SOURCE_STATUS.DONE : SOURCE_STATUS.PAUSED,
      }))
    },
    async add(download: Source) {
      const res = { ...download, lastLogin: Date.now() }
      await db.downloadList.put({ ...res, links: download.links.map(link => ({ ...link, url: '' })) })
      this.list.unshift(res)
      this.startDownload()
    },
    pause(download: Source) {
      download.status = SOURCE_STATUS.PAUSED
      stopCount(download)
      this.startDownload()
    },
    resume(download: Source) {
      download.status = SOURCE_STATUS.READY
      // this.pauseLine[download.id]?.forEach(res => {
      //   res()
      // })
      // delete this.pauseLine[download.id]
      this.startDownload(download.id)
    },
    async remove(download: Source) {
      if (download.status === SOURCE_STATUS.DOWNLOADING) {
        this.deleteLine[download.id] = true
      }
      stopCount(download)
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
    async updateStatus(id: string, index: number, status: LINK_STATUS) {
      const i = this.list.findIndex(item => item.id === id)
      if (i === -1) return
      this.list[i].links[index].status = status
      await db.downloadList.put({ ...this.list[i], links: this.list[i].links.map(link => ({ ...link, url: '' })) })
    },
    async startDownload(id?: string) {
      const config = useConfig()
      if (this.list.filter(item => item.status === SOURCE_STATUS.DOWNLOADING).length >= config.tasks) return
      const startItem = this.list.findLast(item => (!id || item.id === id) && item.status === SOURCE_STATUS.READY)
      if (!startItem) return
      startItem.status = SOURCE_STATUS.DOWNLOADING
      startCount(startItem)
      if(!startItem.links.every(link => link.url)) {
        const newItem = await retryDownload(startItem)
        if (!newItem) return
        startItem.links = newItem.links
      }
      const waiter = new Waiter()
      await db.downloadList.put({ ...startItem, links: startItem.links.map(link => ({ ...link, url: '' })) })
      // for (let i = 0; i < startItem.links.length; i++) {
      //   // 检查是否已删除
      //   if (this.deleteLine[startItem.id]) {
      //     delete this.deleteLine[startItem.id]
      //     return
      //   }
      //   if (startItem.status === 'paused') {
      //     // await new Promise(resolve => this.pauseLine[startItem.id] = [...(this.pauseLine[startItem.id] || []), resolve]);
      //     this.pauseDownload(startItem)
      //     return
      //   }
      //   if (startItem.links[i].status === 'done') continue
      //   if (startItem.links.filter(e => e.status === 'padding' || e.status === 'error').length >= config.process) {
      //     await waiter.wait()
      //   }
      //   this.downloadItem(startItem, i, waiter, config)
      // }
      const isStatusPaused = (s: SOURCE_STATUS): boolean => s === SOURCE_STATUS.PAUSED;
      while(startItem.links.some(link => link.status !== LINK_STATUS.DONE)) {
        if (this.deleteLine[startItem.id]) {
          delete this.deleteLine[startItem.id]
          return
        }
        if (isStatusPaused(startItem.status)) {
          // await new Promise(resolve => this.pauseLine[startItem.id] = [...(this.pauseLine[startItem.id] || []), resolve]);
          this.pauseDownload(startItem)
          return
        }
        const index = startItem.links.findIndex(link => !link.status || link.status === LINK_STATUS.READY)
        if (index === -1) {
          await waiter.wait()
          continue
        }
        if (startItem.links.filter(e => e.status === LINK_STATUS.PADDING || e.status === LINK_STATUS.ERROR).length >= config.process) {
          await waiter.wait()
        }
        this.downloadItem(startItem, index, waiter, config)
      }
    },
    downloadItem(video: Source, index: number, waiter: Waiter, config: ReturnType<typeof useConfig>, times = 1) {
      video.links[index].status = LINK_STATUS.PADDING
      downloadList[video.id] = [...(downloadList[video.id] || []), index]
      const path = `${video.title}/${String(index).padStart(5, '0')}${video.links[index].url.split('/').reverse()[0]}`
      // console.log(
      //   '正在下载的进程数：',
      //   video.links.filter(e => e.status === LINK_STATUS.PADDING).length,
      //   '包含错误的进程数',
      //   video.links.filter(e => e.status === LINK_STATUS.PADDING || e.status === LINK_STATUS.ERROR).length,
      // )
      return invoke<Res<ResStatus<LINK_STATUS>>>('download_item', {
        url: video.links[index].url,
        path,
      }).then(async (res) => {
        if (!this.list.some(v => v.id === video.id)) return
        if (video.status === SOURCE_STATUS.PAUSED) {
          // await new Promise(resolve => this.pauseLine[video.id] = [...(this.pauseLine[video.id] || []), resolve]);
          this.pauseDownload(video)
          return
        }
        video.links[index].status = res.data.status
        const ind = downloadList[video.id].findIndex(ind => ind === index)
        downloadList[video.id].splice(ind, 1)
        await db.downloadList.put({ ...video, links: video.links.map(link => ({ ...link, url: '' })) })
        if (video.links.filter(e => e.status === LINK_STATUS.PADDING || e.status === LINK_STATUS.ERROR).length < config.process) {
          waiter.emit()
        }
        if (!video.links.every(link => link.status === LINK_STATUS.DONE) || video.status === SOURCE_STATUS.DONE) return``
        this.combineDownload(video);
        this.startDownload();
      }).catch(async (error) => {
        // console.log('error:', error)
        if (video.status === SOURCE_STATUS.PAUSED) {
          this.pauseDownload(video)
          // await new Promise(resolve => this.pauseLine[video.id] = [...(this.pauseLine[video.id] || []), resolve]);
          return
        }
        if (['', LINK_STATUS.READY, LINK_STATUS.PASS, LINK_STATUS.DONE].includes(video.links[index].status)) return // 手动修改状态的下载项，不再做响应
        video.links[index].status = LINK_STATUS.ERROR
        const ind = downloadList[video.id].findIndex(ind => ind === index)
        downloadList[video.id].splice(ind, 1)
        await wait()
        if (['', LINK_STATUS.READY, LINK_STATUS.PASS, LINK_STATUS.DONE].includes(video.links[index].status)) return // 手动修改状态的下载项，不再做响应
        if (times > 3) {
          video.links[index].status = LINK_STATUS.PASS
        } else {
          await this.downloadItem(video, index, waiter, config, times + 1)
        }
        return
      })
    },
    async combineDownload(video: Source) {
      video.status = SOURCE_STATUS.DONE
      await db.downloadList.put({ ...video, links: video.links.map(link => ({ ...link, url: '' })) })
      const combineRes = await invoke<Res<ResStatus>>('combine_splits', {
        name: video.title,
        fileType: video.links[0].url.split('.').reverse()[0],
      });
      if (combineRes.code !== 0 || combineRes.data.status !== SOURCE_STATUS.DONE) {
        // video.status = 'done'
        // video.links.forEach(link => link.status = '')
        // await db.downloadList.put({ ...video, links: video.links.map(link => ({ ...link, url: '' })) })
        retryCombine(video)
        return
      }
      stopCount(video)
    },
    pauseDownload(video: Source) {
      delete downloadList[video.id]
    }
  }
})


