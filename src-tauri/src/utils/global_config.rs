use once_cell::sync::Lazy;
use std::sync::Mutex;
use std::collections::HashMap;

pub static GLOBAL_MAP: Lazy<Mutex<HashMap<String, String>>> = Lazy::new(|| {
  let mut m = HashMap::new();
  m.insert("folder".to_string(), "".to_string());
  Mutex::new(m)
});