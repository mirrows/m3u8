
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
  DONE = 'done',
  ERROR = 'error',
}

export enum TO_LINK_STATUS {
  padding = 'PADDING',
  done = 'DONE',
  error = 'ERROR',
}

export enum PROGRESS_MAP {
  READY = '',
  PAUSED = '',
  DOWNLOADING = 'warning',
  DONE = 'success',
  ERROR = 'exception'
}
