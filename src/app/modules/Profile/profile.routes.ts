import { Role } from "@prisma/client"
import auth from "../../middlewares/Auth"
import { Router } from "express"
import { ProfileController } from "../profile/profile.controller"

const router = Router()

router.get('/:id', auth('ADMIN','USER'),ProfileController.getSingleProfile)

router.patch("/:userId", auth(Role.USER), ProfileController.updateUserProfile)

router.get('/get/my-profile-data', auth(Role.ADMIN, Role.USER), ProfileController.getMyProfileData)


export const profileRoutes = router