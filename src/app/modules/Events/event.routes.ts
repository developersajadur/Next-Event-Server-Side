import { NextFunction, Request, Response, Router } from "express";
import { fileUploads } from "../../helpers/fileUploader";
import { EventController } from "./event.controller";
import { creatEventValidation, updateEventValidation } from "./event.validation";
import Auth from "../../middlewares/Auth";

const router = Router()

router.get('/', EventController.getAllEvents)

router.get('/:slug', EventController.getSingleEventBySlug)

router.get('/:id',Auth('ADMIN','USER'), EventController.getSingleEvent)

router.delete('/:id',Auth('ADMIN'), EventController.deleteEvent)

router.post('/',Auth('ADMIN','USER') ,fileUploads.upload.single('file'), (req: Request, res: Response, next: NextFunction) => {
    const parsedData = JSON.parse(req.body.data)
    req.body = creatEventValidation.parse(parsedData);

    return EventController.createEvent(req, res, next);
})

router.patch('/:id',Auth('ADMIN','USER') ,fileUploads.upload.single('file'), (req: Request, res: Response, next: NextFunction) => {
    const parsedData = JSON.parse(req.body.data)
    req.body = updateEventValidation.parse(parsedData);

    return EventController.updateEvent(req, res, next);
})


export const eventRoutes = router