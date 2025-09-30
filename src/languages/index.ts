import parseZh from './zh.json'
import parseEn from './en.json'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'

export const languagesMap: Record<string, { parseLang: Record<string, string>, i18n: any }> = {
  'zh-cn': {
    parseLang: parseZh,
    i18n: zhCn,
  },
  'en': {
    parseLang: parseEn,
    i18n: en,
  }

}

export const languageKeys = Object.keys(languagesMap)

const i18n: Record<string, any> = {}
const languages: Record<string, any> = {}

Object.keys(languagesMap).forEach(key => {
  i18n[key] = languagesMap[key].i18n
  languages[key] = languagesMap[key].parseLang
})

export {
  i18n,
  languages
}





