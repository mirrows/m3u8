import { useLanguageStore } from "@/store/language"
import { ElMessageBox } from "element-plus"

const language = useLanguageStore()

export const parseSize = (size: number) => {
  const units = ['B', 'K', 'M', 'G', 'T']
  let index = 0
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024
    index++
  }
  return `${+size.toFixed(2)} ${units[index]}`
}

type ConfirmDeleteParams = {
  cb: Function,
  msg?: string,
}
export const confirmD = ({ cb, msg = language.cur.confirmDelete }: ConfirmDeleteParams) => {
  console.log(language.cur)
  return new Promise((resolve, reject) => {
    ElMessageBox.confirm(msg, language.cur.tips, {
      confirmButtonText: language.cur.confirm,
      cancelButtonText: language.cur.cancel,
      type: 'warning',
    }).then(async () => {
      await cb()
      resolve(true)
    }).catch(() => {
      console.log('删除已取消')
      reject(false)
    })
  })
}
