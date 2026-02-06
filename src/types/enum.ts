
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
  READY = 'ready',
  PADDING = 'padding',
  PASS = 'pass',
  DONE = 'done',
  ERROR = 'error',
}

export enum TO_LINK_STATUS {
  ready = 'READY',
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

export enum ParseType {
  XHAMSTER,
  NORMAL
}
