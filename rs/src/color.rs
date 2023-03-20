
pub struct ColorRGB {
  pub r: u8,
  pub g: u8,
  pub b: u8,
}

pub struct ColorHSV {
  pub h: f64,
  pub s: f64,
  pub v: f64
}

impl ColorHSV {
  pub fn to_rgb(self) -> ColorRGB {
    let k = 255.0 * self.v;
    let m = k * (1.0 - self.s);
    let z = (k - m) * (1.0 - ((self.h/60.0) % 2.0 - 1.0).abs());
    // Type conversion
    let x = k as u8;
    let y = z as u8 + m as u8;
    let z = m as u8;
    if self.h < 60.0 {
      ColorRGB { r: x, g: y, b: z }
    } else if self.h < 120.0 {
      ColorRGB { r: y, g: x, b: z }
    } else if self.h < 180.0 {
      ColorRGB { r: z, g: x, b: y }
    } else if self.h < 240.0 {
      ColorRGB { r: z, g: y, b: x }
    } else if self.h < 300.0 {
      ColorRGB { r: y, g: z, b: x }
    } else {
      ColorRGB { r: x, g: z, b: y }
    }
  }
}
