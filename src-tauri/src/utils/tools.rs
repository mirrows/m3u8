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