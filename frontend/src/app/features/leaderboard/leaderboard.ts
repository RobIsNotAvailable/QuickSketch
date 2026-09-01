import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';

@Component
({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.scss'
})
export class Leaderboard implements OnInit
{
  userService = inject(UserService);

  entries = signal<any[]>([]);
  currentUserEntry = signal<any | null>(null);
  sortBy = signal<'guesserRank' | 'artistRank'>('guesserRank');
  loading = signal<boolean>(true);
  
  currentPage = signal<number>(0);
  totalPages = signal<number>(1);

  ngOnInit(): void
  {
    this.loadLeaderboard();
  }

  setSortBy(sort: 'guesserRank' | 'artistRank'): void
  {
    if (this.sortBy() === sort)
    {
      return;
    }
    this.sortBy.set(sort);
    this.currentPage.set(0);
    this.loadLeaderboard();
  }

  loadLeaderboard(): void
  {
    this.loading.set(true);

    this.userService.getLeaderboard(this.sortBy(), this.currentPage()).subscribe
    ({
      next: (res: any) =>
      {
        const pageData = res.leaderboard;
        this.entries.set(pageData.content ? pageData.content : pageData);
        this.currentUserEntry.set(res.currentUserStats);
        this.totalPages.set(pageData.totalPages || 1);
        this.loading.set(false);
      },
      error: (err) =>
      {
        console.error(err);
        this.loading.set(false);
      }
    });
  }

  nextPage(): void
  {
    if (this.currentPage() < this.totalPages() - 1)
    {
      this.currentPage.update(p => p + 1);
      this.loadLeaderboard();
    }
  }

  prevPage(): void
  {
    if (this.currentPage() > 0)
    {
      this.currentPage.update(p => p - 1);
      this.loadLeaderboard();
    }
  }
}