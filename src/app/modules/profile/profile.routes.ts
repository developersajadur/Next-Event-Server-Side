import { Role } from '@prisma/client';
import { Router } from 'express';
import { fileUploads } from '../../helpers/fileUploader';
import auth from '../../middlewares/Auth';
import { ProfileController } from '../profile/profile.controller';

const router = Router();

router.get('/:id', auth('ADMIN', 'USER'), ProfileController.getSingleProfile);

// update profile
router.patch(
  '/:userId',
  auth(Role.USER),
  fileUploads.upload.single('profileImage'),
  ProfileController.updateUserProfile,
);

// get profile
router.get(
  '/get/my-profile-data',
  auth(Role.ADMIN, Role.USER),
  ProfileController.getMyProfileData,
);

export const profileRoutes = router;
