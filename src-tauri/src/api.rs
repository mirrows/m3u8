use serde::{Serialize, Deserialize};
use std::{thread, time::{self, SystemTime, UNIX_EPOCH}};

use crate::utils::tools::replace_url;

#[derive(Debug, Serialize)]
pub struct Quality {
  name: String,
  url: String,
  size: String,
}

#[derive(Debug, Serialize)]
pub struct VideoMsg {
  name: String,
  url: String,
  poster_url: String,
  timestamp: u64,
  quality: Vec<Quality>,
}

#[derive(Debug, Serialize)]
pub struct Res<T> {
  code: i32,
  msg: String,
  data: T,
}

#[derive(Debug, Serialize)]
pub struct Source {
  id: String,
  name: String,
  poster_url: String,
  size: String,
  size_str: String,
  timestamp: u64,
  time_str: String,
  url: String,
  links: Vec<Link>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Link {
  status: String,
  url: String,
  bytes: Vec<u8>,
}

#[tauri::command]
pub async fn parse_site(url: String) -> Result<Res::<VideoMsg>, String> {

  thread::sleep(time::Duration::from_secs(2));

  let name = String::from("video name");
  let vec = vec!["360p.m3u8".to_string(), "480p.m3u8".to_string(), "720p.m3u8".to_string(), "1080p.m3u8".to_string()];
  let quality_urls = replace_url(url.to_string(), vec.clone());
  let mut quality = Vec::new();
  for (i, url) in quality_urls.iter().enumerate() {
    quality.push(Quality {
      name: format!("{}", vec[i]),
      url: url.to_string(),
      size: format!("{}", 36 * (i + 1) * 1024 * 1024),
    });
  }
  let timestamp = SystemTime::now()
    .duration_since(UNIX_EPOCH)
    .unwrap()
    .as_secs(); // Get seconds since epoch

  let res = Res::<VideoMsg> {
    code: 0,
    msg: String::from("success"),
    data: VideoMsg {
      name,
      url: url.to_string(),
      timestamp: timestamp,
      poster_url: String::from("https://img95.699pic.com/photo/40245/5679.jpg_wh860.jpg"),
      quality: quality,
    }
  };
  Ok(res)
}

#[tauri::command]
pub async fn download_video(url: String, name: String, links: Vec<String>, poster_url: String, size: String, size_str: String, time_str: String, timestamp: u64) -> Result<Res::<Source>, String> {
  thread::sleep(time::Duration::from_secs(2));
  let mut source = Source {
    id: String::from(""),
    name,
    poster_url,
    size,
    size_str,
    timestamp,
    time_str,
    url,
    links: links.iter().map(|link| Link {
      status: String::from(""),
      url: link.to_string(),
      bytes: Vec::new(),
    }).collect(),
  };

  for (i, link) in source.links.iter_mut().enumerate() {
    link.status = String::from("ready");
    link.url = format!("{}/dev_{}.ts", source.url, i);
  }

  println!("url: {}, name: {}", source.url.to_string(), source.name.to_string());

  let res = Res::<Source> {
    code: 0,
    msg: String::from("success"),
    data: source,
  };

  Ok(res)
}