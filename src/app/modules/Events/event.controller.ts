import httpStatus from 'http-status';
import catchAsync from "../../helpers/catchAsync";
import RefineQuery from '../../helpers/RefineQuery';
import sendResponse from "../../helpers/sendResponse";
import { eventFilterableableFields } from './event.constants';
import { eventService } from "./event.service";
import { Request, Response } from 'express';

const createEvent = catchAsync(async (req, res) => {
    // console.log(req.body);

    const result = await eventService.createEvent(req)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Event created successfully',
        data: result

    })
})
const updateEvent = catchAsync(async (req, res) => {

    const result = await eventService.updateEvent(req)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Event updated successfully',
        data: result

    })
})

const getAllEvents = catchAsync(async (req, res) => {
  
  const query = RefineQuery(req.query, eventFilterableableFields)
    
    const options = RefineQuery(req.query, ['limit', 'page', 'sortBy', 'sortOrder'])

  const result = await eventService.getAllEvents(query, options);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Events fetched successfully',
        data: { data: result.data, meta: result.meta }
    })
})

const getSingleEvent = catchAsync(async (req, res) => {

    const result = await eventService.getSingleEvent(req.params.id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Event fetched successfully',
        data: result
    })
})

const getSingleEventBySlug = catchAsync(async (req, res) => {

    const result = await eventService.getSingleEventBySlug(req.params.slug);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Event fetched successfully',
        data: result
    })
})
const getMyEvents = catchAsync(async (req:Request & { user?: any }, res:Response) => {

    const result = await eventService.getMyEvents(req.user);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Events fetched successfully',
        data: result
    })
})
const deleteEvent = catchAsync(async (req, res) => {

    const result = await eventService.deleteEvent(req.params.id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Event deleted successfully',
        data: result
    })
})



export const EventController = {
    createEvent, getAllEvents,getSingleEvent,updateEvent,deleteEvent,getMyEvents,getSingleEventBySlug
}