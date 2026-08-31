
export type UserReaction = 'LIKE' | 'DISLIKE';

export interface WordDto
{
  id: number;
  text: string;
}

export interface SketchInitResponse
{
  words: WordDto[];
  timeLimitSeconds: number;
}

export interface Point
{
  x: number;
  y: number;
}

export interface UserSummaryResponse
{
  id: number;
  username: string;
}

export interface Sketch
{
  id: number;
  imageData: string;
  createdAt: string;
  author: UserSummaryResponse;
  isCompletedByCurrentUser: boolean;
  targetWord?: string;
  likes: number;
  dislikes: number;
  isUserFollowing: boolean;
  currentUserReaction: UserReaction;
  remainingGuesses: number;
  commentsCount: number;
  isFollowing?: boolean;
}