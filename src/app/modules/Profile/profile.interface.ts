export interface IProfile {
  id?: string;
  name: string;
  email: string;
  password: string;
  address?: string;
  bio?: string;
  gender?: string;
  occupation?: string;
  phoneNumber: string;
  profileImage?: string;
  role: 'ADMIN' | 'USER';
  isDeleted: boolean;
  isBlocked: boolean;
}



export interface UpdateProfilePayload {
  name: string;
  email: string;
  profileImage: string;
  phoneNumber: string; 
  address: string;
  occupation: string;
}
