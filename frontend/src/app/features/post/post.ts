import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SketchService } from '../../core/services/sketch.service';
import { Sketch } from '../../core/models/sketch.model';
import { PostCard } from '../../shared/components/post-card/post-card';
import { CommentsDrawer } from '../../shared/components/comments-drawer/comments-drawer';
import { CommentsController } from '../../shared/components/base/comments-controller';

@Component
({
  selector: 'app-post',
  standalone: true,
  imports: [PostCard, CommentsDrawer],
  templateUrl: './post.html',
  styleUrl: './post.scss'
})
export class Post extends CommentsController implements OnInit
{
  route = inject(ActivatedRoute);
  sketchService = inject(SketchService);

  sketch = signal<Sketch | null>(null);
  loading = signal<boolean>(true);

  ngOnInit(): void
  {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const shouldOpenComments = this.route.snapshot.queryParamMap.get('openComments') === 'true';

    if(id)
    {
      this.activeSketchId.set(id);
      this.sketchService.getSketchById(id).subscribe
      ({
        next: (res) =>
        {
          this.sketch.set(res);
          this.loading.set(false);

          if(shouldOpenComments)
          {
            this.isCommentsDrawerOpen.set(true);
          }
        },
        error: (err) =>
        {
          console.error(err);
          this.loading.set(false);
        }
      });
    }
  }

}