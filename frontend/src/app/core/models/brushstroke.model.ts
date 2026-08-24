export interface Point
{
  x: number;
  y: number;
}

export interface Brushstroke
{
  color: string;
  size: number;
  points: Point[];
}