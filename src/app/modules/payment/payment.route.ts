import { Router } from "express";
import Auth from "../../middlewares/Auth";
import { paymentController } from "./payment.controller";
import { Role } from "@prisma/client";


const router = Router();



router.post("/make-payment", Auth(Role.USER, Role.ADMIN), paymentController.createOrder)



export const paymentRoute = router;