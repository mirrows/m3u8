use crate::utils::types::{Quality, ResStatus};
use regex::Regex;
use reqwest::header::{HeaderMap, HeaderValue}; // 添加此行导入头相关类型
use reqwest::Client;
use std::cmp;
use std::process::Command;
use std::{thread, time};
use tokio::fs;
use tokio::time::{sleep, Duration};

pub fn replace_url(url: String, filenames: Vec<String>) -> Vec<String> {
    let parts = url.split("/").collect::<Vec<&str>>();
    if parts.len() < 2 {
        return filenames;
    }
    let prefix = parts[0..parts.len() - 1].join("/");
    let res = filenames
        .iter()
        .map(|filename| format!("{}/{}", prefix, filename))
        .collect::<Vec<String>>();
    res
}

// fetch_and_process 函数：用于发送请求并调用回调函数处理响应
pub async fn fetch_and_process(url: &str, retries: usize) -> Result<String, reqwest::Error> {
    let mut headers = HeaderMap::new();
    headers.insert(
      "User-Agent",
      HeaderValue::from_static("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36")
  );
    let client = Client::builder()
        .default_headers(headers) // 使用HeaderMap设置头
        .build()?; // 使用?传播构建错误
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
    let re = Regex::new(r"[^\w\u4e00-\u9fa5\s\!\(\),\.（）\?，\-·]").unwrap();
    // 替换所有匹配的字符为 "_"
    re.replace_all(input, "").to_string()
}

pub fn handle_body(body: &str, reg: Regex) -> String {
    let mut res = String::new();
    // 提取 <title> 内容
    if let Some(capture) = reg.captures(body) {
        if let Some(matched) = capture.get(1) {
            res = matched.as_str().to_string();
        }
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
    let re = Regex::new(
        r"(?m)^#EXT-X-STREAM-INF:.*?BANDWIDTH=(\d+).*?RESOLUTION=(\d+x\d+)\S*\r?\n(\S+\.m3u8)$",
    )
    .unwrap();
    for capture in re.captures_iter(body) {
        vec.push(Quality {
            name: capture[2].to_string(),
            size: capture[1].to_string(),
            url: complete_url(&base_url, &capture[3].to_string()),
        });
    }
    if vec.is_empty() {
        vec.push(Quality {
            name: "default".to_string(),
            size: "0".to_string(),
            url: base_url.to_string(),
        })
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
    let init_re = Regex::new("#EXT-X-MAP:URI=[\'\"]([^\'\"]*?)[\'\"]\r?\n").unwrap();
    if let Some(capture) = init_re.captures(body) {
        vec.push(complete_url(&base_url, &capture[1].to_string()));
    }
    vec
}

pub async fn ffmpeg_combine(
    source_path: &str,
    target_path: &str,
    init_path: &str,
    source_type: &str,
) -> Result<ResStatus, String> {
    let mut times = 0;
    let mut res = ResStatus {
        status: "done".to_string(),
        err_msg: "".to_string(),
    };
    loop {
        // 拼接 concat 协议格式路径
        let concat_input = if source_type == "m4s" {
            format!("concat:{}|{}", init_path, source_path)
        } else {
            format!("{}", source_path)
        };
        // let concat_input = format!("concat:{}|{}", init_path, output_file_path);
        // let output_final_file_path = format!("{}/video__output/{}.{}", DOWNLOAD_DIR, name, FILE_TYPE);
        // 调用 ffmpeg
        let status = Command::new("ffmpeg")
            .args(&["-i", &concat_input, "-c", "copy", "-y", &target_path])
            .status()
            .expect("failed to execute ffmpeg");

        if status.success() {
            println!("合并成功，输出文件位于 {}", target_path);
            // 删除临时文件
            fs::remove_file(&source_path)
                .await
                .map_err(|e| e.to_string())?;
            break;
        } else {
            eprintln!("FFmpeg 合并失败, {} 即将重试...", target_path);
            times += 1;
            if times >= 5 {
                res.status = "done".to_string();
                res.err_msg = format!("FFmpeg 合并失败, {} 重试 5 次后仍失败", target_path);
                break;
            }
            thread::sleep(time::Duration::from_secs(2));
        }
    }
    Ok(res)
}

pub fn check_ffmpeg_installed() -> Result<String, String> {
    // 尝试执行 "ffmpeg -version" 来检查 FFmpeg 是否已安装
    let output = Command::new("ffmpeg").arg("-version").output();

    match output {
        Ok(output) if output.status.success() => {
            // FFmpeg 已安装
            Ok(String::from("FFmpeg is installed"))
        }
        _ => {
            // FFmpeg 未安装，显示提示
            Err("FFmpeg not installed".to_string())
        }
    }
}
