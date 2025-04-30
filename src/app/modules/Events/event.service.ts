/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from "@prisma/client";
import CalculatePagination from "../../helpers/CalculatePagination";
import { fileUploads } from "../../helpers/fileUploader";
import prisma from "../../shared/prisma";
import { eventSearchableFields } from "./event.constants";





const createEvent = async (Request: any) => {

    const payload = Request.body
    const bannerImage: Express.Multer.File = Request.file

    payload.organizerId = String(Request.user.id)



    if (bannerImage) {
        const UploadToCloudinary = await fileUploads.uploadToCloudinary(bannerImage)
        payload.bannerImage = UploadToCloudinary.secure_url
    }
    const result = await prisma.event.create({
        data: payload

    })
    return result
}


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


export const eventService = {
    createEvent, getAllEvents
};