
use std::{thread, time::{self, SystemTime, UNIX_EPOCH}};
use crate::utils::types::{VideoMsg, Res, Link, Source, ResStatus};
use regex::Regex;
use tokio::fs::{self, File};
use tokio::io::{AsyncReadExt, AsyncWriteExt, BufReader, BufWriter};
use std::path::{Path, PathBuf};
use std::time::Duration;
use std::process::Command;

use crate::utils::tools::{fetch_and_process, handle_body, transform_text, query_qualitys, query_ts_list};
use uuid::Uuid;

static DOWNLOAD_DIR: &str = "E:\\download";
static FILE_TYPE: &str = "mp4"; // 固定的，要改的话使用新的变量保存，并再次执行ffmpeg

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

  let poster_re = Regex::new(r#""poster"\s*:\s*\{\s*"url"\s*:\s*"(?P<url>[^"]+)""#).unwrap();

  // let poster_re = Regex::new(r#"<div[^>]*class=["']xp-preload-image["'][^>]*style=["'][^"']*background-image:\s*url\(["'](?P<url>[^"')]+)["']\)[^>]*>"#).unwrap();
  let link_re = Regex::new(r#"<link\s+rel="preload"\s+href="(https?://[^\"]+\.m3u8)"#).unwrap();
  // println!("999 {}", body.contains("\"poster\":{\"url\":\""));
  // if !body.contains("poster=") {
  //   println!("{}", body.to_string()); // 如果发生错误则返回
  // }

  let mut title = handle_body(&body, title_re);
  title = transform_text(&title);
  let poster = handle_body(&body, poster_re);
  let poster = poster.replace(r#"\/"#, "/");
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

#[tauri::command]
pub async fn download_item(url: String, path: String) -> Result<Res::<ResStatus>, String> {
 //  eprintln!("start download video {} to path {}", url,  path);
  // thread::sleep(time::Duration::from_secs(2));
  let download_path = format!("{}/{}", DOWNLOAD_DIR, path);
  let client = reqwest::Client::builder()
    .timeout(Duration::from_secs(30)) // 设置请求超时时间
    .build().map_err(|e| e.to_string())?;
  let response = client.get(url.to_string()).send().await.map_err(|e| e.to_string())?;
  let bytes = response.bytes().await.map_err(|e| e.to_string())?;
  let download_path = Path::new(&download_path);

  // 获取父目录路径 d://download/test
  if let Some(parent_dir) = download_path.parent() {
      // 创建目录（如果不存在）
      fs::create_dir_all(parent_dir).await.map_err(|e| e.to_string())?;
  }
  let mut file = File::create(download_path).await.map_err(|e| e.to_string())?;
  file.write_all(&bytes).await.map_err(|e| e.to_string())?;

  let res = Res {
    code: 0,
    data: ResStatus {
      status: "done".to_string(),
      err_msg: path.to_string(),
    },
    msg: path.to_string(),
  };
  Ok(res)
}

#[tauri::command]
pub async fn combine_splits(name: String, file_type: String) -> Result<Res::<ResStatus>, String> {
  eprintln!("start combine splits {}.{}", name,  file_type);
  thread::sleep(time::Duration::from_secs(2));
  let input_dir = format!("{}/{}", DOWNLOAD_DIR, name);
  let output_file_path = format!("{}/video__output/{}.{}", DOWNLOAD_DIR, name, file_type);
  let mut init_path = String::new();
  let mut res = Res {
    code: 0,
    data: ResStatus {
      status: "done".to_string(),
      err_msg: name.to_string(),
    },
    msg: name.to_string(),
  };

  // 创建输出文件（异步）
  let output_file = File::create(&output_file_path).await.map_err(|e| e.to_string())?;
  let mut writer = BufWriter::new(output_file);

  // 读取目录并收集文件路径
  let mut entries = fs::read_dir(&input_dir).await.map_err(|e| e.to_string())?;
  let mut files: Vec<PathBuf> = Vec::new();

  while let Some(entry) = entries.next_entry().await.map_err(|e| e.to_string())? {
      let path = entry.path();
      if path.is_file() {
        if path.extension().map_or(false, |ext| ext.eq_ignore_ascii_case(&file_type)) {
          files.push(path);
        } else if path.extension().map_or(false, |ext| ext.eq_ignore_ascii_case(&FILE_TYPE)) {
          init_path = path.display().to_string();
        }
      }
  }

  // 排序
  files.sort_by_key(|path| path.file_name().map(|s| s.to_owned()));

  // 遍历每个文件并合并写入
  for path in files {
    println!("合并文件: {}", path.display());

    let input_file = File::open(&path).await.map_err(|e| e.to_string())?;
    let mut reader = BufReader::new(input_file);
    let mut buffer = [0u8; 8192];

    loop {
        let bytes_read = reader.read(&mut buffer).await.map_err(|e| e.to_string())?;
        if bytes_read == 0 {
            break;
        }
        writer.write_all(&buffer[..bytes_read]).await.map_err(|e| e.to_string())?;
    }
  }

  // 确保缓冲区写入磁盘
  writer.flush().await.map_err(|e| e.to_string())?;

  // 拼接 concat 协议格式路径
  let concat_input = format!("concat:{}|{}", init_path, output_file_path);
  let output_final_file_path = format!("{}/video__output/{}.{}", DOWNLOAD_DIR, name, FILE_TYPE);
  // 调用 ffmpeg
  let status = Command::new("ffmpeg")
      .args(&[
          "-i", &concat_input,
          "-c", "copy",
          &output_final_file_path,
      ])
      .status()
      .expect("failed to execute ffmpeg");

  if status.success() {
      println!("合并成功，输出文件位于 {}", output_final_file_path);
      // 删除临时文件
      fs::remove_file(&output_file_path).await.map_err(|e| e.to_string())?;
  } else {
      eprintln!("FFmpeg 合并失败");
      res.data.status = "error".to_string();
      res.data.err_msg = format!("FFmpeg 合并失败: {}", name);
  }
  
  Ok(res)
}