import status from 'http-status';
import AppError from '../../errors/AppError';
import prisma from '../../shared/prisma';
import { ParticipationStatus, Prisma } from '@prisma/client';
import CalculatePagination from '../../helpers/CalculatePagination';
import { IPaginationOptions } from '../../interfaces/pagination';

const createParticipant = async (payload: any) => {
  const isExistEvent = await prisma.event.findUnique({
    where: {
      id: payload.eventId,
    },
  });

  if (!isExistEvent || isExistEvent.isDeleted) {
    throw new AppError(status.NOT_FOUND, 'Event not found');
  }

  if (isExistEvent.isPaid) {
    // console.log(payload.userId, payload.eventId);
    const isExistPayment = await prisma.payment.findFirst({
      where: {
        userId: payload.userId,
        eventId: payload.eventId,
      },
    });
    // console.log(isExistPayment);

    if (!isExistPayment) {
      throw new AppError(
        status.NOT_FOUND,
        'Payment not found! Please pay first',
      );
    }
  }

  const isAlreadyParticipated = await prisma.participant.findFirst({
    where: {
      userId: payload.userId,
      eventId: payload.eventId,
      isDeleted: false,
    },
  });

  if (isAlreadyParticipated) {
    throw new AppError(
      status.BAD_REQUEST,
      'You have already participated in this event',
    );
  }

  const result = await prisma.participant.create({
    data: payload,
  });
  // console.log(result, "fdfddfd");

  return result;
};

const getAllParticipants = async (
  query: Record<string, any>,
  options: IPaginationOptions,
) => {
  const { searchTerm, ...filters } = query;
  const { page, limit, skip, sortBy, sortOrder } = CalculatePagination(options);

  const where: Prisma.ParticipantWhereInput = {
    isDeleted: false,
    ...(searchTerm && {
      OR: [
        { user: { name: { contains: searchTerm, mode: 'insensitive' } } },
        { user: { email: { contains: searchTerm, mode: 'insensitive' } } },
        {
          user: { phoneNumber: { contains: searchTerm, mode: 'insensitive' } },
        },
        { event: { title: { contains: searchTerm, mode: 'insensitive' } } },
        { event: { venue: { contains: searchTerm, mode: 'insensitive' } } },
      ],
    }),
    ...(Object.keys(filters).length > 0 && {
      AND: Object.entries(filters).map(([key, value]) => ({
        [key]:
          typeof value === 'string' && (value === 'true' || value === 'false')
            ? value === 'true'
            : value,
      })),
    }),
  };

  const result = await prisma.participant.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      event: {
        select: {
          id: true,
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
          email: true,
          phoneNumber: true,
          profileImage: true,
        },
      },
    },
  });

  const total = await prisma.participant.count({ where });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const getAllParticipantsByEventId = async (eventId: string) => {
  const result = await prisma.participant.findMany({
    where: {
      eventId,
      isDeleted: false,
    },
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

  return result;
};

const updateParticipantStatus = async (
  participantId: string,
  status: ParticipationStatus,
) => {
  const isExistParticipant = await prisma.participant.findUnique({
    where: {
      id: participantId,
      isDeleted: false,
    },
  });

  if (!isExistParticipant) {
    throw new AppError(404, 'Participant not found');
  }

  const result = await prisma.participant.update({
    where: {
      id: participantId,
    },
    data: {
      status,
    },
  });

  return result;
};

export const participantService = {
  createParticipant,
  getAllParticipants,
  getAllParticipantsByEventId,
  updateParticipantStatus,
};
