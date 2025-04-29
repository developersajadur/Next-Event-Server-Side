import prisma from '../../shared/prisma';

const createUserIntoDB = async (payload:any) => {
  const result = await prisma.user.create({
    data: payload,
  });
  return result;
};

export const userService = {
  createUserIntoDB,
};
