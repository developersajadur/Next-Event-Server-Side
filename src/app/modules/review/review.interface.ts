export type IReview = {
  id: string;
  eventId: string;
  reviewerId: string;
  rating: number;
  comment: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};
