import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SketchService } from '../../core/services/sketch.service';
import { Sketch } from '../../core/models/sketch.model';
import { PostCard } from './post-card/post-card';

@Component
({
  selector: 'app-feed',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, PostCard],
  styleUrl: './feed.scss',
  templateUrl: './feed.html',
})
export class Feed implements OnInit
{
  authService = inject(AuthService);
  sketchService = inject(SketchService);
  router = inject(Router);

  sketches = signal<Sketch[]>([]);
  loading = signal<boolean>(true);

  ngOnInit(): void
  {
    this.loadFeed();
  }

  loadFeed(): void
  {
    this.loading.set(true);
    const isFollowing = this.router.url.includes('following');

    const feedObservable = isFollowing
      ? this.sketchService.getFollowedFeed()
      : this.sketchService.getGlobalFeed();

    feedObservable.subscribe
    ({
      next: (response: any) =>
      {
        const data = response.content ? response.content : response;
        this.sketches.set(data);
        this.loading.set(false);
      },
      error: (err) =>
      {
        console.error(err);
        this.loading.set(false);
      }
    });
  }
}