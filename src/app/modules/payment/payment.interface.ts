/* eslint-disable @typescript-eslint/no-explicit-any */

export type TPayment = {
  id: string;
  userId: string;
  eventId: string;
  method: 'COD' | 'Online';
  status: 'Pending' | 'Paid' | 'Failed';
  transactionId?: string;
  amount: number;
  gatewayResponse?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
};
