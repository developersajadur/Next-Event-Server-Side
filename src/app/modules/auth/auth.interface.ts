// authenticate
export interface IAuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  profileImage: string;
  iat?: number;
  exp?: number;
}

// login
export interface ILoginUser {
  email: string;
  password: string;
}

// Password change Payload
export interface IPasswordChangePayload {
  oldPassword: string;
  newPassword: string;
}
