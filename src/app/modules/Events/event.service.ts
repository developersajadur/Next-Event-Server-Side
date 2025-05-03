/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from "@prisma/client";
import CalculatePagination from "../../helpers/CalculatePagination";
import { fileUploads } from "../../helpers/fileUploader";
import prisma from "../../shared/prisma";
import { eventSearchableFields } from "./event.constants";
import slugify from "slugify";





const createEvent = async (Request: any) => {
    const payload = Request.body;
    const bannerImage: Express.Multer.File = Request.file;
  
    // Set organizerId from authenticated user
    payload.organizerId = String(Request.user.id);
  
    // Generate unique slug
    const baseSlug = slugify(payload.title, { lower: true, strict: true }).replace(
      /[^\w\s-]/g,
      ''
    );
    let slug = baseSlug;
    let counter = 1;
  
    while (await prisma.event.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  
    payload.slug = slug;
  
    // Handle banner image upload
    if (bannerImage) {
      const uploadResult = await fileUploads.uploadToCloudinary(bannerImage);
      payload.bannerImage = uploadResult.secure_url;
    }
  
    // Create event
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
  
    // Generate updated slug if title is changed
    if (payload.title) {
      const baseSlug = slugify(payload.title, { lower: true, strict: true }).replace(
        /[^\w\s-]/g,
        ''
      );
      let slug = baseSlug;
      let counter = 1;
  
      while (
        await prisma.event.findFirst({
          where: {
            slug,
            NOT: { id: eventId }, // Avoid conflict with the same event
          },
        })
      ) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
  
      payload.slug = slug;
    }
  
    // Handle banner image upload if new image provided
    if (bannerImage) {
      const uploadResult = await fileUploads.uploadToCloudinary(bannerImage);
      payload.bannerImage = uploadResult.secure_url;
    }
  
    const result = await prisma.event.update({
      where: { id: eventId },
      data: payload,
    });
  
    return result;
  };


const getAllEvents = async (query: any, options: any) => {


    const { searchTerm, minFee, maxFee, isPaid, ...filteredData } = query

    const Query: Prisma.EventWhereInput[] = []
    const { page, limit, skip, sortBy, sortOrder } = CalculatePagination(options)

    if (searchTerm) {
        Query.push({
            OR: eventSearchableFields.map(field => ({ [field]: { contains: searchTerm, mode: "insensitive" } }))
        })
    }
    if (minFee && maxFee) {
        Query.push({
            fee: {
                gte: Number(minFee),
                lte: Number(maxFee)
            },

        })
    }
    if (typeof isPaid !== 'undefined') {
        Query.push({
            isPaid: isPaid === 'true'
        });
    }
    Query.push({
        isDeleted: false
    })

    if (Object.keys(filteredData).length > 0)
        Query.push({
            AND: Object.keys(filteredData).map(key => ({
                [key]: filteredData[key]
            }))
        })

    const QueryCondition: Prisma.EventWhereInput = { AND: Query }


    const result = await prisma.event.findMany({
        where: QueryCondition,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder as Prisma.SortOrder
        }
    })
    const total = await prisma.event.count({
        where: QueryCondition
    })

    return {
        meta: {
            page, limit, total
        },
        data: result
    }

}

const getSingleEvent = async (id: string) => {
    const result = await prisma.event.findUniqueOrThrow({
        where: {  id },
    })
    return result
    
    }
const deleteEvent = async (id: string) => {
    await prisma.event.findUniqueOrThrow({
        where: {  id },
    })

    const result = await prisma.event.delete({
        where: { id },
        
    })
    return result
    
    }
export const eventService = {
    createEvent, getAllEvents,getSingleEvent,updateEvent,deleteEvent
};