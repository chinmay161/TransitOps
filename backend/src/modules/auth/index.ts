export { default as authRouter } from './auth.routes.js';
export { authenticate, authorize, authorizeModule } from './auth.middleware.js';
export type { AuthRequest, AuthenticatedUser, UserRole } from './types.js';
