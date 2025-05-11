/* eslint-disable @typescript-eslint/no-explicit-any */


import AppError from "../../errors/AppError";
import prisma from "../../shared/prisma"
import httpStatus from "http-status"


const createReview = async (payload: any, id: string) => {
    const event = await prisma.event.findUnique({
      where: {
        id: payload.eventId,
        isDeleted: false,
      },
    });
  
    if (!event) {      
      throw new AppError(httpStatus.NOT_FOUND ,"Event not found")
    }
  
    const existingReview = await prisma.review.findFirst({
      where: {
        reviewerId: id, 
        eventId: payload.eventId,
        isDeleted: false,
      },
    });
  
    if (existingReview) {
        throw new AppError(httpStatus.NOT_ACCEPTABLE ,"You already reviewed this event")
     
    }
  
    const participation = await prisma.participant.findFirst({
      where: {
        eventId: payload.eventId,
        userId: id, 
        status: "APPROVED",
      },
    });
  
    if (!participation) {
        throw new AppError(httpStatus.NOT_ACCEPTABLE ,"You didn't attend this event")      
    }
  
    const result = await prisma.review.create({
        data: payload
    });
    // console.log(result);
  
    return result;
  };
  

const getAllReview = async(filter?: { rating?: number; user?: string }) => {    
    const result = await prisma.review.findMany({
        where: {
          isDeleted: false,
          ...(filter?.rating && { rating: filter.rating }),
          ...(filter?.user && {
            reviewer: {
              name: {
                contains: filter.user,
                mode: 'insensitive', 
              },
            },
          }),
        },
        include: {
          event: true,
          reviewer: true,
        },
      });
      return result;
}

// Get current user's reviews
const getMyReviews = async (id: string) => {
    
  const result = await prisma.review.findUnique({
    where: { id},
    include: { 
      reviewer: true 
    },
  });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "No review found with this ID");
  }
  //console.log("my Review Data..........: ", result);
  return result;
};

const updateReview = async (reviewId: string, userId: string, payload: any) => {
    const review = await prisma.review.findUnique(
        { where: 
            { 
                id: reviewId 
            } 
        });
  
    if (!review || review.isDeleted) {
      throw new AppError(httpStatus.NOT_FOUND, "Review not found");
    }
  
    if (review.reviewerId !== userId) {
      throw new AppError(httpStatus.FORBIDDEN, "You can only update your own review");
    }
  
    const result = await prisma.review.update({
      where: { 
        id: reviewId 
    },
      data: {
        rating: payload.rating ?? review.rating,
        comment: payload.comment ?? review.comment,
      },
    });
  
    return result;
  };
  

const deleteReview = async (id: string) => {
    const review = await prisma.review.findUnique({ where: { id } });
  
    if (!review || review.isDeleted) {      
      throw new AppError(httpStatus.NOT_FOUND ,"Review not found or already deleted")     
    }
  
    if (review.reviewerId !== id) {
        throw new AppError(httpStatus.NOT_FOUND ,"You can only delete your own review")       
    }
  
    const result = await prisma.review.update({
      where: { id },
      data: { isDeleted: true },
    });
  
    return result;
  };

  const getReviewsByEventId = async (eventId: string) => {
    const reviews = await prisma.review.findMany({
      where: {
        eventId,
        isDeleted: false,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          }
        },
      },
    });
  
    return reviews;
  }

export const ReviewServices = {
    createReview,
    getAllReview,
    deleteReview,
    updateReview,
    getMyReviews,
    getReviewsByEventId
}