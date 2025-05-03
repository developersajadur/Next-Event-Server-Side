import prisma from '../shared/prisma';
import { format } from 'date-fns';
import AppError from '../errors/AppError';
import status from 'http-status';
import { EmailHelper } from './emailHelper';

export const InvoiceService = {
  async sendInvoiceEmail(userId: string, orderId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const order = await prisma.payment.findUnique({
      where: { id: orderId },
      include: {
        event: true,
      },
    });

    if (!user || !order) {
      throw new AppError(status.NOT_FOUND, 'User or payment record not found');
    }

    const invoiceData = {
      invoiceId: order.id,
      createdAt: format(order.createdAt, 'PPP'),
      user: {
        name: user.name,
        email: user.email,
      },
      event: {
        title: order.event.title,
      },
      eventType: order.event.type || 'Public',
      paymentMethod: order.method,
      paymentStatus: order.status,
      totalAmount: order.amount,
      discount: '0.00',
      deliveryCharge: '0.00',
      finalAmount: order.amount,
      year: new Date().getFullYear(),
    };

    const html = await EmailHelper.createEmailContent(invoiceData, 'orderInvoice');
    await EmailHelper.sendEmail(user.email, html, 'Next Event | Registration Invoice');
  },
};
