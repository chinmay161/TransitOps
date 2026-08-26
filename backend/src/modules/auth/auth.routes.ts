import { Router } from 'express';
import * as authController from './auth.controller.js';
import { authenticate } from './auth.middleware.js';

const router = Router();

// Session profile for the authenticated Better Auth user.
// Sign-in/sign-out endpoints are served by the Better Auth handler
// mounted at /api/auth/* in index.ts.
router.get('/me', authenticate, authController.getMe);

export default router;
