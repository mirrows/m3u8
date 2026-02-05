import type { LINK_STATUS, SOURCE_STATUS } from "./enum";

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
  status: SOURCE_STATUS,
  url: string,
  siteUrl: string,
  links: Link[],
  lastLogin: number,
}

export type Link = {
  status: LINK_STATUS,
  url: string,
  // bytes: any[],
}

export type ResStatus = {
  status: string,
  errMsg: string,
}

