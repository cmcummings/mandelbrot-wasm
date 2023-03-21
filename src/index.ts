type Vector2 = [number, number];

class MandelbrotWorker {
  private worker: Worker

  public static async createWorker() {
    return this.initWorker().then(worker => Promise.resolve(new MandelbrotWorker(worker))); 
  }

  private static async initWorker() {
    return new Promise<Worker>((resolve, reject) => {
      const worker = new Worker(
        new URL("./mandelbrot-worker.ts", import.meta.url), 
        { type: "module" }
      );

      worker.onmessage = e => {
        worker.onmessage = null;
        if (e.data.ready) {
          resolve(worker);   
        } else {
          reject("The worker could not be loaded.");
        }
      }
    })
  }

  constructor(worker: Worker) {
    this.worker = worker; 
  }

  private async waitForMessage(callback: (e: MessageEvent) => boolean) {
    const handler = (e: MessageEvent) => {
      if (callback(e)) {
        this.worker.removeEventListener("message", handler);
      }
    }
    this.worker.addEventListener("message", handler);
  }

  public async getImageBuffer(width: number, height: number, xBounds: Vector2, yBounds: Vector2) {
    return new Promise<Uint8ClampedArray>((resolve, reject) => {
      const args = [width, height, ...xBounds, ...yBounds];
      this.waitForMessage((e) => {
        if (e.data.type === "img" && args.every((val, i) => val == e.data.args[i])) {
          resolve(e.data.imageBuffer);
          return true;
        }
        return false;
      });
      this.worker.postMessage({ args: args });
    });
  }
}

class SelectionBox {
  private start: Vector2 = [0, 0];
  private end: Vector2 = [0, 0]; 

  public setStartPosition(pos: Vector2) {
    this.start = pos; 
  }

  public getStartPosition() {
    return this.start;
  }

  public setEndPosition(pos: Vector2, aspectRatio?: number) {
    this.end = pos;
    if (aspectRatio) {
      const w = pos[0] - this.start[0];
      const h = pos[1] - this.start[1];
      const eh = Math.abs(w / aspectRatio);
      const ew = Math.abs(h * aspectRatio);
      if (ew < Math.abs(w)) {
        this.end[0] = this.start[0] + ew * (w < 0 ? -1 : 1);
      } else if (eh < Math.abs(h)) {
        this.end[1] = this.start[1] + eh * (h < 0 ? -1 : 1); 
      }
    }
  }

  public getEndPosition() {
    return this.end;
  }

  public draw(ctx: CanvasRenderingContext2D) { 
    ctx.strokeStyle = "#FFFFFFFF";
    ctx.beginPath();
    ctx.rect(this.start[0], this.start[1], this.end[0] - this.start[0], this.end[1] - this.start[1]);
    ctx.stroke();
  }
}

class MandelbrotCanvas {
  // Canvas references
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private loading = false;

  // The graph constraints
  private xBounds: Vector2 = [-2, 1];
  private yBounds: Vector2 = [-0.84375, 0.84375];

  // Cached image data in case we need to redraw the graph
  private imageData: ImageData;

  // Selection box showing use zoom section
  private selection: SelectionBox;

  // Worker
  private worker: MandelbrotWorker;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.selection = new SelectionBox();

    const onMouseHold = (e: MouseEvent) => {
      this.selection.setEndPosition([e.offsetX, e.offsetY], e.shiftKey ? this.getAspectRatio() : undefined);
      this.draw(false);
    }

    const onMouseDown = (e: MouseEvent) => {
      this.selection.setStartPosition([e.offsetX, e.offsetY]);
      this.canvas.addEventListener("mousemove", onMouseHold);
    }

    const onMouseUp = () => {
      this.canvas.removeEventListener("mousemove", onMouseHold);
      const graphStart = this.toGraphCoordinates(this.selection.getStartPosition());
      const graphEnd = this.toGraphCoordinates(this.selection.getEndPosition());;
      this.xBounds = graphStart[0] > graphEnd[0] ? [graphEnd[0], graphStart[0]] : [graphStart[0], graphEnd[0]];
      this.yBounds = graphStart[1] > graphEnd[1] ? [graphEnd[1], graphStart[1]] : [graphStart[1], graphEnd[1]];
      this.draw();
    }
    
    this.canvas.addEventListener("mousedown", onMouseDown);
    this.canvas.addEventListener("mouseup", onMouseUp);
  }

  public async initWorkers() {
    this.worker = await MandelbrotWorker.createWorker();
  }

  private getAspectRatio() {
    return this.canvas.width / this.canvas.height;
  }

  public toGraphCoordinates(canvasPosition: Vector2): Vector2 {
    return [
      canvasPosition[0]/this.canvas.width*(this.xBounds[1]-this.xBounds[0]) + this.xBounds[0], 
      canvasPosition[1]/this.canvas.height*(this.yBounds[1]-this.yBounds[0]) + this.yBounds[0]
    ]
  }

  public draw(recalculate: boolean = true) {
    if (recalculate && !this.loading) {
      this.loading = true;
      this.worker.getImageBuffer(this.canvas.width, this.canvas.height, this.xBounds, this.yBounds).then(imageBuffer => {
        this.imageData = new ImageData(imageBuffer, this.canvas.width, this.canvas.height);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.putImageData(this.imageData, 0, 0);
        this.loading = false;
      });
    } else {
      this.ctx.putImageData(this.imageData, 0, 0);
    }
    this.selection.draw(this.ctx);
  }
}


async function main() {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const mb = new MandelbrotCanvas(canvas);
  await mb.initWorkers();
  mb.draw();
}

main();
