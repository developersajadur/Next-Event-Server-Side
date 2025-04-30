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
    amount,
    method,
    status = 'Pending',
    userId,
    eventId,
    gatewayResponse = null,
  } = payload;

  const isEventExist = await prisma.event.findUnique({
    where: {
      id: eventId,
    }
  })

  if (!isEventExist) {
    throw new AppError(httpStatus.NOT_FOUND ,'Event not found!');
  }else if (isEventExist.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Event is deleted!');
  }

  const transactionId = generateTransactionId();

  return await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        transactionId,
        amount,
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

    const { user, event } = payment;

    let result;

    if (method === 'Online') {
      const sslResponse = await sslCommerzService.initPayment({
        total_amount: amount,
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

    const pdfBuffer = await generateOrderInvoicePDF(payment);
    const emailContent = await EmailHelper.createEmailContent(
      { userName: user.name || '' },
      'orderInvoice'
    );

    const attachment = {
      filename: `Invoice_${payment.id}.pdf`,
      content: pdfBuffer,
      encoding: 'base64',
    };

    await EmailHelper.sendEmail(
      user.email,
      emailContent,
      'Order confirmed!',
      attachment
    );

    return result;
  });
};



export const paymentService = {
    createPayment,
}