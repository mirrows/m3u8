
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
    },
    update(download: Partial<Source>) {
      this.list = this.list.map(item => item.id === download.id ? { ...item, ...download } : item)
    }
  }
})
