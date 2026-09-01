import { Component, Input, Output, EventEmitter, inject, signal, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Sketch } from '../../../core/models/sketch.model';
import { AuthService } from '../../../core/services/auth.service';
import { SketchService } from '../../../core/services/sketch.service';
import { ConfirmModal } from '../confirm-modal/confirm-modal';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';

@Component
({
  selector: 'app-post-card',
  standalone: true,
  imports: [FormsModule, RouterLink, ConfirmModal, TimeAgoPipe],
  templateUrl: './post-card.html',
  styleUrl: './post-card.scss'
})
export class PostCard
{
  @Input({ required: true }) sketch!: Sketch;
  @Output() openCommentsDrawer = new EventEmitter<number>();

  authService = inject(AuthService);
  sketchService = inject(SketchService);
  private cdr = inject(ChangeDetectorRef);

  guessText = signal<string>('');
  isSubmitting = signal<boolean>(false);
  
  feedbackMessage = signal<string | null>(null);
  feedbackType = signal<'error' | 'warning' | 'success'>('error');
  private feedbackTimeout: any;

  showGiveUpModal = signal<boolean>(false);

  isCompleted(): boolean
  {
    return this.sketch.isCompletedByCurrentUser;
  }

  private showFeedback(message: string, type: 'error' | 'warning' | 'success' = 'error'): void
  {
    if (this.feedbackTimeout)
    {
      clearTimeout(this.feedbackTimeout);
    }

    this.feedbackMessage.set(message);
    this.feedbackType.set(type);
    
    this.feedbackTimeout = setTimeout(() =>
    {
      this.feedbackMessage.set(null);
      this.cdr.markForCheck();
    }, 3000);

    this.cdr.markForCheck();
  }

  submitGuess(): void
  {
    if (!this.guessText().trim() || this.isSubmitting())
    {
      return;
    }

    this.isSubmitting.set(true);

    this.sketchService.guessWord(this.guessText(), this.sketch.id).subscribe
    ({
      next: (res: any) =>
      {
        this.isSubmitting.set(false);

        if (res.guessesLeft !== undefined)
        {
          this.sketch.remainingGuesses = res.guessesLeft;
        }

        if (res.accuracy === 'CORRECT')
        {
          this.sketch.isCompletedByCurrentUser = true;
          this.sketch.targetWord = res.solution;
          this.guessText.set('');
          this.showFeedback('Correct! You got it.', 'success');
        }
        else if (res.accuracy === 'CLOSE')
        {
          this.showFeedback(this.guessText() + ' is pretty close!', 'warning');
        }
        else
        {
          this.showFeedback('Wrong guess!', 'error');
        }

        if (res.guessesLeft === 0 && res.accuracy !== 'CORRECT')
        {
          this.sketch.isCompletedByCurrentUser = true;
          this.sketch.targetWord = res.solution;
          this.showFeedback('Out of guesses!', 'error');
        }

        this.cdr.markForCheck();
      },
      error: (err) =>
      {
        this.isSubmitting.set(false);
        const msg = err.error?.message || 'Failed to submit guess.';
        this.showFeedback(msg, 'error');
        this.cdr.markForCheck();
      }
    });
  }

  giveUp(): void
  {
    this.showGiveUpModal.set(true);
  }

  confirmGiveUp(): void
  {
    this.showGiveUpModal.set(false);
    this.isSubmitting.set(true);

    this.sketchService.giveUp(this.sketch.id).subscribe
    ({
      next: (response: any) =>
      {
        this.isSubmitting.set(false);
        this.sketch.isCompletedByCurrentUser = true;
        
        let data = response;
        try 
        { 
          data = JSON.parse(response); 
        } 
        catch (e) {}

        this.sketch.targetWord = data.solution || data.targetWord || (typeof data === 'string' ? data : '');
        
        if (data.guessesLeft !== undefined)
        {
          this.sketch.remainingGuesses = data.guessesLeft;
        }

        this.cdr.markForCheck();
      },
      error: (err) =>
      {
        this.isSubmitting.set(false);
        this.showFeedback('Failed to give up.', 'error');
        console.error(err);
        this.cdr.markForCheck();
      }
    });
  }

  cancelGiveUp(): void
  {
    this.showGiveUpModal.set(false);
  }

  handleReaction(reaction: 'LIKE' | 'DISLIKE', event: MouseEvent): void
  {
    if (!this.isCompleted())
    {
      this.showFeedback('Guess the word first to react!');
      return;
    }

    const btn = event.currentTarget as HTMLElement;
    const direction = reaction === 'LIKE' ? '-4px' : '4px';
    btn.style.setProperty('--bump-dir', direction);
    btn.classList.add('is-bumping');
    setTimeout(() =>
    {
      btn.classList.remove('is-bumping');
    }, 300);

    this.sketchService.react(this.sketch.id, reaction).subscribe
    ({
      next: (res: any) =>
      {
        this.sketch.likes = res.totalLikes;
        this.sketch.dislikes = res.totalDislikes;
        this.sketch.currentUserReaction = res.currentReaction;
        this.cdr.markForCheck();
      },
      error: (err) =>
      {
        console.error(err);
      }
    });
  }

  openComments(): void
  {
    if (!this.isCompleted())
    {
      this.showFeedback('Guess the word first to view comments!');
      return;
    }
    this.openCommentsDrawer.emit(this.sketch.id);
  }

}