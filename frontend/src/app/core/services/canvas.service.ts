import { Injectable, signal } from '@angular/core';

@Injectable()
export class CanvasService
{
  private ctx: CanvasRenderingContext2D | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private canvasHistory: ImageData[] = [];
  private isDrawing = false;

  historyStep = signal<number>(-1);
  historyLength = signal<number>(0);

  initCanvas(canvasEl: HTMLCanvasElement): void
  {
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');

    if (this.ctx)
    {
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

      this.canvasHistory = [];
      this.historyStep.set(-1);
      this.historyLength.set(0);
      this.saveState();
    }
  }

  saveState(): void
  {
    if (!this.ctx || !this.canvas) return;

    if (this.historyStep() < this.canvasHistory.length - 1)
    {
      this.canvasHistory = this.canvasHistory.slice(0, this.historyStep() + 1);
    }

    this.canvasHistory.push(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height));
    this.historyStep.set(this.canvasHistory.length - 1);
    this.historyLength.set(this.canvasHistory.length);
  }

  startDrawing(x: number, y: number): void
  {
    if (!this.ctx) return;
    this.isDrawing = true;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  }

  draw(x: number, y: number, color: string, size: number): void
  {
    if (!this.isDrawing || !this.ctx) return;
    this.ctx.lineWidth = size;
    this.ctx.strokeStyle = color;
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }

  stopDrawing(): void
  {
    if (this.isDrawing)
    {
      this.isDrawing = false;
      this.saveState();
    }
  }

  undo(): void
  {
    if (this.historyStep() > 0)
    {
      this.historyStep.set(this.historyStep() - 1);
      this.ctx?.putImageData(this.canvasHistory[this.historyStep()], 0, 0);
    }
  }

  redo(): void
  {
    if (this.historyStep() < this.canvasHistory.length - 1)
    {
      this.historyStep.set(this.historyStep() + 1);
      this.ctx?.putImageData(this.canvasHistory[this.historyStep()], 0, 0);
    }
  }

  clearCanvas(): void
  {
    if (!this.ctx || !this.canvas) return;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.saveState();
  }

  private hexToRgba(hex: string): { r: number, g: number, b: number, a: number }
  {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result)
    {
      return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 255
      };
    }
    else
    {
      return { r: 0, g: 0, b: 0, a: 255 };
    }
  }

  floodFill(startX: number, startY: number, fillColor: string): void
  {
    if (!this.ctx || !this.canvas) return;
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    const x = Math.round(startX);
    const y = Math.round(startY);
    
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    
    const imageData = this.ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    const targetPos = (y * width + x) * 4;
    const targetR = data[targetPos];
    const targetG = data[targetPos + 1];
    const targetB = data[targetPos + 2];
    const targetA = data[targetPos + 3];
    
    const fillRgba = this.hexToRgba(fillColor);
    
    if (targetR === fillRgba.r && targetG === fillRgba.g && targetB === fillRgba.b && targetA === fillRgba.a)
    {
      return;
    }
    
    const matchStartColor = (pos: number) =>
    {
      return data[pos] === targetR &&
             data[pos + 1] === targetG &&
             data[pos + 2] === targetB &&
             data[pos + 3] === targetA;
    };
    
    const colorPixel = (pos: number) =>
    {
      data[pos] = fillRgba.r;
      data[pos + 1] = fillRgba.g;
      data[pos + 2] = fillRgba.b;
      data[pos + 3] = fillRgba.a;
    };
    
    const stack = [x, y];
    
    while (stack.length > 0)
    {
      const curY = stack.pop()!;
      const curX = stack.pop()!;
      
      const pos = (curY * width + curX) * 4;
      if (!matchStartColor(pos)) continue;
      
      let leftX = curX;
      while (leftX > 0 && matchStartColor((curY * width + leftX - 1) * 4))
      {
        leftX--;
      }
      
      let rightX = curX;
      while (rightX < width - 1 && matchStartColor((curY * width + rightX + 1) * 4))
      {
        rightX++;
      }
      
      for (let ix = leftX; ix <= rightX; ix++)
      {
        colorPixel((curY * width + ix) * 4);
        
        if (curY > 0 && matchStartColor(((curY - 1) * width + ix) * 4))
        {
          stack.push(ix, curY - 1);
        }
        if (curY < height - 1 && matchStartColor(((curY + 1) * width + ix) * 4))
        {
          stack.push(ix, curY + 1);
        }
      }
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  }
}