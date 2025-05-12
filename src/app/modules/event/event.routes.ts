import { NextFunction, Request, Response, Router } from "express";
import { fileUploads } from "../../helpers/fileUploader";
import { EventController } from "./event.controller";
import { creatEventValidation, updateEventValidation } from "./event.validation";
import Auth from "../../middlewares/Auth";
import { Role } from "@prisma/client";

const router = Router();

router.get('/', EventController.getAllEvents);

router.get(
  '/:id',
  // Auth(Role.ADMIN,Role.USER),
  EventController.getSingleEvent,
);

router.get(
  '/slug/:slug',
  // Auth(Role.ADMIN,Role.USER),
  EventController.getSingleEventBySlug,
);

router.get(
  '/profile/my-events',
  Auth(Role.ADMIN, Role.USER),
  EventController.getMyEvents,
);

router.patch('/:id', Auth(Role.ADMIN, Role.USER), EventController.deleteEvent);

router.post(
  '/',
  Auth(Role.ADMIN, Role.USER),
  fileUploads.upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    const parsedData = JSON.parse(req.body.data);
    req.body = creatEventValidation.parse(parsedData);
    return EventController.createEvent(req, res, next);
  },
);

router.patch(
  '/update/:id',
  Auth(Role.ADMIN, Role.USER),
  fileUploads.upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    const parsedData = JSON.parse(req.body.data);
    req.body = updateEventValidation.parse(parsedData);

    return EventController.updateEvent(req, res, next);
  },
);

export const eventRoutes = router;
