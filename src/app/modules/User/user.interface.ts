export type TUserPayload = {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
    profileImage?: string;
  };

  export const publicUserSelectFields = {
    id: true,
    name: true,
    email: true,
    phoneNumber: true,
    profileImage: true,
    role: true,
    isDeleted: true,
    createdAt: true,
    updatedAt: true,
  } as const;