
use std::{thread, time::{self, SystemTime, UNIX_EPOCH}};
use crate::utils::types::{VideoMsg, Res, Link, Source};
use regex::Regex;

use crate::utils::tools::{fetch_and_process, handle_body, transform_text, query_qualitys, query_ts_list};
use uuid::Uuid;

#[tauri::command]
pub async fn parse_site(url: String) -> Result<Res::<VideoMsg>, String> {
  eprintln!("start parse site: {}", url);
  let body = match fetch_and_process(&url, 5).await {
    Ok(body) => body, // 这里是从 Result 中提取 String
    Err(e) => {
      eprintln!("Error: {}", e);
      return Err("error".to_string()); // 如果发生错误则返回
    }
  };
  // 定义正则表达式来提取 <title> 和 <link> 标签
  let title_re = Regex::new(r#"<title\s*>(.*?)</title>"#).unwrap();
  let poster_re = Regex::new(r#"<div\s+class=\"xp-preload-image\"\s+style=\"background-image:\s*url\(\'(https?://[^\']+)\'\);\""#).unwrap();
  let link_re = Regex::new(r#"<link\s+rel="preload"\s+href="(https?://[^\"]+\.m3u8)"#).unwrap();
  let mut title = handle_body(&body, title_re);
  title = transform_text(&title);
  let poster = handle_body(&body, poster_re);
  let link = handle_body(&body, link_re);
  eprintln!("title: {}, poster: {}, links: {}", title, poster, link);
  let quality_body = match fetch_and_process(&link, 5).await {
    Ok(body) => body, // 这里是从 Result 中提取 String
    Err(e) => {
      eprintln!("Error: {}", e);
      return Err("error".to_string()); // 如果发生错误则返回
    }
  };
  let quality = query_qualitys(&quality_body, &link);

  let timestamp = SystemTime::now()
    .duration_since(UNIX_EPOCH)
    .unwrap()
    .as_secs(); // Get seconds since epoch

  let res = Res::<VideoMsg> {
    code: 0,
    msg: String::from("success"),
    data: VideoMsg {
      name: title,
      url: url.to_string(),
      timestamp: timestamp,
      poster_url: poster.to_string(),
      quality: quality,
    }
  };
  Ok(res)
}

#[tauri::command]
pub async fn download_video(url: String, name: String, poster_url: String, size: String, size_str: String, time_str: String, timestamp: u64, title: String) -> Result<Res::<Source>, String> {
  
  eprintln!("start download url: {}", url);
  thread::sleep(time::Duration::from_secs(2));

  let body = match fetch_and_process(&url, 5).await {
    Ok(body) => body, // 这里是从 Result 中提取 String
    Err(e) => {
      eprintln!("Error: {}", e);
      return Err("error".to_string()); // 如果发生错误则返回
    }
  };
  eprintln!("body: {}", body);
  let links = query_ts_list(&body, &url);

  // let links: Vec<&str> = [
  //   "https://www.baidu.com/11.ts",
  //   "://www.baidu.com/12.ts",
  //   "/13.ts",
  //   "14.ts",
  //   "/15.ts",
  // ].to_vec();
  let source = Source {
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

  // for (_i, link) in source.links.iter_mut().enumerate() {
  //   link.status = String::from("ready");
  //   if link.url.starts_with("://") {
  //     link.url = format!("https{}", link.url);
  //   } else if link.url.starts_with("/") {
  //     let mut url_vec: Vec<&str> = source.url.split("/").collect();
  //     url_vec.pop();
  //     link.url = format!("{}{}", url_vec.join("/"), link.url);
  //   } else if link.url.starts_with("http") {
  //     link.url = format!("{}", link.url);
  //   } else {
  //     let mut url_vec: Vec<&str> = source.url.split("/").collect();
  //     url_vec.pop();
  //     url_vec.push(&link.url);
  //     link.url = url_vec.join("/");
  //   }
  // }

  println!("url: {}, name: {}", source.url.to_string(), source.name.to_string());

  let res = Res::<Source> {
    code: 0,
    msg: String::from("success"),
    data: source,
  };

  Ok(res)
}