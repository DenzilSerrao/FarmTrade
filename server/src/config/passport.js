const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const config = require('./auth.config');
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientID,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ 
          $or: [
            { googleId: profile.id },
            { email: profile.emails[0].value }
          ]
        });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            avatar: profile.photos[0]?.value,
            verified: true,
            authProvider: 'google'
          });
        } else if (!user.googleId) {
          // Link existing account with Google
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

// Facebook OAuth Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: config.facebook.clientID,
      clientSecret: config.facebook.clientSecret,
      callbackURL: config.facebook.callbackURL,
      profileFields: ['id', 'emails', 'name', 'picture.type(large)']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ 
          $or: [
            { facebookId: profile.id },
            { email: profile.emails[0].value }
          ]
        });

        if (!user) {
          user = await User.create({
            facebookId: profile.id,
            email: profile.emails[0].value,
            name: `${profile.name.givenName} ${profile.name.familyName}`,
            avatar: profile.photos[0]?.value,
            verified: true,
            authProvider: 'facebook'
          });
        } else if (!user.facebookId) {
          // Link existing account with Facebook
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

module.exports = passport;