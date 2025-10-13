
import { getDownloadDir } from '@/utils/tool'
import { defineStore } from 'pinia'

export const useConfig = defineStore('config', {
  state: () => ({
    downloadFolder: '',
  }),
  actions: {
    async load() {
      let config: typeof this.$state | null = null
      try {
        config = JSON.parse(localStorage.getItem('config') || '{}')
      } catch (err) {
        console.error('加载配置失败:', err)
        config = null
      }
      if (config) {
        let defaultDownloadFolder = ''
        try {
          defaultDownloadFolder = await getDownloadDir()
        } catch (err) {
          console.error('获取默认下载目录失败:', err)
        }
        this.downloadFolder = config.downloadFolder || defaultDownloadFolder
      }
    },
    setFolder(folder: string) {
      this.downloadFolder = folder
      localStorage.setItem('config', JSON.stringify(this.$state))
    },
  }
})
