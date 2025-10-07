// src/db/index.ts
import type { Source, VideoMsg } from '@/types/common'
import Dexie, { type Table } from 'dexie'

export class AppDB extends Dexie {
  history!: Table<VideoMsg, string>
  downloadList!: Table<Source, string>

  constructor() {
    super('AppDatabase')
    this.version(1).stores({
      history: 'url, name, lastLogin',
      downloadList: 'id, name, lastLogin, url'
    })
  }
}

export const db = new AppDB()
