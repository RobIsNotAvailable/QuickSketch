import { Component, inject, OnInit, OnDestroy, signal, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { SketchService } from '../../core/services/sketch.service';
import { CommentService } from '../../core/services/comment.service';
import { AuthService } from '../../core/services/auth.service';
import { Sketch } from '../../core/models/sketch.model';
import { CommentResponse } from '../../core/models/comment.model';

@Component
({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit, AfterViewInit, OnDestroy
{
  route = inject(ActivatedRoute);
  router = inject(Router);
  userService = inject(UserService);
  sketchService = inject(SketchService);
  commentService = inject(CommentService);
  authService = inject(AuthService);

  userId = signal<number>(0);
  profile = signal<any>(null);
  sketches = signal<Sketch[]>([]);
  comments = signal<CommentResponse[]>([]);
  followers = signal<any[]>([]);
  followed = signal<any[]>([]);

  isFollowed = signal<boolean>(false);
  activeTab = signal<'sketches' | 'comments' | 'followers' | 'followed'>('sketches');
  loading = signal<boolean>(true);
  loadingMore = signal<boolean>(false);

  private sketchPage = 0;
  private sketchHasMore = true;
  private commentPage = 0;
  private commentHasMore = true;
  private followerPage = 0;
  private followerHasMore = true;
  private followedPage = 0;
  private followedHasMore = true;

  @ViewChild('infiniteScrollTrigger') scrollTrigger!: ElementRef;
  private observer?: IntersectionObserver;

  ngOnInit(): void
  {
    this.route.params.subscribe(params =>
    {
      const slug = params['slug'];
      if(slug)
      {
        const id = Number(slug.split('-')[0]);
        
        if(!isNaN(id))
        {
          this.userId.set(id);
          this.loadProfileData(id);
        }
      }
    });
  }

  ngAfterViewInit(): void
  {
    this.setupIntersectionObserver();
  }

  ngOnDestroy(): void
  {
    if(this.observer)
    {
      this.observer.disconnect();
    }
  }

  loadProfileData(id: number): void
  {
    this.loading.set(true);
    this.sketchPage = 0;
    this.sketchHasMore = true;
    this.commentPage = 0;
    this.commentHasMore = true;
    this.followerPage = 0;
    this.followerHasMore = true;
    this.followedPage = 0;
    this.followedHasMore = true;

    this.userService.getUserProfile(id).subscribe
    ({
      next: (res: any) =>
      {
        this.profile.set(res);
        if(res.isFollowed !== undefined)
        {
          this.isFollowed.set(res.isFollowed);
        }
        this.loading.set(false);
      },
      error: (err) =>
      {
        console.error(err);
        this.loading.set(false);
      }
    });

    this.sketchService.getUserSketches(id, 0).subscribe
    ({
      next: (res: any) =>
      {
        const data = res.content ? res.content : res;
        this.sketches.set(data);
        if(data.length === 0 || (res.last !== undefined && res.last))
        {
          this.sketchHasMore = false;
        }
      },
      error: (err) => console.error(err)
    });

    this.commentService.getUserComments(id, 0).subscribe
    ({
      next: (res: any) =>
      {
        const data = res.content ? res.content : res;
        this.comments.set(data);
        if(data.length === 0 || (res.last !== undefined && res.last))
        {
          this.commentHasMore = false;
        }
      },
      error: (err) => console.error(err)
    });

    this.userService.getFollowers(id, 0).subscribe
    ({
      next: (res: any) =>
      {
        const data = res.content ? res.content : res;
        this.followers.set(data);
        if(data.length === 0 || (res.last !== undefined && res.last))
        {
          this.followerHasMore = false;
        }
      },
      error: (err) => console.error(err)
    });

    this.userService.getFollowed(id, 0).subscribe
    ({
      next: (res: any) =>
      {
        const data = res.content ? res.content : res;
        this.followed.set(data);
        if(data.length === 0 || (res.last !== undefined && res.last))
        {
          this.followedHasMore = false;
        }
      },
      error: (err) => console.error(err)
    });
  }

  loadMore(): void
  {
    if(this.loadingMore())
    {
      return;
    }

    const tab = this.activeTab();
    const id = this.userId();

    if(tab === 'sketches' && !this.sketchHasMore) return;
    if(tab === 'comments' && !this.commentHasMore) return;
    if(tab === 'followers' && !this.followerHasMore) return;
    if(tab === 'followed' && !this.followedHasMore) return;

    this.loadingMore.set(true);

    if(tab === 'sketches')
    {
      this.sketchPage++;
      this.sketchService.getUserSketches(id, this.sketchPage).subscribe
      ({
        next: (res: any) =>
        {
          const data = res.content ? res.content : res;
          if(data.length > 0)
          {
            this.sketches.update(current => [...current, ...data]);
          }
          if(data.length === 0 || (res.last !== undefined && res.last))
          {
            this.sketchHasMore = false;
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
    else if(tab === 'comments')
    {
      this.commentPage++;
      this.commentService.getUserComments(id, this.commentPage).subscribe
      ({
        next: (res: any) =>
        {
          const data = res.content ? res.content : res;
          if(data.length > 0)
          {
            this.comments.update(current => [...current, ...data]);
          }
          if(data.length === 0 || (res.last !== undefined && res.last))
          {
            this.commentHasMore = false;
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
    else if(tab === 'followers')
    {
      this.followerPage++;
      this.userService.getFollowers(id, this.followerPage).subscribe
      ({
        next: (res: any) =>
        {
          const data = res.content ? res.content : res;
          if(data.length > 0)
          {
            this.followers.update(current => [...current, ...data]);
          }
          if(data.length === 0 || (res.last !== undefined && res.last))
          {
            this.followerHasMore = false;
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
    else if(tab === 'followed')
    {
      this.followedPage++;
      this.userService.getFollowed(id, this.followedPage).subscribe
      ({
        next: (res: any) =>
        {
          const data = res.content ? res.content : res;
          if(data.length > 0)
          {
            this.followed.update(current => [...current, ...data]);
          }
          if(data.length === 0 || (res.last !== undefined && res.last))
          {
            this.followedHasMore = false;
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
        if(entry.isIntersecting && !this.loading() && !this.loadingMore())
        {
          const tab = this.activeTab();
          const hasMore = tab === 'sketches' ? this.sketchHasMore :
                          tab === 'comments' ? this.commentHasMore :
                          tab === 'followers' ? this.followerHasMore : this.followedHasMore;
          if(hasMore)
          {
            this.loadMore();
          }
        }
      });
    }, options);

    if(this.scrollTrigger)
    {
      this.observer.observe(this.scrollTrigger.nativeElement);
    }
  }

  isOwnProfile(): boolean
  {
    return this.authService.currentUserId() === this.userId();
  }

  toggleFollow(): void
  {
    this.userService.toggleFollow(this.userId()).subscribe
    ({
      next: (isFollowedRes: boolean) =>
      {
        this.isFollowed.set(isFollowedRes);
        this.userService.getFollowers(this.userId(), 0).subscribe((res: any) =>
        {
          const data = res.content ? res.content : res;
          this.followers.set(data);
        });
      },
      error: (err) => console.error(err)
    });
  }

  timeAgo(dateString: string): string
  {
    const date = new Date(dateString).getTime();
    const now = new Date().getTime();
    const seconds = Math.floor((now - date) / 1000);

    if(seconds < 60)
    {
      return 'Just now';
    }
    const minutes = Math.floor(seconds / 60);
    if(minutes < 60)
    {
      return `${minutes}m ago`;
    }
    const hours = Math.floor(minutes / 60);
    if(hours < 24)
    {
      return `${hours}h ago`;
    }
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
}