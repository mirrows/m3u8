type VideoMsg = {
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
}

type Res<T> = {
  code: number,
  msg: string,
  data: T,
}

type Source = {
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
  links: Link[],
}


type Link = {
  status: string,
  url: string,
  bytes: any[],
}

