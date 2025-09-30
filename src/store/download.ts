
import { defineStore } from 'pinia'

export const useDownload = defineStore('download', {
  state: () => ({
    list: [] as Source[],
  }),
  actions: {
    add(download: Source) {
      this.list.unshift(download)
    },
    remove(download: Source) {
      this.list = this.list.filter(item => item.id !== download.id)
    }
  }
})
