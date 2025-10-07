
import type { VideoMsg } from '@/types/common'
import { defineStore } from 'pinia'
import { db } from '@/db'
import { load } from '@tauri-apps/plugin-store'

export const useDownloadHistory = defineStore('history', {
  state: () => ({
    list: [] as VideoMsg[],
  }),
  actions: {
    async load() {
      this.list = await db.history.orderBy('lastLogin').reverse().toArray()
    },
    async add(history: VideoMsg) {
      console.log('add history:', history);
      await db.history.put({ ...history, lastLogin: Date.now() })
      this.list = this.list.filter(item => item.url !== history.url)
      this.list.unshift(history)
    },
    async remove(history: VideoMsg) {
      await db.history.delete(history.url)
      this.list = this.list.filter(item => item.url !== history.url)
    }
  }
})
