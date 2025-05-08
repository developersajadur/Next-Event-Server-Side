import { Router } from "express";
import Auth from "../../middlewares/Auth";
import { paymentController } from "./payment.controller";
import { Role } from "@prisma/client";


const router = Router();



router.post("/make-payment", Auth(Role.USER, Role.ADMIN), paymentController.createOrder)
router.get("/my-payments", Auth(Role.USER, Role.ADMIN), paymentController.getMyPayments)
router.get("/", Auth(Role.USER, Role.ADMIN), paymentController.getAllPayments)



export const paymentRoute = router;