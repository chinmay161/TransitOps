import { betterAuth, APIError } from 'better-auth';
import { addOAuthServerContext, getOAuthState } from 'better-auth/api';
import { pool } from '../../db/pool.js';
import { env } from '../../config/env.js';

// ---------------------------------------------------------------------------
// Sign-up intent enforcement (Google-only auth)
// ---------------------------------------------------------------------------
// The frontend encodes intent in the OAuth callbackURL:
//   Login   -> <frontend>/login
//   Sign Up -> <frontend>/login?intent=signup
//
// Intent is carried through the OAuth flow SERVER-SIDE using Better Auth's
// request-state API:
//   1. hooks.before on /sign-in/social reads the intent flag and calls
//      addOAuthServerContext({ signupIntent: true }). generateState embeds it
//      into the state payload (serverContext), so the client cannot spoof it.
//   2. On the callback, getOAuthState() exposes serverContext.signupIntent plus
//      oauthState (the state token) for the whole request lifetime - including
//      inside databaseHooks. This is unaffected by Better Auth consuming the
//      verifications row during parseState.
//
// Enforcement:
//   - user.create.after: for signup-intent flows, records a short-lived marker
//     row (oauth_flow_markers, keyed by oauthState) proving THIS flow created
//     a fresh user.
//   - account.create.before: blocks LINKING a Google identity onto a
//     pre-existing user during signup intent (legacy unlinked emails).
//   - session.create.before (final gate): signup intent requires the marker -
//     otherwise an already-linked/existing email would be silently logged in.
//     Rejection throws APIError(email_already_exists) which Better Auth maps
//     to ?error=email_already_exists on the frontend login page BEFORE any
//     cookie is set.
// Markers are consumed on approval, swept on expiry, and live in PostgreSQL -
// correct across restarts and multiple backend instances. Concurrent duplicate
// signups remain guarded by users.email UNIQUE.

const FRESH_SIGNUP_MARKER_TTL = '15 minutes';

function authDebug(msg: string) {
  if (process.env.AUTH_DEBUG === '1') console.log('[auth-diag]', msg);
}

type MaybeRequestContext = {
  request?: Request | null;
  query?: Record<string, unknown> | null;
} | null | undefined;

async function readFlowState() {
  try {
    const st = (await getOAuthState()) as
      | {
          oauthState?: string;
          requestSignUp?: boolean;
          serverContext?: { signupIntent?: boolean };
        }
      | null
      | undefined;
    return st ?? null;
  } catch {
    return null;
  }
}

// Records (per OAuth state token) that this flow created a fresh user.
async function markFreshSignupUser(
  stateToken: string,
  userId: string
): Promise<void> {
  // Lazy sweep so abandoned flows cannot accumulate even between restarts.
  await pool.query('DELETE FROM oauth_flow_markers WHERE expires_at < NOW()');
  await pool.query(
    `INSERT INTO oauth_flow_markers (state_token, user_id, expires_at)
     VALUES ($1, $2, NOW() + $3::interval)
     ON CONFLICT (state_token) DO UPDATE
       SET user_id = EXCLUDED.user_id, expires_at = EXCLUDED.expires_at`,
    [stateToken, userId, FRESH_SIGNUP_MARKER_TTL]
  );
}

// True only when THIS state token carries a live fresh-signup marker for the
// given user. Non-consuming; consumption happens once the session gate
// approves the flow.
async function hasFreshSignupMarker(
  stateToken: string,
  userId: string
): Promise<boolean> {
  const result = await pool.query(
    `SELECT 1 FROM oauth_flow_markers
      WHERE state_token = $1 AND user_id = $2 AND expires_at > NOW()`,
    [stateToken, userId]
  );
  return (result.rowCount ?? 0) > 0;
}

