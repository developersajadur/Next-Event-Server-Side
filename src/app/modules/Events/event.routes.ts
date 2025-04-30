import { NextFunction, Request, Response, Router } from "express";
import { fileUploads } from "../../helpers/fileUploader";
import { EventController } from "./event.controller";
import { creatEventValidation } from "./event.validation";
import Auth from "../../middlewares/Auth";

const router = Router()

router.get('/',Auth('ADMIN','USER'), EventController.getAllEvents)
router.post('/',Auth('ADMIN','USER') ,fileUploads.upload.single('file'), (req: Request, res: Response, next: NextFunction) => {
    const parsedData = JSON.parse(req.body.data)
    req.body = creatEventValidation.parse(parsedData);

    return EventController.createEvent(req, res, next);
})


export const eventRoutes = router