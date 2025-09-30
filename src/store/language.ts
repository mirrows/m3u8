import { languages, i18n } from '@/languages'

import { defineStore } from 'pinia'

export const useLanguageStore = defineStore('language', {
  state: () => ({
    curStr: 'zh-cn',
    locale: i18n['zh-cn'],
    cur: languages['zh-cn']
  }),
  actions: {
    setLocale(locale: string) {
      this.curStr = locale
      this.locale = i18n[locale]
      this.cur = languages[locale]
    }
  }
})