async function consumeFreshSignupMarker(stateToken: string): Promise<void> {
  await pool.query('DELETE FROM oauth_flow_markers WHERE state_token = $1', [
    stateToken,
  ]);
}

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [env.FRONTEND_URL],
  // Route all OAuth errors back to the frontend login screen so users see a
  // readable message instead of the backend 404 page.
  onAPIError: { errorURL: `${env.FRONTEND_URL}/login` },
  database: pool,
  emailAndPassword: { enabled: false },
  hooks: {
    before: async (ctx) => {
      // Capture signup intent at OAuth start. addOAuthServerContext embeds it
      // into the state payload as server-trusted context that re-emerges on
      // the callback via getOAuthState().
      // However, because Better Auth consumes the state during parseState, it
      // may be lost before databaseHooks run. We set a cookie as a reliable backup.
      const path = (ctx as any).path as string | undefined;
      if (path === '/sign-in/social') {
        const cb = (ctx.body as any)?.callbackURL;
        let signup = false;
        try {
          signup =
            typeof cb === 'string' &&
            new URL(cb).searchParams.get('intent') === 'signup';
        } catch {
          signup = false;
        }
        authDebug(
          `sign-in/social entry callbackURL=${typeof cb} signup=${signup}`
        );
        if (signup) {
          await addOAuthServerContext({ signupIntent: true });
          try {
            if (typeof (ctx as any).setCookie === 'function') {
              (ctx as any).setCookie('signup_intent', '1', {
                maxAge: 15 * 60, // 15 minutes
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
              });
              (ctx as any).setCookie('login_intent', '', { maxAge: 0, path: '/' });
            } else if (typeof (ctx as any).setHeader === 'function') {
              (ctx as any).setHeader('Set-Cookie', [
                'signup_intent=1; Max-Age=900; HttpOnly; SameSite=Lax; Path=/',
                'login_intent=; Max-Age=0; HttpOnly; SameSite=Lax; Path=/'
              ]);
            }
          } catch (err) {
            authDebug(`Failed to set signup_intent cookie: ${err}`);
          }
        } else {
          // Login intent
          try {
            if (typeof (ctx as any).setCookie === 'function') {
              (ctx as any).setCookie('login_intent', '1', {
                maxAge: 15 * 60,
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
              });
              (ctx as any).setCookie('signup_intent', '', { maxAge: 0, path: '/' });
            } else if (typeof (ctx as any).setHeader === 'function') {
              (ctx as any).setHeader('Set-Cookie', [
                'login_intent=1; Max-Age=900; HttpOnly; SameSite=Lax; Path=/',
                'signup_intent=; Max-Age=0; HttpOnly; SameSite=Lax; Path=/'
              ]);
            }
          } catch (err) {
            authDebug(`Failed to set login_intent cookie: ${err}`);
          }
        }
      }
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  user: {
    modelName: 'users',
    fields: {
      name: 'full_name',
      emailVerified: 'email_verified',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      image: 'image',
    },
    // Keys must match the physical column names in the existing users table.
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'pending',
        input: false,
        returned: true,
      },
      is_active: {
        type: 'boolean',
        defaultValue: true,
        input: false,
        returned: true,
      },
    },
  },
  session: {
    modelName: 'sessions',
    fields: {
      userId: 'user_id',
      token: 'token',
      expiresAt: 'expires_at',
      ipAddress: 'ip_address',
      userAgent: 'user_agent',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  account: {
    modelName: 'accounts',
    // Google is the only provider, so its identities are trusted for implicit
    // linking: an existing same-email TransitOps user gets their Google identity
    // attached on first login instead of being rejected with account_not_linked.
    // `requireLocalEmailVerified: false` ignores the stale legacy users.email_verified
    // flag — email ownership is already proven by Google at the provider.
    accountLinking: {
      enabled: true,
      trustedProviders: ['google'],
      requireLocalEmailVerified: false,
    },
    fields: {
      userId: 'user_id',
      accountId: 'account_id',
      providerId: 'provider_id',
      issuer: 'issuer',
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      accessTokenExpiresAt: 'access_token_expires_at',
      refreshTokenExpiresAt: 'refresh_token_expires_at',
      scope: 'scope',
      password: 'password',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  verification: {
    modelName: 'verifications',
    fields: {
      expiresAt: 'expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  databaseHooks: {
    user: {
      create: {
        // LOGIN intent must never create users (req D). requestSignUp=true
        // (Sign Up) or an unknown/non-OAuth context are the only ways a user
        // row is created here.
        before: async (_user, context) => {
          const st = await readFlowState();
          
          let loginIntentCookie = false;
          try {
            const cookies = context?.request?.headers?.get('cookie') || '';
            loginIntentCookie = cookies.includes('login_intent=1');
          } catch (e) {}

          const isLoginIntent =
            loginIntentCookie || (st !== null && st.requestSignUp !== true && !st.serverContext?.signupIntent);
            
          authDebug(
            `user.create.before flowState=${
              st ? 'present' : 'absent'
            } loginIntent=${isLoginIntent}`
          );
          
          if (isLoginIntent) {
            throw new APIError('BAD_REQUEST', {
              code: 'account_not_found',
              message: 'This email ID is not linked with a TransitOps account. Please sign up first.',
            });
          }
        },
        // Signup-intent flows record a durable fresh-user marker keyed by
        // their OAuth state token; the session gate below consumes it.
        after: async (user: any, context: any) => {
          if (!user?.id) return;
          
          // Fallback cleanup: if user was created despite login intent (adapter quirk), delete it
          try {
            const cookies = context?.request?.headers?.get('cookie') || '';
            if (cookies.includes('login_intent=1')) {
              authDebug(`user.create.after: Login intent detected for new user. Deleting user ${user.id}`);
              await pool.query('DELETE FROM users WHERE id = $1', [user.id]);
              return;
            }
          } catch (e) {}

          const st = await readFlowState();
          const signup = !!st?.serverContext?.signupIntent || st?.requestSignUp === true;
          authDebug(
            `user.create.after user=present state=${
              st?.oauthState ? 'present' : 'absent'
            } signupIntent=${signup}`
          );
          if (!signup || !st?.oauthState) return;
          await markFreshSignupUser(st.oauthState, user.id);
        },
      },
    },
    account: {
      create: {
        // Blocks LINKING a Google identity onto a pre-existing user during a
        // signup-intent flow (legacy unlinked emails). Fires on account INSERT
        // only; already-linked identities reuse the existing account and skip
        // this hook entirely (the session gate covers them instead).
        before: async (account, context) => {
          const st = await readFlowState();
          
          let signupIntentCookie = false;
          try {
            const cookies = context?.request?.headers?.get('cookie') || '';
            signupIntentCookie = cookies.includes('signup_intent=1');
          } catch (e) {}
          
          const signup = signupIntentCookie || !!st?.serverContext?.signupIntent;
          authDebug(
            `account.create.before accountUserId=${
              account?.userId ? 'present' : 'absent'
            } signupIntent=${signup}`
          );
          // Login intent (and any non-OAuth context): unchanged behavior.
          if (!signup) return true;

          if (!st?.oauthState || !account?.userId) return false;
          return hasFreshSignupMarker(st.oauthState, account.userId);
        },
      },
    },
    session: {
      create: {
        // Final gate BEFORE any session is minted. Signup intent requires the
        // fresh-user marker written for THIS state token - so an already-linked
        // identity (findAccountOwnerByKey -> existing account -> straight here,
        // where no user/account create hook fires) is rejected. Throwing
        // APIError propagates to the callback handler which redirects to
        // onAPIError.errorURL with ?error=email_already_exists - no cookie.
        before: async (session: any, context) => {
          const st = await readFlowState();
          
          let signupIntentCookie = false;
          try {
            const cookies = context?.request?.headers?.get('cookie') || '';
            signupIntentCookie = cookies.includes('signup_intent=1');
          } catch (e) {}

          const signup =
            signupIntentCookie ||
            st?.requestSignUp === true ||
            !!st?.serverContext?.signupIntent;
          const hasState = !!st;
          authDebug(
            `session.create.before flowState=${hasState ? 'present' : 'absent'} signupIntent=${signup} userId=${
              session?.userId ? 'present' : 'absent'
            }`
          );
          // Login intent (and any non-OAuth context): unchanged behavior.
          if (!signup) return true;

          const fresh =
            hasState && session?.userId
              ? await hasFreshSignupMarker(st.oauthState!, session.userId)
              : false;
          authDebug(`session gate fresh=${fresh}`);
          if (!fresh) {
            throw new APIError('BAD_REQUEST', {
              code: 'email_already_exists',
              message:
                'This email ID is already linked with an existing TransitOps account. Kindly try logging in.',
            });
          }
          if (hasState) {
            await consumeFreshSignupMarker(st.oauthState!);
          }
          authDebug('session gate allowed fresh signup; marker consumed');
        },
      },
      after: async (session: any, context: any) => {
        authDebug(`session.create.after created=${!!session?.id}`);
        // Fallback cleanup: If session was created despite the before hook throwing
        // (due to adapter quirks), and it was a duplicate signup attempt, delete it.
        try {
          const cookies = context?.request?.headers?.get('cookie') || '';
          if (cookies.includes('signup_intent=1')) {
            const st = await readFlowState();
            const fresh = st?.oauthState && session?.userId
              ? await hasFreshSignupMarker(st.oauthState, session.userId)
              : false;
            if (!fresh && session?.id) {
              authDebug(`session.create.after: Duplicate signup detected. Deleting session ${session.id}`);
              await pool.query('DELETE FROM sessions WHERE id = $1', [session.id]);
            }
          }
        } catch (e) {}
      },
    },
  },
  advanced: {
    database: {
      generateId: 'uuid',
    },
  },
});
