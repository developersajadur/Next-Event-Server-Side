/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import PDFDocument from 'pdfkit';
import { Payment, User } from '@prisma/client';

/**
 * Generates a PDF invoice for a payment.
 * @param {TPayment} payment - The payment object.
 * @returns {Promise<Buffer>} - The generated PDF as a Buffer.
 */
export const generateOrderInvoicePDF = async (payment: Payment & { user: User; event: Event } | any): Promise<Buffer> => {
  return new Promise<Buffer>((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      //@ts-ignore
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err: Error) => reject(err));

      // Header
      doc.fontSize(22).font('Helvetica-Bold').fillColor('#0f172a').text('Next Event', { align: 'center' });
      doc.fontSize(10).fillColor('#334155').text('Secure Event Platform by Next Event Team', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(14).fillColor('#1d4ed8').text('Payment Invoice', { align: 'center' });
      doc.moveDown();

      // Invoice Metadata
      doc.fontSize(11).fillColor('#000000').text(`Invoice ID: ${payment.id}`);
      doc.text(`Issued On: ${new Date(payment.createdAt ?? new Date()).toLocaleDateString()}`);
      doc.text(`Transaction ID: ${payment.transactionId || 'N/A'}`);
      doc.moveDown();

      // Core Details
      doc.text(`User ID: ${payment.userId}`);
      doc.text(`Event ID: ${payment.eventId}`);
      doc.text(`Payment Method: ${payment.method}`);
      doc.text(`Payment Status: ${payment.status}`);
      doc.moveDown();

      // Amount
      const tableY = doc.y;
      doc.font('Helvetica-Bold').fillColor('#1d4ed8').fontSize(11);
      doc.text('Description', 50, tableY);
      doc.text('Amount (BDT)', 400, tableY, { width: 100, align: 'right' });
      doc.moveTo(50, tableY + 15).lineTo(550, tableY + 15).stroke();

      const rowY = tableY + 20;
      doc.font('Helvetica').fillColor('#000000').fontSize(11);
      doc.text('Total Payment', 50, rowY);
      doc.text(`${payment.amount.toFixed(2)} /-`, 400, rowY, { width: 100, align: 'right' });

      // Footer
      doc.moveDown(3);
      doc.fontSize(9).fillColor('#334155').text('Thank you for your payment with Next Event!');
      doc.text('Please keep this invoice for your records.', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
