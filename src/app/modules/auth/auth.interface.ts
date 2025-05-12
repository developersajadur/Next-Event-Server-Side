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
export interface IProfileInfo {
  id: string;
    name: string;
    email: string;
    address: string | null;
    bio: string | null;
    gender: string | null;
    occupation: string | null;
    phoneNumber: string;
    profileImage: string;
    role: 'USER' | 'ADMIN';
    isDeleted: boolean;
    isBlocked: boolean;
    createdAt: string;
    updatedAt: string;
}


// Password change Payload
export interface IPasswordChangePayload {
  oldPassword: string;
  newPassword: string;
}
