export type LoginResponse = {
  status: string;
  message: string;
  userName: string;
  token: {
    access_token: string;
    expires_in: number;
    refresh_expires_in: number;
    refresh_token: string;
    token_type: string;
    id_token: string;
  }
}
