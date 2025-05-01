/* eslint-disable @typescript-eslint/no-explicit-any */
import config from "../../config";
import SSLCommerzPayment from "sslcommerz-lts";
import status from "http-status";
import AppError from "../../errors/AppError";
import { generateOrderInvoicePDF } from "../../helpers/generatePaymentInvoicePDF";
import { EmailHelper } from "../../helpers/emailHelper";
import prisma from "../../shared/prisma";

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
    currency: "BDT",
    tran_id,
    success_url: `https://next-mart-steel.vercel.app/api/v1/ssl/check-validate-payment?tran_id=${tran_id}`,
    fail_url: config.ssl.failed_url as string,
    cancel_url: config.ssl.cancel_url as string,
    ipn_url: config.ssl.ipn_url,
    shipping_method: "Courier",
    product_name,
    product_category,
    product_profile: "general",
    cus_name,
    cus_email,
    cus_add1: "Dhaka",
    cus_add2: "Dhaka",
    cus_city: "Dhaka",
    cus_state: "Dhaka",
    cus_postcode: "1000",
    cus_country: "Bangladesh",
    cus_phone,
    cus_fax: cus_phone,
    ship_name: cus_name,
    ship_add1: "Dhaka",
    ship_add2: "Dhaka",
    ship_city: "Dhaka",
    ship_state: "Dhaka",
    ship_postcode: 1000,
    ship_country: "Bangladesh",
  };

  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

  try {
    const apiResponse = await sslcz.init(data);
    const GatewayPageURL = apiResponse.GatewayPageURL;

    if (GatewayPageURL) {
      return GatewayPageURL;
    } else {
      throw new AppError(status.BAD_GATEWAY, "Failed to generate payment gateway URL.");
    }
  } catch (error) {
    throw new AppError(status.INTERNAL_SERVER_ERROR, "An error occurred while processing payment.");
  }
};

const validatePayment = async (tran_id: string): Promise<boolean> => {
  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

  try {
    const validationResponse = await sslcz.transactionQueryByTransactionId({ tran_id });
    const gatewayData = validationResponse.element?.[0];

    if (!gatewayData) {
      throw new AppError(status.BAD_REQUEST, "Invalid transaction response.");
    }

    const paymentStatus = ["VALID", "VALIDATED"].includes(gatewayData.status) ? "Paid" : "Failed";

    if (paymentStatus === "Failed") {
      throw new AppError(status.PAYMENT_REQUIRED, "Payment failed.");
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { transactionId: tran_id },
        include: { user: true, event: true },
        data: {
          status: paymentStatus,
          gatewayResponse: gatewayData as any,
        },
      });

      if (!updatedPayment) {
        throw new AppError(status.NOT_FOUND, "Payment record not found or not updated.");
      }

      const payment = await tx.payment.findUnique({ where: { id: updatedPayment.id } });

      if (!payment) {
        throw new AppError(status.NOT_FOUND, "Payment record not found.");
      }

      if (payment.status === "Paid") {
        const emailContent = await EmailHelper.createEmailContent(
          { userName: gatewayData.cus_name || "User" },
          "orderInvoice"
        );
        const pdfBuffer = await generateOrderInvoicePDF(gatewayData);
        const attachment = {
          filename: `Invoice_${tran_id}.pdf`,
          content: pdfBuffer,
          encoding: "base64",
        };

        await EmailHelper.sendEmail(
          gatewayData.cus_email,
          emailContent,
          "Order confirmed - Payment Success!",
          attachment
        );

        return true;
      }

      return false;
    });

    return result;
  } catch (error) {
    console.error(error);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "An error occurred while validating payment.");
  }
};

export const sslCommerzService = {
  initPayment,
  validatePayment,
};
