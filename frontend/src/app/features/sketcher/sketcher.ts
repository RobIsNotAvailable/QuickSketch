import { Component, ElementRef, ViewChild, OnInit, OnDestroy, signal, inject, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { SketchService } from '../../core/services/sketch.service';
import { WordDto, Point } from '../../core/models/sketch.model';
import { ConfirmModal } from '../../shared/components/confirm-modal/confirm-modal';
import { CanvasService } from '../../core/services/canvas.service';

type Tool = 'pen' | 'eraser' | 'background';
type GameState = 'LOADING' | 'SELECTING' | 'DRAWING';
type ModalType = 'publish' | 'exit' | null;

@Component
({
  selector: 'app-sketcher',
  standalone: true,
  imports: [ConfirmModal],
  providers: [CanvasService],
  templateUrl: './sketcher.html',
  styleUrl: './sketcher.scss'
})
export class Sketcher implements OnInit, OnDestroy
{
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('colorPicker') colorPickerRef!: ElementRef<HTMLInputElement>;

  private sketchService = inject(SketchService);
  private router = inject(Router);
  canvasService = inject(CanvasService);

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
    '#1a1a1a', '#f5f5f5', '#7a828a', '#d94141',
    '#4172d9', '#edd134', '#3d943d', '#e08434',
    '#824b9a', '#543d2b', '#cfa77a', '#e8a7b5',
    '#7cbade', '#62c462', '#e0609b', '#bfa036'
  ];
  
  customColors = signal<string[]>([]);
  brushSizes = [2, 5, 12, 25];

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void
  {
    if (this.gameState() !== 'DRAWING' || this.activeModal() !== null || this.timeLeft() === 0)
    {
      return;
    }

    if (event.ctrlKey && event.key.toLowerCase() === 'z')
    {
      event.preventDefault();
      this.canvasService.undo();
    }
    else if (event.ctrlKey && event.key.toLowerCase() === 'y')
    {
      event.preventDefault();
      this.canvasService.redo();
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
        
        this.stopAction();
        
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
      this.canvasService.initCanvas(this.canvasRef.nativeElement);
    }
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

  startAction(event: MouseEvent): void
  {
    if (this.activeModal() !== null || this.timeLeft() === 0)
    {
      return;
    }

    const { x, y } = this.getCoordinates(event);

    if (this.currentTool() === 'background')
    {
      this.canvasService.floodFill(x, y, this.currentColor());
      this.canvasService.saveState();
      return;
    }

    this.canvasService.startDrawing(x, y);
  }

  draw(event: MouseEvent): void
  {
    if (this.activeModal() !== null || this.timeLeft() === 0)
    {
      return;
    }

    const { x, y } = this.getCoordinates(event);
    const activeColor = this.currentTool() === 'eraser' ? '#ffffff' : this.currentColor();

    this.canvasService.draw(x, y, activeColor, this.currentSize());
  }

  stopAction(): void
  {
    this.canvasService.stopDrawing();
  }

  onSave(): void
  {
    if (this.canvasService.historyStep() === 0 || this.isPublishing() || !this.selectedWord())
    {
      return;
    }

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