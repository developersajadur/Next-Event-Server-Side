import { PaymentStatus } from '@prisma/client';
import prisma from '../../shared/prisma';
import { getBarChartData } from './meta.utils';

const getMetaData = async () => {
  const totalUser = await prisma.user.count({
    where: {
      isDeleted: false,
    },
  });
  const totalEvent = await prisma.event.count({
    where: {
      isDeleted: false,
    },
  });
  const totalPayment = await prisma.payment.count({
    where: {
      status: PaymentStatus.Paid,
    },
  });

  const totalReview = await prisma.review.count({
    where: {
      isDeleted: false,
    },
  });

  const totalParticipant = await prisma.participant.count({
    where: {
      isDeleted: false,
    },
  });
  const totalInvite = await prisma.invite.count({
    where: {
      isDeleted: false,
    },
  });

  const totalPaymentAmount = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: PaymentStatus.Paid,
    },
  });

  const barChartData = await getBarChartData();

  return {
    totalUser,
    totalEvent,
    totalPayment,
    totalReview,
    totalParticipant,
    totalInvite,
    totalPaymentAmount: totalPaymentAmount._sum.amount || 0,
    barChartData
  };
};





export const metaService = {
  getMetaData,
};
