import AppError from "../../errors/AppError";
import prisma from "../../shared/prisma"
import httpStatus from "http-status"

// eslint-disable-next-line no-unused-vars
const createReview = async (payload: any) => {
 // console.log("Payload:", payload);

    const event = await prisma.event.findUnique({
      where: {
        id: payload.eventId,        
      },
    });
  
    if (!event || event.isDeleted) {
      console.log("Event not found")
      throw new AppError(httpStatus.NOT_FOUND, "Event not found");
      
    }
  
    const existingReview = await prisma.review.findFirst({
      where: {
        reviewerId: payload.userId, 
        eventId: payload.eventId,       
        isDeleted: false,
      },
    });
    
  
    if (existingReview) {
      console.log(existingReview)
        throw new AppError(httpStatus.NOT_ACCEPTABLE ,"You already reviewed this event")
     
    }
    console.log("Checking participation for:", {
      eventId: payload.eventId,
      userId: payload.userId,
    })

    // const participation = await prisma.participant.findFirst({
    //   where: {
    //     eventId: payload.eventId,
    //     userId: payload.userId,    
  
    //   },
    // });

    // if (!participation) {
    //     throw new AppError(httpStatus.NOT_ACCEPTABLE ,"You didn't attend this event")      
    // }
  
    const result = await prisma.review.create({
      data: {
        rating: payload.rating,
        comment: payload.comment,
        event: {
          connect: { id: payload.eventId },
        },
        reviewer: {
          connect: { id: payload.userId },
        },
      },
    });
  
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


  
  const myAllReviews = async (reviewerId: string) => {
    const reviews = await prisma.review.findMany({
      where: {
         reviewerId, 
        isDeleted: false,
      },
      include: {
        event: true, 
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  
    return reviews;
  };

  
const getReviewsByEvent = async (eventId: string) => {
 
  const reviews = await prisma.review.findMany({
    where: {
      eventId: eventId,
      isDeleted: false,
    },
    select: {
      comment: true,
      rating: true,
      createdAt: true,
      eventId: true, 
      reviewer: {
        select: {
          name: true,
          email: true,
          profileImage: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
 
  const transformedReviews = reviews.map((review) => ({
    name: review.reviewer.name,
    role: 'User',
    comment: review.comment,
    rating: review.rating,
    image: review.reviewer.profileImage || '/placeholder.svg',
    eventId: review.eventId,
  }));

  
  return transformedReviews;
};
export const ReviewServices = {
    createReview,
    getAllReview,
    deleteReview,
    updateReview,
    getMyReviews,
    myAllReviews,
    getReviewsByEvent
}