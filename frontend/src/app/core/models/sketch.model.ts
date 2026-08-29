
export type UserReaction = 'LIKE' | 'DISLIKE' | 'NONE';

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

export interface Sketch
{
  id: number;
  authorUsername: string;
  authorId: number;
  targetWord?: string;
  likesCount: number;
  dislikesCount: number;
  commentsCount: number;
  isGuessed: boolean;
  userReaction: UserReaction;
  createdAt: string;
}