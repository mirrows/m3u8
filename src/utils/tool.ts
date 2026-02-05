import { useLanguageStore } from "@/store/language"
import { ElMessage, ElMessageBox } from "element-plus"
import { platform } from '@tauri-apps/plugin-os';
import { open } from '@tauri-apps/plugin-dialog';
import { downloadDir } from "@tauri-apps/api/path"

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
export const confirmD = ({ cb, msg = '' }: ConfirmDeleteParams) => {
  const language = useLanguageStore()
  return new Promise((resolve, reject) => {
    ElMessageBox.confirm(msg || language.cur.confirmDelete, language.cur.tips, {
      confirmButtonText: language.cur.confirm,
      cancelButtonText: language.cur.cancel,
      type: 'warning',
    }).then(async () => {
      await cb()
      resolve(true)
    }).catch(() => {
      console.log('已取消')
      reject(false)
    })
  })
}

export const wait = (ms = 2000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, ms)
  })
}

export const copy = (link: string) => {
  /* 复制内容到文本域 */
  const language = useLanguageStore()
  const curLanguage = language.cur
 navigator.clipboard.writeText(link);
 ElMessage.success(curLanguage.copied);
}

export async function selectFolder() {
  const p = await platform();
  const isMobile = p === 'android' || p === 'ios';

  if (isMobile) {
    // TODO: 使用自定义移动端插件或提示不支持
    ElMessageBox.alert('移动端暂不支持目录选择');
    return null;
  } else {
    const path = await open({ directory: true, multiple: false });
    return path;
  }
}

/**
 * 检查/请求存储权限 (仅 Android 生效)
 * - Android 13+ 使用 `requestPermissions`
 * - 其它平台直接通过
 */
export async function ensureDownloadPermission(): Promise<boolean> {
  const os = await platform();

  if (os !== "android") {
    // 非安卓默认通过
    return true;
  }

  try {
    // 兼容老版本 Android：部分 Tauri WebView 支持 navigator.permissions
    if ("permissions" in navigator) {
      console.log("checking permission...");
    }

    // 通过原生 JS 接口请求权限（部分 WebView 有效）
    // @ts-ignore
    if (window.AndroidInterface?.requestPermissions) {
      // @ts-ignore
      const result = await window.AndroidInterface.requestPermissions([
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
      ]);
      console.log("权限结果:", result);
      return result === "granted" || result === true;
    }

    // fallback: 主动提示用户手动授权
    alert("请在系统设置中为此应用授予存储权限");
    return false;
  } catch (err) {
    console.error("权限检查失败:", err);
    return false;
  }
}

export async function getDownloadDir() {
  const ok = await ensureDownloadPermission();
  if (!ok) {
    throw new Error("无存储权限，无法访问下载目录");
  }

  const path = await downloadDir();
  console.log("下载目录：", path);
  return path;
}

export class Waiter {
  res: Function[]
  constructor() {
    this.res = [];
  }
  async wait() {
    return new Promise((res) => {
      this.res.push(res)
    })
  }

  async emit() {
    if (!this.res) return
    const fn = this.res.shift()
    if(!fn) return
    await fn()
  }
}
