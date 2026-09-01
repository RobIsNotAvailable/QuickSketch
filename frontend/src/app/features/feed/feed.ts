import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SketchService } from '../../core/services/sketch.service';
import { Sketch } from '../../core/models/sketch.model';
import { PostCard } from '../../shared/components/post-card/post-card';
import { CommentsDrawer } from '../../shared/components/comments-drawer/comments-drawer';
import { CommentsController } from '../../shared/components/base/comments-controller';
import { InfiniteScrollDirective } from '../../shared/directives/infinite-scroll.directive';

@Component
({
  selector: 'app-feed',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, PostCard, CommentsDrawer, InfiniteScrollDirective],
  styleUrl: './feed.scss',
  templateUrl: './feed.html',
})
export class Feed extends CommentsController implements OnInit
{
  authService = inject(AuthService);
  sketchService = inject(SketchService);
  router = inject(Router);

  sketches = signal<Sketch[]>([]);
  loading = signal<boolean>(true);
  loadingMore = signal<boolean>(false);
  
  currentPage = 0;
  hasMore = true;

  ngOnInit(): void
  {
    this.loadFeed();
  }

  loadFeed(): void
  {
    this.loading.set(true);
    this.currentPage = 0;
    this.hasMore = true;
    const isFollowing = this.router.url.includes('following');

    const feedObservable = isFollowing
      ? this.sketchService.getFollowedFeed(this.currentPage)
      : this.sketchService.getGlobalFeed(this.currentPage);

    feedObservable.subscribe
    ({
      next: (response: any) =>
      {
        const data = response.content ? response.content : response;
        this.sketches.set(data);
        this.loading.set(false);
        
        if (data.length === 0 || (response.last !== undefined && response.last))
        {
          this.hasMore = false;
        }
      },
      error: (err) =>
      {
        console.error(err);
        this.loading.set(false);
      }
    });
  }

  loadMore(): void
  {
    if (this.loading() || this.loadingMore() || !this.hasMore)
    {
      return;
    }

    this.loadingMore.set(true);
    this.currentPage++;
    const isFollowing = this.router.url.includes('following');

    const feedObservable = isFollowing
      ? this.sketchService.getFollowedFeed(this.currentPage)
      : this.sketchService.getGlobalFeed(this.currentPage);

    feedObservable.subscribe
    ({
      next: (response: any) =>
      {
        const data = response.content ? response.content : response;
        if (data.length >0)
        {
          this.sketches.update(current => [...current, ...data]);
        }
        
        if (data.length === 0 || (response.last !== undefined && response.last))
        {
          this.hasMore = false;
        }
        this.loadingMore.set(false);
      },
      error: (err) =>
      {
        console.error(err);
        this.loadingMore.set(false);
      }
    });
  }
}