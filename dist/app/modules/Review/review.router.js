"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRouter = void 0;
const express_1 = __importDefault(require("express"));
const review_controller_1 = require("../review/review.controller");
const Auth_1 = __importDefault(require("../../middlewares/Auth"));
const router = express_1.default.Router();
router.get('/:id', (0, Auth_1.default)('USER'), review_controller_1.ReviewController.getMyReviews);
router.post('/', (0, Auth_1.default)('USER'), review_controller_1.ReviewController.createReview);
router.get('/', (0, Auth_1.default)('ADMIN'), review_controller_1.ReviewController.getAllReview);
router.patch('/:id', (0, Auth_1.default)('USER'), review_controller_1.ReviewController.updateReview);
router.delete('/:id', (0, Auth_1.default)('ADMIN', 'USER'), review_controller_1.ReviewController.deleteReview);
exports.ReviewRouter = router;
