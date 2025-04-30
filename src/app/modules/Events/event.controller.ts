import httpStatus from 'http-status';
import catchAsync from "../../helpers/catchAsync";
import RefineQuery from '../../helpers/RefineQuery';
import sendResponse from "../../helpers/sendResponse";
import { eventFilterableableFields } from './event.constants';
import { eventService } from "./event.service";

const createEvent = catchAsync(async (req, res) => {

    const result = await eventService.createEvent(req)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Event created successfully',
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

export const EventController = {
    createEvent, getAllEvents
}