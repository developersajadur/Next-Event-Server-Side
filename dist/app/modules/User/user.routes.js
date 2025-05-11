"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const fileUploader_1 = require("../../helpers/fileUploader");
const user_controller_1 = require("../user/user.controller");
const user_validation_1 = require("../user/user.validation");
const router = express_1.default.Router();
router.get('/', user_controller_1.userController.getAllUsersFromDB);
router.get('/:id', user_controller_1.userController.getSingleUserFromDB);
router.delete('/:id', 
//auth(Role.ADMIN),
user_controller_1.userController.deleteUserFromDB);
router.post('/register', fileUploader_1.fileUploads.upload.single('file'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsedData = JSON.parse(req.body.data);
        if (req.file) {
            // parsedData.profileImage = `${process.env.SERVER_URL}/uploads/${req.file.filename}`;
            const cloudinaryRes = yield fileUploader_1.fileUploads.uploadToCloudinary(req.file);
            // console.log('Cloudinary result:', cloudinaryRes);
            parsedData.profileImage = cloudinaryRes.secure_url;
        }
        const validatedData = user_validation_1.createUserZodSchema.parse(parsedData);
        req.body = validatedData;
        // console.log(req.body)
        return user_controller_1.userController.createUserIntoDB(req, res, next);
    }
    catch (error) {
        next(error);
    }
}));
exports.userRouter = router;
