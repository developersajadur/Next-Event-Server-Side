/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import config from "../../config";
import SSLCommerzPayment from 'sslcommerz-lts';
import status from "http-status";
import AppError from "../../errors/AppError";
import { generateOrderInvoicePDF } from "../../helpers/generatePaymentInvoicePDF";
import { EmailHelper } from "../../helpers/sendEmail";
import prisma from "../../shared/prisma";


const store_id = config.ssl.store_id as string;
const store_passwd = config.ssl.store_pass as string;
const is_live = false; 



// SSLCommerz init
const initPayment = async (paymentData: { total_amount: number, tran_id: string }) => {
    const { total_amount, tran_id } = paymentData;
  
    const data = {
      total_amount,
      currency: 'BDT',
      tran_id, // Unique transaction ID for each API call
      success_url: `${config.ssl.validation_url}?tran_id=${tran_id}`,
      fail_url: config.ssl.failed_url as string,
      cancel_url: config.ssl.cancel_url as string,
      ipn_url: 'http://next-mart-steel.vercel.app/api/v1/ssl/ipn',
      shipping_method: 'Courier',
      product_name: 'N/A.',
      product_category: 'N/A',
      product_profile: 'general',
      cus_name: 'N/A',
      cus_email: 'N/A',
      cus_add1: 'Dhaka',
      cus_add2: 'Dhaka',
      cus_city: 'Dhaka',
      cus_state: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: '01711111111',
      cus_fax: '01711111111',
      ship_name: 'N/A',
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
        return GatewayPageURL; // Return the URL for the user to complete the payment
      } else {
        throw new AppError(status.BAD_GATEWAY, "Failed to generate payment gateway URL.");
      }
    } catch (error) {
      throw new AppError(status.INTERNAL_SERVER_ERROR, "An error occurred while processing payment.");
    }
  };
  




export const validatePaymentService = async (tran_id: string): Promise<boolean> => {
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
  
    try {
      // @ts-ignore
      const validationResponse = await sslcz.transactionQueryByTransactionId({ tran_id });
      const gatewayData = validationResponse.element[0];
  
      if (!gatewayData) throw new AppError(status.BAD_REQUEST, 'Invalid transaction response.');
  
      // Set payment status based on gateway response
      const paymentStatus = ['VALID', 'VALIDATED'].includes(gatewayData.status) ? 'Paid' : 'Failed';
  
      const updatedPayment = await prisma.payment.update({
        where: {
          transactionId: tran_id, // Now you can use transactionId as the unique identifier
        },
        data: {
          status: paymentStatus,
          gatewayResponse: gatewayData as any, 
        },
      });
      
      
  
      if (!updatedPayment) {
        throw new AppError(status.NOT_FOUND, 'Payment record not found or not updated.');
      }
  
      if (paymentStatus === 'Failed') {
        throw new AppError(status.PAYMENT_REQUIRED, 'Payment failed.');
      }
  
      // If the payment was successful, generate invoice and send email
      const emailContent = await EmailHelper.createEmailContent(
        { userName: gatewayData.cus_name || 'User' },
        'orderInvoice'
      );
  
      const pdfBuffer = await generateOrderInvoicePDF(gatewayData);
  
      const attachment = {
        filename: `Invoice_${tran_id}.pdf`,
        content: pdfBuffer,
        encoding: 'base64',
      };
  
      await EmailHelper.sendEmail(
        gatewayData.cus_email,
        emailContent,
        'Order confirmed - Payment Success!',
        attachment
      );
  
      return true; // Payment successfully validated and email sent
    } catch (error) {
      console.error('Error validating payment:', error);
      return false;
    }
  };


export const sslCommerzService = {
    initPayment,
    validatePaymentService
}