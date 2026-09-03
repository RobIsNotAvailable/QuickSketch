import { Component, Input, Output, EventEmitter, inject, signal, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommentService } from '../../../core/services/comment.service';
import { CommentResponse } from '../../../core/models/comment.model';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';

@Component
({
  selector: 'app-comments-drawer',
  standalone: true,
  imports: [FormsModule, TimeAgoPipe],
  templateUrl: './comments-drawer.html',
  styleUrl: './comments-drawer.scss'
})
export class CommentsDrawer implements OnChanges
{
  @Input({ required: true }) sketchId!: number;
  @Input({ required: true }) isOpen: boolean = false;
  @Output() closeDrawer = new EventEmitter<void>();
  @Output() commentAdded = new EventEmitter<number>();


  private commentService = inject(CommentService);

  comments = signal<CommentResponse[]>([]);
  loading = signal<boolean>(false);
  newCommentText = signal<string>('');

  replies = signal<{ [key: number]: CommentResponse[] }>({});
  loadingReplies = signal<{ [key: number]: boolean }>({});
  showReplies = signal<{ [key: number]: boolean }>({});

  replyingTo = signal<{ id: number, username: string } | null>(null);

  ngOnChanges(changes: SimpleChanges): void
  {
    const sketchIdChanged = changes['sketchId'] && !changes['sketchId'].isFirstChange();
    const opened = changes['isOpen'] && this.isOpen;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    if (isMobile)
    {
      if (opened)
      {
        document.body.style.overflow = 'hidden';
      }
      else
      {
        document.body.style.overflow = '';
      }
    }

    if (opened || (this.isOpen && sketchIdChanged))
    {
      if (sketchIdChanged || this.comments().length === 0)
      {
        this.comments.set([]);
        this.replies.set({});
        this.showReplies.set({});
        this.replyingTo.set(null);
        this.newCommentText.set('');
        
        if (this.sketchId > 0)
        {
          this.loadComments();
        }
      }
    }
  }

  loadComments(): void
  {
    this.loading.set(true);
    this.commentService.getSketchComments(this.sketchId).subscribe
    ({
      next: (res: any) =>
      {
        const data = res.content ? res.content : res;
        this.comments.set(data);
        this.loading.set(false);
      },
      error: (err) =>
      {
        console.error(err);
        this.loading.set(false);
      }
    });
  }

  loadReplies(commentId: number): void
  {
    if (this.replies()[commentId])
    {
      this.showReplies.update(sr => ({ ...sr, [commentId]: !sr[commentId] }));
      return;
    }

    this.loadingReplies.update(lr => ({ ...lr, [commentId]: true }));
    this.commentService.getCommentReplies(commentId).subscribe
    ({
      next: (res: any) =>
      {
        const data = res.content ? res.content : res;
        this.replies.update(r => ({ ...r, [commentId]: data }));
        this.showReplies.update(sr => ({ ...sr, [commentId]: true }));
        this.loadingReplies.update(lr => ({ ...lr, [commentId]: false }));
      },
      error: (err) =>
      {
        console.error(err);
        this.loadingReplies.update(lr => ({ ...lr, [commentId]: false }));
      }
    });
  }

  submitComment(): void
  {
    if (!this.newCommentText().trim())
    {
      return;
    }

    const payload = 
    {
      comment: this.newCommentText(),
      sketchId: this.sketchId,
      replyToId: this.replyingTo()?.id || undefined
    };

    this.commentService.createComment(payload as any).subscribe
    ({
      next: (newComment) =>
      {
        if(this.replyingTo())
        {
          const parentId = this.replyingTo()!.id;
          
          if(!this.replies()[parentId])
          {
            this.loadReplies(parentId);
          }
          else
          {
            const currentReplies = this.replies()[parentId] || [];
            
            this.replies.update(r => 
            {
              return { ...r, [parentId]: [...currentReplies, newComment] };
            });
            
            this.showReplies.update(sr => 
            {
              return { ...sr, [parentId]: true };
            });
          }
          
          this.comments.update(commentsList =>
          {
            return commentsList.map(c =>
            {
              if(c.id === parentId)
              {
                const currentCount = Number(c.totalReplies) || 0;
                return { ...c, totalReplies: currentCount + 1 };
              }
              return c;
            });
          });
        }
        else
        {
          this.comments.update(c => [...c, newComment]);
        }

        this.commentAdded.emit(newComment.totalComments);

        this.newCommentText.set('');
        this.replyingTo.set(null);
      },
      error: (err) => console.error(err)
    });
  }

  setReply(commentId: number, username: string): void
  {
    if (this.replyingTo()?.id === commentId)
    {
      this.replyingTo.set(null);
    }
    else
    {
      this.replyingTo.set({ id: commentId, username: username });
    }
  }

  close(): void
  {
    this.closeDrawer.emit();
  }
}