import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import User from '../models/User.js';
import config from './auth.config.js';

const safeGet = (fn, fallback = undefined) => {
  try {
    const v = fn();
    return v === undefined ? fallback : v;
  } catch {
    return fallback;
  }
};

passport.serializeUser((user, done) => {
  // support both mongoose doc and plain object
  const id =
    user && (user._id || user.id) ? (user._id || user.id).toString() : user;
  done(null, id);
});

passport.deserializeUser(async (id, done) => {
  try {
    if (!id) return done(null, null);
    const user = await User.findById(id).exec();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Register Google strategy only if configured
const googleClientID = safeGet(() => config.google.clientID);
const googleClientSecret = safeGet(() => config.google.clientSecret);
const googleCallback = safeGet(
  () => config.google.callbackURL,
  '/api/auth/google/callback'
);

if (googleClientID && googleClientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientID,
        clientSecret: googleClientSecret,
        callbackURL: googleCallback,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile?.emails?.[0]?.value ?? null;
          let user = null;

          if (email) {
            user = await User.findOne({
              $or: [{ googleId: profile.id }, { email }],
            }).exec();
          } else {
            user = await User.findOne({ googleId: profile.id }).exec();
          }

          if (!user) {
            user = await User.create({
              googleId: profile.id,
              email,
              name:
                profile.displayName ||
                `${profile?.name?.givenName ?? ''} ${
                  profile?.name?.familyName ?? ''
                }`.trim() ||
                'Google User',
              avatar: profile?.photos?.[0]?.value,
              verified: true,
              authProvider: 'google',
            });
          } else if (!user.googleId) {
            user.googleId = profile.id;
            user.verified = true;
            await user.save();
          }

          return done(null, user);
        } catch (error) {
          console.error('Google OAuth error:', error);
          return done(error, null);
        }
      }
    )
  );
} else {
  console.warn(
    'Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable it.'
  );
}

// Register Facebook strategy only if configured
const fbClientID = safeGet(() => config.facebook.clientID);
const fbClientSecret = safeGet(() => config.facebook.clientSecret);
const fbCallback = safeGet(
  () => config.facebook.callbackURL,
  '/api/auth/facebook/callback'
);

if (fbClientID && fbClientSecret) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: fbClientID,
        clientSecret: fbClientSecret,
        callbackURL: fbCallback,
        profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile?.emails?.[0]?.value ?? null;
          let user = null;

          if (email) {
            user = await User.findOne({
              $or: [{ facebookId: profile.id }, { email }],
            }).exec();
          } else {
            user = await User.findOne({ facebookId: profile.id }).exec();
          }

          if (!user) {
            user = await User.create({
              facebookId: profile.id,
              email,
              name:
                `${profile?.name?.givenName ?? ''} ${
                  profile?.name?.familyName ?? ''
                }`.trim() || 'Facebook User',
              avatar: profile?.photos?.[0]?.value,
              verified: true,
              authProvider: 'facebook',
            });
          } else if (!user.facebookId) {
            user.facebookId = profile.id;
            user.verified = true;
            await user.save();
          }

          return done(null, user);
        } catch (error) {
          console.error('Facebook OAuth error:', error);
          return done(error, null);
        }
      }
    )
  );
} else {
  console.warn(
    'Facebook OAuth not configured. Set FACEBOOK_CLIENT_ID and FACEBOOK_CLIENT_SECRET to enable it.'
  );
}

// Export helper middlewares for app.js
export const initialize = () => passport.initialize();
export const session = () => passport.session();

export default passport;
