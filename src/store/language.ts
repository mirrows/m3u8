import { languages, i18n } from '@/languages'

import { defineStore } from 'pinia'

export const useLanguageStore = defineStore('language', {
  state: () => ({
    locale: i18n['zh-cn'],
    curLanguage: languages['zh-cn']
  }),
  actions: {
    setLocale(locale: string) {
      this.locale = i18n[locale]
      this.curLanguage = languages[locale]
    }
  }
})