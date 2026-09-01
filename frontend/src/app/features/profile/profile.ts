import { Component, inject, OnInit, signal } from '@angular/core';
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
export class Profile implements OnInit
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

  ngOnInit(): void
  {
    this.route.params.subscribe(params =>
    {
      const slug = params['slug'];
      if (slug)
      {
        const id = Number(slug.split('-')[0]);
        
        if (!isNaN(id))
        {
          this.userId.set(id);
          this.loadProfileData(id);
        }
      }
    });
  }

  loadProfileData(id: number): void
  {
    this.loading.set(true);

    this.userService.getUserProfile(id).subscribe
    ({
      next: (res: any) =>
      {
        this.profile.set(res);
        if (res.isFollowed !== undefined)
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

    this.sketchService.getUserSketches(id).subscribe
    ({
      next: (res: any) =>
      {
        const data = res.content ? res.content : res;
        this.sketches.set(data);
      },
      error: (err) => console.error(err)
    });

    this.commentService.getUserComments(id).subscribe
    ({
      next: (res: any) =>
      {
        const data = res.content ? res.content : res;
        this.comments.set(data);
      },
      error: (err) => console.error(err)
    });

    this.userService.getFollowers(id).subscribe
    ({
      next: (res: any) =>
      {
        const data = res.content ? res.content : res;
        this.followers.set(data);
      },
      error: (err) => console.error(err)
    });

    this.userService.getFollowed(id).subscribe
    ({
      next: (res: any) =>
      {
        const data = res.content ? res.content : res;
        this.followed.set(data);
      },
      error: (err) => console.error(err)
    });
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
        this.userService.getFollowers(this.userId()).subscribe((res: any) =>
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

    if (seconds < 60)
    {
      return 'Just now';
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60)
    {
      return `${minutes}m ago`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24)
    {
      return `${hours}h ago`;
    }
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
}