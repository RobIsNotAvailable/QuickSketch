import { Component, inject, OnInit, OnDestroy, signal, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SketchService } from '../../core/services/sketch.service';
import { Sketch } from '../../core/models/sketch.model';
import { PostCard } from '../../shared/components/post-card/post-card';
import { CommentsDrawer } from '../../shared/components/comments-drawer/comments-drawer';

@Component
({
  selector: 'app-feed',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, PostCard, CommentsDrawer],
  styleUrl: './feed.scss',
  templateUrl: './feed.html',
})
export class Feed implements OnInit, AfterViewInit, OnDestroy
{
  authService = inject(AuthService);
  sketchService = inject(SketchService);
  router = inject(Router);

  sketches = signal<Sketch[]>([]);
  loading = signal<boolean>(true);
  loadingMore = signal<boolean>(false);
  
  currentPage = 0;
  hasMore = true;
  
  @ViewChild('infiniteScrollTrigger') scrollTrigger!: ElementRef;
  private observer?: IntersectionObserver;

  isCommentsDrawerOpen = signal<boolean>(false);
  activeSketchId = signal<number>(0); 

  ngOnInit(): void
  {
    this.loadFeed();
  }

  ngAfterViewInit(): void
  {
    this.setupIntersectionObserver();
  }

  ngOnDestroy(): void
  {
    if (this.observer)
    {
      this.observer.disconnect();
    }
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
    if (this.loadingMore() || !this.hasMore)
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
        if (data.length > 0)
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

  private setupIntersectionObserver(): void
  {
    const options = 
    {
      root: null,
      rootMargin: '200px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => 
    {
      entries.forEach(entry => 
      {
        if (entry.isIntersecting && !this.loading() && !this.loadingMore() && this.hasMore)
        {
          this.loadMore();
        }
      });
    }, options);

    if (this.scrollTrigger)
    {
      this.observer.observe(this.scrollTrigger.nativeElement);
    }
  }

  openComments(sketchId: number): void
  {
    if (this.isCommentsDrawerOpen() && this.activeSketchId() === sketchId)
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