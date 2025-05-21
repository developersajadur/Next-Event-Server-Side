import prisma from "../../shared/prisma";

export const getBarChartData = async () => {
  const eventData: { month: Date; count: number }[] = await prisma.$queryRaw`
    SELECT DATE_TRUNC('month', "createdAt") AS month,
    COUNT(*)::INTEGER AS count
    FROM "events"
    WHERE "isDeleted" = false
    GROUP BY month
    ORDER BY month ASC;
  `;

  const paymentData: { month: Date; count: number }[] = await prisma.$queryRaw`
    SELECT DATE_TRUNC('month', "createdAt") AS month,
    COUNT(*)::INTEGER AS count
    FROM "payments"
    WHERE "status" = 'Paid'
    GROUP BY month
    ORDER BY month ASC;
  `;

  const sentInviteData: { month: Date; count: number }[] = await prisma.$queryRaw`
    SELECT DATE_TRUNC('month', "createdAt") AS month,
    COUNT(*)::INTEGER AS count
    FROM "invites"
    WHERE "isDeleted" = false
    GROUP BY month
    ORDER BY month ASC;
  `;

  const reviewData: { month: Date; count: number }[] = await prisma.$queryRaw`
    SELECT DATE_TRUNC('month', "createdAt") AS month,
    COUNT(*)::INTEGER AS count
    FROM "reviews"
    WHERE "isDeleted" = false
    GROUP BY month
    ORDER BY month ASC;
  `;

  const userData = await prisma.$queryRaw`
    SELECT DATE_TRUNC('month', "createdAt") AS month,
    COUNT(*)::INTEGER AS count
    FROM "users"
    WHERE "isDeleted" = false
    GROUP BY month
    ORDER BY month ASC;
  `


  return { eventData, paymentData, sentInviteData, reviewData, userData };
};