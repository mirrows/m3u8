
import { defineStore } from 'pinia'

export const useConfig = defineStore('config', {
  state: () => ({
    folder: '',
  }),
  actions: {
    setFolder(folder: string) {
      this.folder = folder
    },
  }
})
