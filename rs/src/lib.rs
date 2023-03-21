extern crate cfg_if;
extern crate wasm_bindgen;
extern crate num;
extern crate js_sys;

mod color;
mod utils;

use js_sys::Uint8ClampedArray;
use num::complex::Complex;
use crate::color::ColorHSV;
use cfg_if::cfg_if;
use wasm_bindgen::prelude::*;
use wasm_bindgen::Clamped;

cfg_if! {
  if #[cfg(feature = "wee_alloc")] {
    extern crate wee_alloc;
    #[global_allocator]
    static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;
  }
}

#[wasm_bindgen]
extern "C" {
  fn alert(s: &str);
  
  #[wasm_bindgen(js_namespace = console)]
  fn log(s: &str);
}


const MAX_ITERS: u32 = 100;

fn calc_mb_iters(
  c: Complex<f64>
) -> f64 {
  let mut z: Complex<f64> = Complex::new(0.0, 0.0);
  let mut n = 0;
  while z.norm() <= 2.0 && n < MAX_ITERS {
    z = z*z + c;
    n += 1;
  }
  if n == MAX_ITERS {
    return MAX_ITERS as f64;
  }
  n as f64 + 1.0 - z.norm().log2().log10()
}

fn get_mb_color_hsv(
  iters: f64,
) -> ColorHSV {
  ColorHSV {
    h: 360.0 * iters as f64 / MAX_ITERS as f64,
    s: 1.0,
    v: if iters < MAX_ITERS as f64 { 1.0 } else { 0.0 }
  }
}

#[wasm_bindgen]
pub fn draw_mandelbrot(
  width: u32,
  height: u32,
  x_min: f64,
  x_max: f64,
  y_min: f64,
  y_max: f64
) -> Result<Uint8ClampedArray, JsValue> {
  // Generate image data
  let mut data = Vec::new(); // Flattened RGBA color data
  for i in 0..height {
    for j in 0..width {
      let x = x_min + (j as f64/width as f64)*(x_max-x_min);
      let y = y_min + (i as f64/height as f64)*(y_max-y_min);
      let iters = calc_mb_iters(Complex::new(x, y));
      let color = get_mb_color_hsv(iters).to_rgb();

      data.push(color.r);
      data.push(color.g);
      data.push(color.b);
      data.push(255);
    }
  }  

  // Draw image on canvas
  Ok(Uint8ClampedArray::from(&data[..]))
}

