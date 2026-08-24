export interface LoginRequest
{
  key: string;
  password: string;
}

export interface RegisterRequest
{
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse
{
  accessToken: string;
  refreshToken: string;
  username: string;
  userId: number;
}