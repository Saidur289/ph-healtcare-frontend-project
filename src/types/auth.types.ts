// Tokens are never in response bodies: the API sets them as cookies.
export interface IAuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  emailVerified: boolean;
  needPasswordChange: boolean;
  image: string | null;
}

export interface ILoginResponse {
  user: IAuthUser;
}

export interface IRegisterResponse {
  email: string;
  emailVerificationRequired: boolean;
}
