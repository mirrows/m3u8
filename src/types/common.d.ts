export type VideoMsg = {
  title: string;
  name: string;
  url: string;
  posterUrl: string;
  timestamp: number;
  timeStr?: string;
  quality: {
    name: string;
    url: string;
    size: string;
    sizeStr?: string;
  }[];
  lastLogin: number,
}

export type Res<T> = {
  code: number,
  msg: string,
  data: T,
}


export type Source = {
  id: string,
  title: string,
  name: string,
  posterUrl: string,
  size: string,
  sizeStr: string,
  timestamp: number,
  timeStr: string,
  status: string,
  url: string,
  siteUrl: string,
  links: Link[],
  lastLogin: number,
}

export enum SOURCE_STATUS {
  READY = 'ready',
  DOWNLOADING = 'downloading',
  DONE = 'done',
  ERROR = 'error',
}

export type Link = {
  status: string,
  url: string,
  // bytes: any[],
}

export enum LINK_STATUS {
  PADDING = 'padding',
  DONE = 'done',
  ERROR = 'error',
}

export type ResStatus = {
  status: string,
  errMsg: string,
}

