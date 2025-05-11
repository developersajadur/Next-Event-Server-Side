/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import PDFDocument from 'pdfkit';
import { Payment, User, Event } from '@prisma/client';
import axios from 'axios';

export const generateOrderInvoicePDF = async (
  payment: Payment & { user: User; event: Event } | any
): Promise<Buffer> => {
  return new Promise<Buffer>(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      //@ts-ignore
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err: Error) => reject(err));

      // HEADER
      doc.fontSize(24).font('Helvetica-Bold').fillColor('#0f172a').text('Next Event', { align: 'center' });
      doc.fontSize(10).fillColor('#334155').text('Secure Event Platform by Next Event Team', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(14).fillColor('#1d4ed8').text('Payment Invoice', { align: 'center' });
      doc.moveDown();

      // BANNER IMAGE (if available)
      if (payment.event?.bannerImage) {
        try {
          const imageResponse = await axios.get(payment.event.bannerImage, { responseType: 'arraybuffer' });
          const imageBuffer = Buffer.from(imageResponse.data, 'base64');
          doc.image(imageBuffer, {
            width: 400,
            height: 250,
            align: 'center',
            valign: 'center',
          });
          doc.moveDown();
        } catch (e) {
          console.warn('Banner image could not be loaded.');
        }
      }

      // METADATA
      doc.fontSize(11).fillColor('#000000').text(`Invoice ID: ${payment.id}`);
      doc.text(`Issued On: ${new Date(payment.createdAt ?? new Date()).toLocaleDateString()}`);
      doc.text(`Transaction ID: ${payment.transactionId || 'N/A'}`);
      doc.moveDown();

      // USER DETAILS
      doc.fontSize(11).fillColor('#000000').text(`User Name: ${payment.user?.name}`);
      doc.text(`User Email: ${payment.user?.email}`);
      doc.moveDown();

      // EVENT DETAILS
      doc.fontSize(11).fillColor('#000000').text(`Event Title: ${payment.event?.title}`);
      doc.text(`Venue: ${payment.event?.venue || 'N/A'}`);
      doc.text(`Event Description:`);
      doc.font('Helvetica-Oblique').text(`${payment.event?.description || 'N/A'}`, { align: 'justify' });
      doc.moveDown();

      // PAYMENT DETAILS
      doc.fontSize(11).fillColor('#000000').text(`Payment Method: ${payment.method}`);
      doc.text(`Payment Status: ${payment.status}`);
      doc.moveDown();

      // AMOUNT TABLE
      const tableY = doc.y;
      doc.font('Helvetica-Bold').fillColor('#1d4ed8').fontSize(11);
      doc.text('Description', 50, tableY);
      doc.text('Amount (BDT)', 400, tableY, { width: 100, align: 'right' });
      doc.moveTo(50, tableY + 15).lineTo(550, tableY + 15).stroke();

      const rowY = tableY + 20;
      doc.font('Helvetica').fillColor('#000000').fontSize(11);
      
      // Ensure payment.amount is a valid number
      // let amount: number;
      
      // if (typeof payment.amount === 'string') {
      //   amount = parseFloat(payment.amount);
      // } else if (typeof payment.amount === 'number') {
      //   amount = payment.amount;
      // } else {
      //   throw new Error('Invalid payment amount: must be a number or numeric string');
      // }
      
      doc.text('Total Payment', 50, rowY);
      doc.text(`${payment.amount.toFixed(2)} /-`, 400, rowY, { width: 100, align: 'right' });
      

      // FOOTER
      doc.moveDown(3);
      doc.fontSize(9).fillColor('#334155').text('Thank you for your payment with Next Event!');
      doc.text('Please keep this invoice for your records.', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
