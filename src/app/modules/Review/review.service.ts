import prisma from "../../shared/prisma"
import { IReview } from "./review.interface"

const createReview = async(payload: IReview) => {
   
    const  reviewData = {
        eventId: payload.eventId ,
        reviewerId: payload.reviewerId,
        rating: payload.rating,
        comment: payload.comment,
    };
    const result = await prisma.review.create({
        data: reviewData,
    });
    return result;
}


const getAllReview = async() => {    
    const result = await prisma.review.findMany();
    return result;
}

const deleteReview = async(id: string) => {
    const result = await prisma.review.delete({
        where: {
            id,
          },
    });
    return result;
}

export const ReviewServices = {
    createReview,
    getAllReview,
    deleteReview
}