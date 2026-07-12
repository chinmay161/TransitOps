import { Router } from 'express';
import * as authController from './auth.controller.js';
import { authenticate, authorize } from './auth.middleware.js';

const router = Router();

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/change-password', authenticate, authController.changePassword);
router.get('/verify-email', authController.verifyEmail);
router.get('/me', authenticate, authController.getMe);

// Public registration (Drivers and Dispatchers self-register)
router.post('/register/driver', authController.registerDriver);
router.post('/register/dispatcher', authController.registerDispatcher);

// Admin-only: create Fleet Manager accounts
router.post('/users/fleet-managers', authenticate, authorize('admin'), authController.createFleetManager);

export default router;
