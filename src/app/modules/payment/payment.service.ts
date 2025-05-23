/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from '@prisma/client';
import prisma from '../../shared/prisma';
import httpStatus from 'http-status';
import { TPayment } from './payment.interface';
import { generateTransactionId } from './payment.utils';
import { sslCommerzService } from '../sslcommerz/sslcommerz.service';
import AppError from '../../errors/AppError';
import { IPaginationOptions } from '../../interfaces/pagination';
import calculatePagination from '../../helpers/CalculatePagination';
import { paymentSearchableFields } from './payment.constants';

interface PaymentFilters {
  searchTerm?: string;
  paymentMethod?: 'COD' | 'Online';
  paymentStatus?: 'Pending' | 'Paid' | 'Failed';
  minAmount?: number;
  maxAmount?: number;
  [key: string]: any;
}

const createPayment = async (payload: TPayment) => {
  const {
    method,
    status = 'Pending',
    userId,
    eventId,
    gatewayResponse = null,
  } = payload;

  // Step 1: Validate Event Existence & Status
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new AppError(httpStatus.NOT_FOUND, 'Event not found!');
  }

  if (event.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Event is deleted!');
  }

  if (!event.isPaid) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This event is free. No payment required.');
  }

  const transactionId = generateTransactionId();

  // Step 2: Create Payment inside Transaction
  const createdPayment = await prisma.$transaction(async (tx) => {
    const existingPayment = await tx.payment.findFirst({
      where: {
        userId,
        eventId,
        status: 'Paid',
      },
    });

    if (existingPayment) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'You have already registered for this event!',
      );
    }

    return await tx.payment.create({
      data: {
        transactionId,
        amount: Number(event.fee),
        method,
        status,
        userId,
        eventId,
        gatewayResponse: gatewayResponse ?? Prisma.DbNull,
      },
    });
  });

  // Step 3: Refetch related data outside the transaction
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  // Step 4: Handle Online Payment Gateway
  if (method === 'Online') {
    const sslResponse = await sslCommerzService.initPayment({
      total_amount: Number(event.fee),
      tran_id: transactionId,
      cus_name: user.name,
      cus_email: user.email,
      cus_phone: user.phoneNumber,
      product_name: event.title,
      product_category: event.type,
    });

    return { paymentUrl: sslResponse };
  }

  // Step 5: Return payment info for 'Cash' or 'Offline' method
  return {
    ...createdPayment,
    user,
    event,
  };
};


const getMyPayments = async (userId: string) => {
  const payments = await prisma.payment.findMany({
    where: {
      userId
    },
    include: {
      event: {
        select: {
          id: true,
          slug: true,
          title: true,
          bannerImage: true,
          fee: true,
          isPaid: true,
          type: true,
          venue: true
        }
      },
    },
  });

  return payments;
}

const getAllPayments = async (
  query: PaymentFilters,
  options: IPaginationOptions,
) => {
  const { searchTerm, paymentMethod, paymentStatus, minAmount, maxAmount, ...otherFilters } = query;
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);

  // Search conditions (for partial text search on related fields)
  const searchConditions: Prisma.PaymentWhereInput[] = [];

  if (searchTerm) {
    for (const field of paymentSearchableFields) {
      const [relation, nestedField] = field.split('.');

      if (nestedField) {
        searchConditions.push({
          [relation]: {
            [nestedField]: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        });
      } else {
        searchConditions.push({
          [field]: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        });
      }
    }
  }

  // Filter conditions array
  const filterConditions: Prisma.PaymentWhereInput[] = [];

  // Filter by payment method enum
  if (paymentMethod) {
    filterConditions.push({
      method: paymentMethod,
    });
  }

  // Filter by payment status enum
  if (paymentStatus) {
    filterConditions.push({
      status: paymentStatus,
    });
  }

  // Filter by min and max amount
  if (minAmount !== undefined && !isNaN(minAmount)) {
    filterConditions.push({
      amount: {
        gte: minAmount,
      },
    });
  }
  if (maxAmount !== undefined && !isNaN(maxAmount)) {
    filterConditions.push({
      amount: {
        lte: maxAmount,
      },
    });
  }

  // Add other filters directly if needed (example: exact matches)
  Object.entries(otherFilters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      filterConditions.push({ [key]: value });
    }
  });

  // Compose the final `where` clause for Prisma
  const where: Prisma.PaymentWhereInput = {
    ...(searchConditions.length > 0 && { OR: searchConditions }),
    ...(filterConditions.length > 0 && { AND: filterConditions }),
  };

  // Fetch payments with pagination and relations
  const result = await prisma.payment.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      event: {
        select: {
          id: true,
          slug: true,
          title: true,
          bannerImage: true,
          fee: true,
          isPaid: true,
          type: true,
          venue: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          phoneNumber: true,
          profileImage: true,
          name: true,
        },
      },
    },
  });

  const total = await prisma.payment.count({ where });

  return {
    meta: { page, limit, total },
    data: result,
  };
};


export const paymentService = {
  createPayment,
  getMyPayments,
  getAllPayments
};