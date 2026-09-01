import { signal } from '@angular/core';

export class CommentsController
{
  isCommentsDrawerOpen = signal<boolean>(false);
  activeSketchId = signal<number>(0);

  openComments(sketchId: number): void
  {
    if(this.isCommentsDrawerOpen() && this.activeSketchId() === sketchId)
    {
      this.closeComments();
    }
    else
    {
      this.activeSketchId.set(sketchId);
      this.isCommentsDrawerOpen.set(true);
    }
  }

  closeComments(): void
  {
    this.isCommentsDrawerOpen.set(false);
  }
}