import { NextFunction, Request, Response, Router } from "express"
import { fileUploads } from "../../helpers/fileUploader"
import Auth from "../../middlewares/Auth"
import { ProfileController } from "../profile/profile.controller"
import { profileValidation } from "../profile/profile.validation"
import { Role } from "@prisma/client"

const router = Router()

router.get('/:id', Auth('ADMIN','USER'),ProfileController.getSingleProfile)

router.patch('/:id',Auth('ADMIN','USER') ,fileUploads.upload.single('file'), (req: Request, res: Response, next: NextFunction) => {
    const parsedData = JSON.parse(req.body.data)
    req.body = profileValidation.parse(parsedData);

    return ProfileController.updateUserProfile(req, res, next);
})

router.get('/get/my-profile-data', Auth(Role.ADMIN, Role.USER), ProfileController.getMyProfileData)


export const profileRoutes = router