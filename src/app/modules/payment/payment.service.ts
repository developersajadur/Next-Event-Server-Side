import { Prisma } from '@prisma/client';
import prisma from '../../shared/prisma';
import httpStatus from 'http-status';
import { TPayment } from './payment.interface';
import { generateTransactionId } from './payment.utils';
import { sslCommerzService } from '../sslcommerz/sslcommerz.service';
import { generateOrderInvoicePDF } from '../../helpers/generatePaymentInvoicePDF';
import { EmailHelper } from '../../helpers/emailHelper';
import AppError from '../../errors/AppError';

const createPayment = async (payload: TPayment) => {
  const {
    method,
    status = 'Pending',
    userId,
    eventId,
    gatewayResponse = null,
  } = payload;

  // Step 1: Check if the event exists and is not deleted
  const isEventExist = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!isEventExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'Event not found!');
  } else if (isEventExist.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Event is deleted!');
  }

  const transactionId = generateTransactionId();

  // Step 2: Start transaction for payment creation
  const payment = await prisma.$transaction(async (tx) => {

    const existingPayment = await tx.payment.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      }
    });
    if (existingPayment) {
      throw new AppError(httpStatus.BAD_REQUEST, 'You have already registered for this event!');
    }

    const payment = await tx.payment.create({
      data: {
        transactionId,
        amount: Number(isEventExist.fee),
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

    return payment;
  });

  // Step 3: Perform non-transaction work outside the transaction (async)
  const { user, event } = payment;

  let result;

  // If method is 'Online', call SSLCommerz service to initialize payment
  if (method === 'Online') {
    const sslResponse = await sslCommerzService.initPayment({
      total_amount: Number(isEventExist.fee),
      tran_id: transactionId,
      cus_name: user.name,
      cus_email: user.email,
      cus_phone: user.phoneNumber,
      product_name: event.title,
      product_category: event.type,
    });

    result = { paymentUrl: sslResponse };
  } else {
    result = payment;
  }

  // Step 4: Generate invoice PDF after transaction
  const pdfBuffer = await generateOrderInvoicePDF(payment);

  // Step 5: Generate email content and send email
  const emailContent = await EmailHelper.createEmailContent(
    {
      invoiceId: payment.id,
      createdAt: payment.createdAt.toISOString(),
      user: {
        name: user.name,
        email: user.email,
      },
      event: {
        title: event.title,
      },
      eventType: event.type || 'Public',
      paymentMethod: payment.method,
      paymentStatus: payment.status,
      totalAmount: payment.amount,
      discount: '0.00',
      deliveryCharge: '0.00',
      finalAmount: payment.amount,
      year: new Date().getFullYear(),
    },
    'orderInvoice'
  );

  const attachment = {
    filename: `Invoice_${payment.id}.pdf`,
    content: pdfBuffer,
    encoding: 'base64',
  };

  // Send email with the generated PDF
  await EmailHelper.sendEmail(
    user.email,
    emailContent,
    'Order confirmed!',
    attachment
  );

  // Return the result of the payment (either SSL payment URL or the payment object)
  return result;
};

export const paymentService = {
  createPayment,
};
