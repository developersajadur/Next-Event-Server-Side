export type TUserPayload = {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  gender: 'Male' | 'Female' | 'Other';
  occupation: string;
  address: string;
  bio: string;
  profileImage: string;
  };

  export const publicUserSelectFields = {
    id: true,
    name: true,
    email: true,
    phoneNumber: true,
    profileImage: true,
    role: true,
    isDeleted: true,
    isBlocked: true,
    createdAt: true,
    updatedAt: true,
  } ;

  export interface ITokenUser {
    id:string
    name: string;
    email: string;
    role: "USER" | "ADMIN";
    profileImage: string;
    iat: number;
    exp: number;
  }
  