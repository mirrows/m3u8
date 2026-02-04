
export enum SOURCE_STATUS {
  READY = 'ready',
  DOWNLOADING = 'downloading',
  PAUSED = 'paused',
  DONE = 'done',
  ERROR = 'error',
}

export enum TO_SOURCE_STATUS {
  ready = 'READY',
  downloading = 'DOWNLOADING',
  paused = 'PAUSED',
  done = 'DONE',
  error = 'ERROR',
}

export enum LINK_STATUS {
  PADDING = 'padding',
  PASS = 'pass',
  DONE = 'done',
  ERROR = 'error',
}

export enum TO_LINK_STATUS {
  padding = 'PADDING',
  pass = 'PASS',
  done = 'DONE',
  error = 'ERROR',
}

// 進度條配置
export enum PROGRESS_MAP {
  READY = '',
  PAUSED = '',
  DOWNLOADING = 'warning',
  DONE = 'success',
  ERROR = 'exception'
}
