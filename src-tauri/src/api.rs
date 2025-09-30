use serde::{Serialize, Deserialize};
use std::{thread, time::{self, SystemTime, UNIX_EPOCH}};

use crate::utils::tools::replace_url;
use uuid::Uuid;
#[derive(Debug, Serialize)]
pub struct Quality {
  name: String,
  url: String,
  size: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
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
#[serde(rename_all = "camelCase")]
pub struct Source {
  id: String,
  title: String,
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
pub async fn download_video(url: String, name: String, poster_url: String, size: String, size_str: String, time_str: String, timestamp: u64, title: String) -> Result<Res::<Source>, String> {
  
  thread::sleep(time::Duration::from_secs(2));
  let links: Vec<&str> = [
    "https://www.baidu.com/11.ts",
    "://www.baidu.com/12.ts",
    "/13.ts",
    "14.ts",
    "/15.ts",
  ].to_vec();
  let mut source = Source {
    id: Uuid::new_v4().to_string(),
    title,
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

  for (_i, link) in source.links.iter_mut().enumerate() {
    link.status = String::from("ready");
    if link.url.starts_with("://") {
      link.url = format!("https{}", link.url);
    } else if link.url.starts_with("/") {
      let mut url_vec: Vec<&str> = source.url.split("/").collect();
      url_vec.pop();
      link.url = format!("{}{}", url_vec.join("/"), link.url);
    } else if link.url.starts_with("http") {
      link.url = format!("{}", link.url);
    } else {
      let mut url_vec: Vec<&str> = source.url.split("/").collect();
      url_vec.pop();
      url_vec.push(&link.url);
      link.url = url_vec.join("/");
    }
  }

  println!("url: {}, name: {}", source.url.to_string(), source.name.to_string());

  let res = Res::<Source> {
    code: 0,
    msg: String::from("success"),
    data: source,
  };

  Ok(res)
}