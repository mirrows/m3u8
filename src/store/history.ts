
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
      const newHistory = { ...history, lastLogin: Date.now() }
      await db.history.put(newHistory)
      this.list = this.list.filter(item => item.url !== newHistory.url)
      this.list.unshift(newHistory)
    },
    async edit(i:number, history: VideoMsg) {
      console.log('edit history:', history);
      const newHistory = { ...history, lastLogin: Date.now() }
      await db.history.put(newHistory)
      this.list = this.list.map((item, index) => i === index ? newHistory : item )
    },
    async remove(history: VideoMsg) {
      await db.history.delete(history.url)
      this.list = this.list.filter(item => item.url !== history.url)
    }
  }
})
