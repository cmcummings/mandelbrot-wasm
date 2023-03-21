import init, { draw_mandelbrot } from "rs";

init().then(() => {
  onmessage = async e => {
    if (typeof e.data !== "object") return;
    const [width, height, xMin, xMax, yMin, yMax] = e.data.args;
    const imageDataArray = draw_mandelbrot(width, height, xMin, xMax, yMin, yMax);
    postMessage({ type: "img", args: e.data.args, imageBuffer: imageDataArray });
  }

  postMessage({ ready: true });
});
