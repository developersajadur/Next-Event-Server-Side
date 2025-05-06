import { IPaginationOptions } from '../interfaces/pagination';

type IOptionsResult = {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

const calculatePagination = (options: IPaginationOptions): IOptionsResult => {

  const sortBy = options.sortBy || 'createdAt';
  const sortOrder = (options.sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc';

    const page: number = Number(options.page) || 1;
    const limit: number = Number(options.limit) || 20;
    const skip: number = (Number(page) - 1) * limit;
  return { page, limit, skip, sortBy, sortOrder };
};

export default calculatePagination;
