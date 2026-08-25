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
  jwt: string;
  refresh: string;
}