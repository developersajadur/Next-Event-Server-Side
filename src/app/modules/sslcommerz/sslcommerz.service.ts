/* eslint-disable @typescript-eslint/no-explicit-any */
import config from '../../config';
import SSLCommerzPayment from 'sslcommerz-lts';
import status from 'http-status';
import AppError from '../../errors/AppError';
import { generateOrderInvoicePDF } from '../../helpers/generatePaymentInvoicePDF';
import { EmailHelper } from '../../helpers/emailHelper';
import prisma from '../../shared/prisma';
import { participantService } from '../participant/participant.service';

const store_id = config.ssl.store_id as string;
const store_passwd = config.ssl.store_pass as string;
const is_live = false;

export type TPaymentData = {
  total_amount: number;
  tran_id: string;
  cus_name: string;
  cus_email: string;
  cus_phone: string;
  product_name: string;
  product_category: string;
};

const initPayment = async (paymentData: TPaymentData) => {
  const {
    total_amount,
    tran_id,
    cus_name,
    cus_email,
    cus_phone,
    product_name,
    product_category,
  } = paymentData;

  const data = {
    total_amount,
    currency: 'BDT',
    tran_id,
    success_url: `${config.ssl.success_url}/${tran_id}`,
    fail_url: config.ssl.failed_url as string,
    cancel_url: config.ssl.cancel_url as string,
    ipn_url: config.ssl.ipn_url,
    shipping_method: 'Courier',
    product_name,
    product_category,
    product_profile: 'general',
    cus_name,
    cus_email,
    cus_add1: 'Dhaka',
    cus_add2: 'Dhaka',
    cus_city: 'Dhaka',
    cus_state: 'Dhaka',
    cus_postcode: '1000',
    cus_country: 'Bangladesh',
    cus_phone,
    cus_fax: cus_phone,
    ship_name: cus_name,
    ship_add1: 'Dhaka',
    ship_add2: 'Dhaka',
    ship_city: 'Dhaka',
    ship_state: 'Dhaka',
    ship_postcode: 1000,
    ship_country: 'Bangladesh',
  };

  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

  try {
    const apiResponse = await sslcz.init(data);
    const GatewayPageURL = apiResponse.GatewayPageURL;

    if (GatewayPageURL) {
      return GatewayPageURL;
    } else {
      throw new AppError(
        status.BAD_GATEWAY,
        'Failed to generate payment gateway URL.',
      );
    }
  } catch (error) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      'An error occurred while processing payment.',
    );
  }
};

const validatePayment = async (tran_id: string): Promise<boolean> => {
  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

  try {
    const validationResponse = await sslcz.transactionQueryByTransactionId({
      tran_id,
    });
    const gatewayData = validationResponse.element?.[0];
    // console.log(gatewayData);
    if (!gatewayData) {
      throw new AppError(status.BAD_REQUEST, 'Invalid transaction response.');
    }
    if (gatewayData.status === 'INVALID') {
      await prisma.payment.update({
        where: { transactionId: tran_id },
        data: {
          status: 'Failed',
          gatewayResponse: (gatewayData as any) || null,
        },
      });
      throw new AppError(status.PAYMENT_REQUIRED, 'Payment failed.');
    }

    const paymentRecord = await prisma.payment.findUnique({
      where: { transactionId: tran_id },
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
            name: true,
            email: true,
            phoneNumber: true,
            profileImage: true,
          },
        },
      },
    });
    if (!paymentRecord) {
      throw new AppError(status.NOT_FOUND, 'Payment record not found.');
    }
    // console.log(paymentRecord.user);
    const user = paymentRecord.user;

    const paymentStatus = ['VALID', 'VALIDATED'].includes(gatewayData.status)
      ? 'Paid'
      : 'Failed';
    // console.log(paymentStatus);

    if (paymentStatus === 'Failed') {
      throw new AppError(status.PAYMENT_REQUIRED, 'Payment failed.');
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const updatedPayment = await tx.payment.update({
          where: { transactionId: tran_id },
          data: {
            status: paymentStatus,
            gatewayResponse: (gatewayData as any) || null,
          },
        });

        if (!updatedPayment) {
          throw new AppError(
            status.NOT_FOUND,
            'Payment record not found or not updated.',
          );
        }

        const payment = await tx.payment.findUnique({
          where: { id: updatedPayment.id },
        });

        if (!payment) {
          throw new AppError(status.NOT_FOUND, 'Payment record not found.');
        }

        if (payment.status === 'Paid') {
          const dataToCreateParticipant = {
            eventId: payment.eventId,
            userId: payment.userId,
            hasPaid: true,
          };

          await participantService.createParticipant(dataToCreateParticipant);
          const invite = await prisma.invite.findFirst({
            where: { eventId: payment.eventId },
          });
          if (invite) {
            const updateInviteStatus = await tx.invite.update({
              where: { id: invite.id },
              data: { status: 'ACCEPTED' },
            });

            if (!updateInviteStatus) {
              throw new AppError(
                status.NOT_FOUND,
                'Invite record not found or not updated.',
              );
            }

            const existingParticipant = await tx.participant.findUnique({
              where: {
                userId_eventId: {
                  userId: invite.inviteReceiverId,
                  eventId: invite.eventId,
                },
              },
            });

            if (!existingParticipant) {
              throw new AppError(
                status.NOT_FOUND,
                'Participant not found for invited user.',
              );
            }

            const updateParticipantStatus = await tx.participant.update({
              where: {
                userId_eventId: {
                  userId: invite.inviteReceiverId,
                  eventId: invite.eventId,
                },
              },
              data: { status: 'APPROVED' },
            });
            if (!updateParticipantStatus) {
              throw new AppError(
                status.NOT_FOUND,
                'Participant record not found or not updated.',
              );
            }
          }

          const emailContent = await EmailHelper.createEmailContent(
            {
              invoiceId: paymentRecord.transactionId,
              createdAt: new Date(paymentRecord.createdAt).toLocaleDateString(
                'en-BD',
              ),
              user: {
                name: user?.name,
                email: user.email,
              },
              event: {
                title: paymentRecord.event.title,
              },
              eventType: paymentRecord.event.type,
              paymentMethod: paymentRecord.method,
              paymentStatus: paymentRecord.status,
              totalAmount: paymentRecord.amount.toFixed(2),
              discount: (0).toFixed(2),
              deliveryCharge: (0).toFixed(2),
              finalAmount: paymentRecord.amount.toFixed(2),
              year: new Date().getFullYear(),
            },
            'orderInvoice',
          );

          const pdfBuffer = await generateOrderInvoicePDF(paymentRecord);
          const attachment = {
            filename: `Invoice_${tran_id}.pdf`,
            content: pdfBuffer,
            encoding: 'base64',
          };

          await EmailHelper.sendEmail(
            user.email,
            emailContent,
            'Order confirmed - Payment Success!',
            attachment,
          );

          return true;
        }

        return false;
      },
      {
        timeout: 100000,
      },
    );

    return result;
  } catch (error) {
    console.error(error);
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      'An error occurred while validating payment.',
    );
  }
};

export const sslCommerzService = {
  initPayment,
  validatePayment,
};