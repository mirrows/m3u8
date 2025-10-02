use reqwest::header::{HeaderMap, HeaderValue}; // 添加此行导入头相关类型
use std::cmp;
use reqwest::Client;
use regex::Regex;
use tokio::time::{sleep, Duration};
use tokio;
use crate::utils::types::Quality;



pub fn replace_url(url: String, filenames: Vec<String>) -> Vec<String> {
  let parts = url.split("/").collect::<Vec<&str>>();
  if parts.len() < 2 {
    return filenames;
  }
  let prefix = parts[0..parts.len() - 1].join("/");
  let res = filenames.iter().map(|filename| {
    format!("{}/{}", prefix, filename)
  }).collect::<Vec<String>>();
  res
}

// fetch_and_process 函数：用于发送请求并调用回调函数处理响应
pub async fn fetch_and_process(
  url: &str,
  retries: usize,
) -> Result<String, reqwest::Error>
{
  let mut headers = HeaderMap::new();
  headers.insert(
      "User-Agent",
      HeaderValue::from_static("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36")
  );
  let client = Client::builder()
      .default_headers(headers) // 使用HeaderMap设置头
      .build()?;  // 使用?传播构建错误
  let mut attempt = 0;

  // 尝试请求，最多重试 `retries` 次
  loop {
      let result = async {
          // 发送 GET 请求并获取响应
          let response = client.get(url).send().await;

          match response {
              Ok(resp) => {
                  // 获取响应体的文本
                  let body = resp.text().await?;
                  Ok(body)
              }
              Err(e) => Err(e),
          }
      }
      .await;

      match result {
          Ok(data) => return Ok(data), // 成功时直接返回
          Err(e) if attempt < retries => {
              // 如果失败并且还有重试次数，则等待一段时间再重试
              attempt += 1;
              println!("Error occurred (attempt {}), {} retrying...", attempt, e);
              sleep(Duration::from_secs(2)).await; // 等待 2 秒后重试
          }
          Err(e) => return Err(e), // 如果超出了重试次数，返回错误
      }
  }
}

pub fn transform_text(input: &str) -> String {
  // 创建一个正则表达式，匹配非中英文字符（Unicode范围）
  let re = Regex::new(r"[^\w\u4e00-\u9fa5]").unwrap();
  // 替换所有匹配的字符为 "_"
  re.replace_all(input, "_").to_string()
}

pub fn handle_body(body: &str, reg: Regex) -> String {
  let mut res = String::new();
  // 提取 <title> 内容
  if let Some(capture) = reg.captures(body) {
    res = capture[1].to_string();
  } else {
    println!("capture not thing");
  }
  res
  // 将整个 HTML 保存在变量里并打印
  // println!("\nHTML Content Saved: \n{}", body);
}

pub fn query_qualitys(body: &str, base_url: &str) -> Vec<Quality> {
  println!("body: {}", body);
  let mut vec = Vec::new();
  let re = Regex::new(r"(?m)^#EXT-X-STREAM-INF:.*?BANDWIDTH=(\d+).*?RESOLUTION=(\d+x\d+)\S*\r?\n(\S+\.m3u8)$").unwrap();
  for capture in re.captures_iter(body) {
      vec.push(Quality {
          name: capture[2].to_string(),
          size: capture[1].to_string(),
          url: complete_url(&base_url, &capture[3].to_string()),
      });
  }
  vec
}

pub fn complete_url(base_url: &str, relative_url: &str) -> String {
  let mut str = relative_url.to_string();
  let mut res_str = base_url.to_string();
  if relative_url.starts_with("http") {
    return String::from(relative_url);
  }
  if relative_url.starts_with("//") {
    eprintln!("relative_urlgg: {}", relative_url);
    return format!("https:{}", relative_url);
  }
  if relative_url.starts_with("/") {
    let relative_url_vec = relative_url.split("/").collect::<Vec<&str>>();
    if relative_url_vec.len() > 1 {
      let res_str_vec = res_str.split("/").collect::<Vec<&str>>();
      let end = cmp::max(4, res_str_vec.len() - relative_url_vec.len() + 1);
      res_str = res_str_vec[0..end].join("/");
    }
    str = str[1..].to_string();
  }
  let res_str_vec = res_str.split("/").collect::<Vec<&str>>();
  res_str = res_str_vec[0..res_str_vec.len() - 1].join("/");
  format!("{}/{}", res_str, str)
}

pub fn query_ts_list(body: &str, base_url: &str) -> Vec<String> {
  let mut vec = Vec::new();
  let re = Regex::new(r"(?m)^([^#]\S+)$").unwrap();
  for capture in re.captures_iter(body) {
    vec.push(complete_url(&base_url, &capture[1].to_string()));
  }
  vec
}