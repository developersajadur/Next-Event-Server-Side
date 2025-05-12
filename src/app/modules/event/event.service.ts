/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from '@prisma/client';

import { fileUploads } from '../../helpers/fileUploader';
import prisma from '../../shared/prisma';
import { eventSearchableFields } from './event.constants';
import calculatePagination from '../../helpers/CalculatePagination';
import slugify from 'slugify';

const createEvent = async (Request: any) => {
  const payload = Request.body;
  const bannerImage: Express.Multer.File = Request.file;
  // console.log(bannerImage);

  payload.organizerId = Request.user.id;

  if (bannerImage) {
    const UploadToCloudinary =
      await fileUploads.uploadToCloudinary(bannerImage);
    payload.bannerImage = UploadToCloudinary.secure_url;
  }

  if (payload.title) {
    const baseSlug = slugify(payload.title, {
      lower: true,
      strict: true,
    }).replace(/[^\w\s-]/g, '');
    let slug = baseSlug;
    let counter = 1;

    while (
      await prisma.event.findUnique({
        where: {
          slug,
        },
      })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    payload.slug = slug;
  }

  // console.log(payload);
  const result = await prisma.event.create({
    data: payload,
  });

  return result;
};

const updateEvent = async (Request: any) => {
  const payload = Request.body;
  const bannerImage: Express.Multer.File = Request.file;
  const eventId = Request.params.id;

  payload.organizerId = String(Request.user.id);

  if (payload.title) {
    const baseSlug = slugify(payload.title, {
      lower: true,
      strict: true,
    }).replace(/[^\w\s-]/g, '');
    let slug = baseSlug;
    let counter = 1;

    while (
      await prisma.event.findFirst({
        where: {
          slug,
          NOT: { id: eventId },
        },
      })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    payload.slug = slug;
  }

  if (bannerImage) {
    const uploadResult = await fileUploads.uploadToCloudinary(bannerImage);
    payload.bannerImage = uploadResult.secure_url;
  }

  const result = await prisma.event.update({
    where: {
      id: Request.params.id,
      isDeleted: false,
    },
    data: payload,
  });
  return result;
};

const getAllEvents = async (query: any, options: any) => {
  const {
    searchTerm,
    minFee,
    maxFee,
    isPaid,
    isPrivate,
    eventStatus,
    ...filteredData
  } = query;

  const Query: Prisma.EventWhereInput[] = [];
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);

  if (searchTerm) {
    Query.push({
      OR: eventSearchableFields.map((field) => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      })),
    });
  }
  if (eventStatus) {
    Query.push({
      eventStatus,
    });
  }
  if (minFee && maxFee) {
    Query.push({
      fee: {
        gte: Number(minFee),
        lte: Number(maxFee),
      },
    });
  }
  if (typeof isPaid !== 'undefined') {
    Query.push({
      isPaid: isPaid === 'true',
    });
  }
  Query.push({
    isDeleted: false,
  });
  if (typeof isPrivate !== 'undefined') {
    Query.push({
      type: isPrivate,
    });
  }
  Query.push({
    isDeleted: false,
  });

  if (Object.keys(filteredData).length > 0)
    Query.push({
      AND: Object.keys(filteredData).map((key) => ({
        [key]: filteredData[key],
      })),
    });

  const QueryCondition: Prisma.EventWhereInput = { AND: Query };

  const result = await prisma.event.findMany({
    where: QueryCondition,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder as Prisma.SortOrder,
    },
  });
  const total = await prisma.event.count({
    where: QueryCondition,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSingleEvent = async (id: string) => {
  const result = await prisma.event.findUniqueOrThrow({
    where: { id, isDeleted: false },
    include: {
      organizer: true,
    },
  });
  return result;
};



const getMyEvents = async (payload: any) => {

  const result = await prisma.event.findMany({
    where: { organizerId: payload.id, isDeleted: false },
    include:{
      participants: {
        select: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
        },
      }
    }
  });
  return result;
};



const getSingleEventBySlug = async (slug: string) => {
  const result = await prisma.event.findUniqueOrThrow({
    where: { slug, isDeleted: false },
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
          occupation: true,
          address: true,
         phoneNumber: true,
        },
      },
      participants: {
        select: {
        userId: true,
        },
      },
    },
  });
  return result;
};

const deleteEvent = async (id: string) => {
  // console.log(id);
  await prisma.event.findUniqueOrThrow({
    where: { id },
  });

  const result = await prisma.event.update({
    where: { id },
    data: { isDeleted: true },
  });
  return result;
};
export const eventService = {
  createEvent,
  getAllEvents,
  getSingleEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
  getSingleEventBySlug,
};
