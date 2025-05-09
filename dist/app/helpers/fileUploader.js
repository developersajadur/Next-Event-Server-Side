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
exports.fileUploads = void 0;
const cloudinary_1 = require("cloudinary");
const multer_1 = __importDefault(require("multer"));
const stream_1 = require("stream");
const config_1 = __importDefault(require("../config"));
cloudinary_1.v2.config({
    cloud_name: config_1.default.cloudinary.CLOUD_NAME,
    api_key: config_1.default.cloudinary.CLOUD_API_KEY,
    api_secret: config_1.default.cloudinary.CLOUD_API_SECRET,
});
// Use memory storage instead of writing to disk
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
// Helper to convert buffer to stream
const bufferToStream = (buffer) => {
    const readable = new stream_1.Readable();
    readable._read = () => { };
    readable.push(buffer);
    readable.push(null);
    return readable;
};
// Function to upload file buffer to Cloudinary
const uploadToCloudinary = (file) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream((error, result) => {
            if (error)
                return reject(error);
            resolve(result);
        });
        bufferToStream(file.buffer).pipe(uploadStream);
    });
});
exports.fileUploads = {
    upload,
    uploadToCloudinary,
};
