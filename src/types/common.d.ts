type VideoMsg = {
  name: string;
  url: string;
  poster_url?: string;
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

