
import { defineStore } from 'pinia'

export const useDownloadHistory = defineStore('history', {
  state: () => ({
    list: [] as VideoMsg[],
  }),
  actions: {
    add(history: VideoMsg) {
      this.list = this.list.filter(item => item.url !== history.url)
      this.list.unshift(history)
    },
    remove(history: VideoMsg) {
      this.list = this.list.filter(item => item.url !== history.url)
    }
  }
})
