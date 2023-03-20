import init, { draw_mandelbrot } from 'rs';

async function main() {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;
  const aspectRatio = canvas.width / canvas.height;

  let loading = false;
  let xMin = -2;
  let xMax = 1;
  let yMin = -0.84375;
  let yMax = 0.84375;
  let imageData: ImageData;

  function draw() {
    if (loading) return;
    loading = true;
    const start = Date.now();
    imageData = draw_mandelbrot(ctx, canvas.width, canvas.height, xMin, xMax, yMin, yMax);
    ctx.putImageData(imageData, 0, 0);
    const end = Date.now();
    console.log("Done in", ((end-start)/1000).toPrecision(4), "seconds.");
    loading = false;
  }

  function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);
  } 

  function canvasToGraphCoordX(canvasX: number) {
    return canvasX/canvas.width*(xMax-xMin) + xMin
  }

  function canvasToGraphCoordY(canvasY: number) {
    return canvasY/canvas.height*(yMax-yMin) + yMin;
  }

  let holdStartX = 0;
  let holdStartY = 0;
  let holdEndX = 0;
  let holdEndY = 0;

  function onHold(e: MouseEvent) {
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;
    holdEndX = mouseX;
    holdEndY = mouseY;
    
    // Scale box to aspect ratio of canvas
    if (e.shiftKey) { 
      const w = mouseX - holdStartX;
      const h = mouseY - holdStartY;
      const eh = Math.abs(w / aspectRatio);
      const ew = Math.abs(h * aspectRatio);
      if (ew < Math.abs(w)) {
        holdEndX = holdStartX + ew * (w < 0 ? -1 : 1);
      } else if (eh < Math.abs(h)) {
        holdEndY = holdStartY + eh * (h < 0 ? -1 : 1); 
      }
    }
    redraw();
    ctx.beginPath();
    ctx.rect(holdStartX, holdStartY, holdEndX - holdStartX, holdEndY - holdStartY);
    ctx.strokeStyle = "#FFFFFFFF";
    ctx.stroke();
  }

  canvas.addEventListener("mousedown", (e) => {
    holdStartX = e.offsetX;
    holdStartY = e.offsetY;
    canvas.addEventListener("mousemove", onHold);
  });

  canvas.addEventListener("mouseup", () => {
    canvas.removeEventListener("mousemove", onHold);
    const graphStartX = canvasToGraphCoordX(holdStartX);
    const graphStartY = canvasToGraphCoordY(holdStartY);
    const graphEndX = canvasToGraphCoordX(holdEndX);
    const graphEndY = canvasToGraphCoordY(holdEndY);
    if (graphStartX > graphEndX) {
      xMin = graphEndX;
      xMax = graphStartX;
    } else {
      xMin = graphStartX;
      xMax = graphEndX;
    }
    if (graphStartY > graphEndY) {
      yMin = graphEndY;
      yMax = graphStartY;
    } else {
      yMin = graphStartY;
      yMax = graphEndY;
    }
    draw();
  });
  
  draw();
}

init().then(main).catch(console.error);
