export interface UserWithoutPassword {
  id: number;
  username: string;
}

export interface AuthResponse {
  user: UserWithoutPassword;
  token: string;
}