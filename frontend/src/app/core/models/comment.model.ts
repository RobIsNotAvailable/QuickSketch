import { UserSummaryResponse } from './user.model';

export interface CommentResponse
{
  id: number;
  text: string;
  createdAt: string;
  author: UserSummaryResponse;
  sketchId: number;
  totalComments: number;
  replyToId?: number;
  totalReplies: number;
}

export interface CommentRequest
{
  comment: string;
  sketchId: number;
  replyToId?: number;
}