import { PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';
import prisma from '../../shared/prisma';
import httpStatus from 'http-status';
import { TPayment } from './payment.interface';
import { generateTransactionId } from './payment.utils';
import { sslCommerzService } from '../sslcommerz/sslcommerz.service';
import AppError from '../../errors/AppError';
import { IPaginationOptions } from '../../interfaces/pagination';
import calculatePagination from '../../helpers/CalculatePagination';

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
      event: true,
    },
  });

  return payments;
}

const getAllPayments = async (
  query: Record<string, any>,
  options: IPaginationOptions,
) => {
  const { searchTerm, ...filters } = query;
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);

  const where: Prisma.PaymentWhereInput = {
    ...(searchTerm && {
      OR: [
        { user: { name: { contains: searchTerm, mode: 'insensitive' } } },
        { user: { email: { contains: searchTerm, mode: 'insensitive' } } },
        { event: { title: { contains: searchTerm, mode: 'insensitive' } } },
        { method: { equals: searchTerm as PaymentMethod } },
        { status: { equals: searchTerm as PaymentStatus } },
      ],
    }),
    ...(Object.keys(filters).length > 0 && {
      AND: Object.entries(filters).map(([key, value]) => {
        return {
          [key]:
            typeof value === 'string' &&
            (value === 'true' || value === 'false')
              ? value === 'true'
              : value,
        };
      }),
    }),
  };

  const result = await prisma.payment.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      [sortBy || 'createdAt']: sortOrder || 'desc',
    },
    include: {
      user: true,
      event: true,
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
