"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventRoutes = void 0;
const express_1 = require("express");
const fileUploader_1 = require("../../helpers/fileUploader");
const event_controller_1 = require("../events/event.controller");
const event_validation_1 = require("../events/event.validation");
const Auth_1 = __importDefault(require("../../middlewares/Auth"));
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.get('/', event_controller_1.EventController.getAllEvents);
router.get('/:id', 
// Auth(Role.ADMIN,Role.USER),
event_controller_1.EventController.getSingleEvent);
router.get('/slug/:slug', 
// Auth(Role.ADMIN,Role.USER),
event_controller_1.EventController.getSingleEventBySlug);
router.get('/my-events', (0, Auth_1.default)(client_1.Role.ADMIN, client_1.Role.USER), event_controller_1.EventController.getMyEvents);
router.patch('/:id', (0, Auth_1.default)(client_1.Role.ADMIN), event_controller_1.EventController.deleteEvent);
router.post('/', (0, Auth_1.default)(client_1.Role.ADMIN, client_1.Role.USER), fileUploader_1.fileUploads.upload.single('file'), (req, res, next) => {
    const parsedData = JSON.parse(req.body.data);
    req.body = event_validation_1.creatEventValidation.parse(parsedData);
    return event_controller_1.EventController.createEvent(req, res, next);
});
router.patch('/:id', (0, Auth_1.default)(client_1.Role.ADMIN, client_1.Role.USER), fileUploader_1.fileUploads.upload.single('file'), (req, res, next) => {
    const parsedData = JSON.parse(req.body.data);
    req.body = event_validation_1.updateEventValidation.parse(parsedData);
    return event_controller_1.EventController.updateEvent(req, res, next);
});
exports.eventRoutes = router;
