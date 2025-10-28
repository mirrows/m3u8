
import { getDownloadDir } from '@/utils/tool'
import { defineStore } from 'pinia'

export const useConfig = defineStore('config', {
  state: () => ({
    downloadFolder: '',
    tasks: 3,
    process: 10,
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
        this.tasks = config.tasks || this.tasks
        this.process = config.process || this.process
      }
    },
    setFolder(folder: string) {
      this.downloadFolder = folder
      localStorage.setItem('config', JSON.stringify(this.$state))
    },
    setConfig(config: Partial<typeof this.$state>) {
      Object.assign(this.$state, {
        ...config
      })
      localStorage.setItem('config', JSON.stringify(this.$state))
    }
  }
})
