import { Component, ElementRef, ViewChild, OnInit, OnDestroy, signal, inject, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { SketchService } from '../../core/services/sketch.service';
import { WordDto, Point } from '../../core/models/sketch.model';
import { ConfirmModal } from '../../shared/components/confirm-modal/confirm-modal';

type Tool = 'pen' | 'eraser' | 'background';
type GameState = 'LOADING' | 'SELECTING' | 'DRAWING';
type ModalType = 'publish' | 'exit' | null;

@Component
({
  selector: 'app-sketcher',
  standalone: true,
  imports: [ConfirmModal],
  templateUrl: './sketcher.html',
  styleUrl: './sketcher.scss'
})
export class Sketcher implements OnInit, OnDestroy
{
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('colorPicker') colorPickerRef!: ElementRef<HTMLInputElement>;

  private sketchService = inject(SketchService);
  private router = inject(Router);

  gameState = signal<GameState>('LOADING');
  targetWords = signal<WordDto[]>([]);
  selectedWord = signal<WordDto | null>(null);
  
  timeLeft = signal<number>(0);
  timeExpired = signal<boolean>(false);
  showTimeUpAlert = signal<boolean>(false);
  private timerInterval: any;

  currentTool = signal<Tool>('pen');
  currentColor = signal<string>('#000000');
  currentSize = signal<number>(5);
  isPublishing = signal<boolean>(false);
  activeModal = signal<ModalType>(null);

  private exitResolver?: (value: boolean) => void;

  predefinedColors = [
    '#000000', '#444444', '#888888', '#ffffff',
    '#ff3b30', '#ff9500', '#ffcc00', '#34c759',
    '#00c7be', '#5ac8fa', '#007aff', '#5856d6',
    '#af52de', '#ff2d55', '#a2845e', '#ffaaaa'
  ];
  
  customColors = signal<string[]>([]);
  brushSizes = [2, 5, 12, 25];

  private ctx: CanvasRenderingContext2D | null = null;
  private isDrawing = false;
  
  private canvasHistory: ImageData[] = [];
  historyStep = signal<number>(-1);
  historyLength = signal<number>(0);

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void
  {
    if (this.gameState() !== 'DRAWING' || this.activeModal() !== null || this.timeLeft() === 0) return;

    if (event.ctrlKey && event.key.toLowerCase() === 'z')
    {
      event.preventDefault();
      this.undo();
    }
    else if (event.ctrlKey && event.key.toLowerCase() === 'y')
    {
      event.preventDefault();
      this.redo();
    }
  }

  ngOnInit(): void
  {
    this.sketchService.initSketchSession().subscribe
    ({
      next: (response) =>
      {
        this.targetWords.set(response.words);
        this.timeLeft.set(response.timeLimitSeconds);
        this.gameState.set('SELECTING');
      },
      error: (err) =>
      {
        console.error(err);
        this.router.navigate(['/']);
      }
    });
  }

  ngOnDestroy(): void
  {
    if (this.timerInterval)
    {
      clearInterval(this.timerInterval);
    }
  }

  canDeactivate(): Promise<boolean>
  {
    this.activeModal.set('exit');
    return new Promise<boolean>((resolve) =>
    {
      this.exitResolver = resolve;
    });
  }

  onExitConfirm(): void
  {
    this.activeModal.set(null);
    if (this.exitResolver)
    {
      this.exitResolver(true);
    }
  }

  onExitCancel(): void
  {
    this.activeModal.set(null);
    if (this.exitResolver)
    {
      this.exitResolver(false);
    }
  }

  chooseWord(word: WordDto): void
  {
    this.selectedWord.set(word);
    this.gameState.set('DRAWING');
    
    setTimeout(() =>
    {
      this.initCanvas();
      this.startTimer(this.timeLeft());
    }, 0);
  }

  getFormattedTime(): string
  {
    const minutes = Math.floor(this.timeLeft() / 60);
    const seconds = this.timeLeft() % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  private startTimer(initialTime: number): void
  {
    this.timeLeft.set(initialTime);
    this.timeExpired.set(false);
    
    this.timerInterval = setInterval(() =>
    {
      const current = this.timeLeft();
      if (current > 1)
      {
        this.timeLeft.set(current - 1);
      }
      else
      {
        this.timeLeft.set(0);
        this.timeExpired.set(true);
        this.showTimeUpAlert.set(true);
        setTimeout(() =>
        {
          this.showTimeUpAlert.set(false);
        }, 4000);
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  private initCanvas(): void
  {
    if (this.canvasRef && this.canvasRef.nativeElement)
    {
      const canvas = this.canvasRef.nativeElement;
      this.ctx = canvas.getContext('2d');

      if(this.ctx)
      {
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        this.canvasHistory = [];
        this.historyStep.set(-1);
        this.historyLength.set(0);
        this.saveState();
      }
    }
  }

  private saveState(): void
  {
    if (!this.ctx) return;
    
    const canvas = this.canvasRef.nativeElement;
    
    if (this.historyStep() < this.canvasHistory.length - 1)
    {
      this.canvasHistory = this.canvasHistory.slice(0, this.historyStep() + 1);
    }
    
    this.canvasHistory.push(this.ctx.getImageData(0, 0, canvas.width, canvas.height));
    this.historyStep.set(this.canvasHistory.length - 1);
    this.historyLength.set(this.canvasHistory.length);
  }

  selectColor(color: string): void
  {
    this.currentColor.set(color);
    if (this.currentTool() === 'eraser')
    {
      this.currentTool.set('pen');
    }
  }

  openPicker(): void
  {
    this.colorPickerRef.nativeElement.click();
  }

  onColorPicked(color: string): void
  {
    const currentCustoms = [...this.customColors()];
    
    if (!this.predefinedColors.includes(color) && !currentCustoms.includes(color))
    {
      if (currentCustoms.length >= 3)
      {
        currentCustoms.shift();
      }
      currentCustoms.push(color);
      this.customColors.set(currentCustoms);
    }
    
    this.selectColor(color);
  }

  private hexToRgba(hex: string): { r: number, g: number, b: number, a: number }
  {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
      a: 255
    } : { r: 0, g: 0, b: 0, a: 255 };
  }

  private floodFill(startX: number, startY: number, fillColor: string): void
  {
    if (!this.ctx) return;
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.width;
    const height = canvas.height;
    
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

  startAction(event: MouseEvent): void
  {
    if(!this.ctx || this.activeModal() !== null || this.timeLeft() === 0) return;

    const { x, y } = this.getCoordinates(event);

    if (this.currentTool() === 'background')
    {
      this.floodFill(x, y, this.currentColor());
      this.saveState();
      return;
    }

    this.isDrawing = true;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  }

  draw(event: MouseEvent): void
  {
    if(!this.isDrawing || !this.ctx || this.activeModal() !== null || this.timeLeft() === 0) return;

    const { x, y } = this.getCoordinates(event);
    const activeColor = this.currentTool() === 'eraser' ? '#ffffff' : this.currentColor();

    this.ctx.lineWidth = this.currentSize();
    this.ctx.strokeStyle = activeColor;
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }

  stopAction(): void
  {
    if(this.isDrawing)
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
    if(!this.ctx) return;
    const canvas = this.canvasRef.nativeElement;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.saveState();
  }

  onSave(): void
  {
    if(this.historyStep() === 0 || this.isPublishing() || !this.selectedWord()) return;

    if (this.timerInterval)
    {
      clearInterval(this.timerInterval);
    }

    this.isPublishing.set(true);

    const canvas = this.canvasRef.nativeElement;
    const base64Image = canvas.toDataURL('image/png');

    this.sketchService.createSketch
    ({ 
      imageData: base64Image,
      wordId: this.selectedWord()!.id
    }).subscribe
    ({
      next: () => 
      {
        this.isPublishing.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => 
      {
        console.error(err);
        this.isPublishing.set(false);
        this.activeModal.set(null);
      }
    });
  }

  private getCoordinates(event: MouseEvent): Point
  {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  }
}