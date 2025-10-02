use serde::{Serialize, Deserialize};


#[derive(Debug, Serialize, Clone)]
pub struct Quality {
  pub name: String,
  pub url: String,
  pub size: String,
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct VideoMsg {
  pub name: String,
  pub url: String,
  pub poster_url: String,
  pub timestamp: u64,
  pub quality: Vec<Quality>,
}

#[derive(Debug, Serialize)]
pub struct Res<T> {
  pub code: i32,
  pub msg: String,
  pub data: T,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Source {
  pub id: String,
  pub title: String,
  pub name: String,
  pub poster_url: String,
  pub size: String,
  pub size_str: String,
  pub timestamp: u64,
  pub time_str: String,
  pub url: String,
  pub links: Vec<Link>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Link {
  pub status: String,
  pub url: String,
  pub bytes: Vec<u8>,
}
