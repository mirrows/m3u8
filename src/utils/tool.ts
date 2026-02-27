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

// 实现一个js函数：随机生成一个rgb色值，同时可以通过入参light: 0-1调整该色值偏亮还是偏暗
/**
 * 随机生成RGB色值
 * @param {number} light - 亮度调整值，范围0-1，0为最暗，1为最亮，默认0.5
 * @returns {string} RGB色值，格式为 'rgb(r, g, b)'
 */
export function getRandomRGB(light = 0.5) {
  // 限制light在0-1之间
  light = Math.max(0, Math.min(1, light));

  // 生成随机的RGB基础值（0-255）
  const randomR = Math.floor(Math.random() * 256);
  const randomG = Math.floor(Math.random() * 256);
  const randomB = Math.floor(Math.random() * 256);

  // 根据light值调整亮度
  // light=0时，完全变暗（0）
  // light=1时，完全变亮（255）
  // light=0.5时，保持原色。
  // 为了避免靠近0或255时概率上升，分别对暗和亮两段进行线性插值。
  const adjustChannel = (c: number) => {
    if (light < 0.5) {
      // 向黑色线性过渡
      return Math.floor(c * (light * 2));
    } else {
      // 向白色线性过渡
      return Math.floor(c + (255 - c) * ((light - 0.5) * 2));
    }
  };

  const r = adjustChannel(randomR);
  const g = adjustChannel(randomG);
  const b = adjustChannel(randomB);

  // 确保不超过合法范围
  const clamp = (v: number) => Math.min(255, Math.max(0, v));
  return `rgb(${clamp(r)}, ${clamp(g)}, ${clamp(b)})`;
}
