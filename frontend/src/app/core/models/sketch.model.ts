import { Brushstroke } from './brushstroke.model';

export type UserReaction = 'LIKE' | 'DISLIKE' | 'NONE';

export interface Sketch
{
  id: number;
  authorUsername: string;
  authorId: number;
  brushstrokes: Brushstroke[];
  targetWord?: string;
  likesCount: number;
  dislikesCount: number;
  commentsCount: number;
  isGuessed: boolean;
  userReaction: UserReaction;
  createdAt: string;
}