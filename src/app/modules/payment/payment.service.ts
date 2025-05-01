import { Prisma } from '@prisma/client';
import prisma from '../../shared/prisma';
import httpStatus from 'http-status';
import { TPayment } from './payment.interface';
import { generateTransactionId } from './payment.utils';
import { sslCommerzService } from '../sslcommerz/sslcommerz.service';
import AppError from '../../errors/AppError';

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
  const newPayment = await prisma.$transaction(async (tx) => {
    const existingPayment = await tx.payment.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    if (existingPayment) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'You have already registered for this event!',
      );
    }

    const createdPayment = await tx.payment.create({
      data: {
        transactionId,
        amount: Number(event.fee),
        method,
        status,
        userId,
        eventId,
        gatewayResponse: gatewayResponse ?? Prisma.DbNull,
      },
      include: {
        user: true,
        event: true,
      },
    });

    return createdPayment;
  });

  // Step 3: Handle Gateway Logic (outside transaction)
  const { user } = newPayment;

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

  return newPayment;
};


export const paymentService = {
  createPayment,
};
