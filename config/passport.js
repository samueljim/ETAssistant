const passport = require('passport');
const request = require('request');
const {
  Strategy: LocalStrategy
} = require('passport-local');
const SlackStrategy = require('passport-slack-oauth2').Strategy;
const {
  OAuth2Strategy: GoogleStrategy
} = require('passport-google-oauth');
const { OAuthStrategy } = require('passport-oauth');
const { OAuth2Strategy } = require('passport-oauth');

const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({
  usernameField: 'email'
}, (email, password, done) => {
  User.findOne({
    email: email.toLowerCase()
  }, (err, user) => {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false, {
        msg: `Email ${email} not found.`
      });
    }
    user.comparePassword(password, (err, isMatch) => {
      if (err) {
        return done(err);
      }
      if (isMatch) {
        return done(null, user);
      }
      return done(null, false, {
        msg: 'Invalid email or password.'
      });
    });
  });
}));

/**
 * Sign in with Google.
 */
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: '/auth/google/callback',
  passReqToCallback: true
}, (req, accessToken, refreshToken, profile, done) => {
  if (req.user) {
    User.findOne({ google: profile.id }, (err, existingUser) => {
      if (err) { return done(err); }
      if (existingUser) {
        req.flash('errors', { msg: 'There is already a Google account that belongs to you. Sign in with that account or delete it, then link it with your current account.' });
        done(err);
      } else {
        User.findById(req.user.id, (err, user) => {
          if (err) { return done(err); }
          user.google = profile.id;
          user.tokens.push({ kind: 'google', accessToken });
          user.name = user.name || profile.displayName;
          user.picture = user.picture || profile._json.image.url;

          user.save((err) => {
            req.flash('info', { msg: 'Google account has been linked.' });
            done(err, user);
          });
        });
      }
    });
  } else {
    User.findOne({ google: profile.id }, (err, existingUser) => {
      if (err) { return done(err); }
      if (existingUser) {
        return done(null, existingUser);
      }
      User.findOne({ email: profile.emails[0].value }, (err, existingEmailUser) => {
        if (err) { return done(err); }
        if (existingEmailUser) {
          req.flash('errors', { msg: 'There is already an account using this email address. Sign in to that account and link it with Google manually from Account Settings.' });
          done(err);
        } else {
          const user = new User();
          user.email = profile.emails[0].value;
          user.google = profile.id;
          user.tokens.push({ kind: 'google', accessToken });
          user.name = profile.displayName;
          user.picture = profile._json.image.url;

          user.save((err) => {
            done(err, user);
          });
        }
      });
    });
  }
}));

/**
 * Sign in with slack.
 */
// passport.use(new SlackStrategy({
//   clientID: process.env.SLACK_CLIENT_ID,
//   clientSecret: process.env.SLACK_SECRET,
//   passReqToCallback: true,
//   scope: ['channels:read', 'chat:write:user']
// }, (req, accessToken, refreshToken, done) => {
//   if (req.user) {
//     User.findById(req.user.id, (err, user) => {
//       if (err) { return done(err); }
//       // user.slack = profile.id;
//       user.tokens.push({ kind: 'slack', accessToken });
//       user.tokens.push({ kind: 'slackRefreshToken', refreshToken });
//       // user.name = user.name || profile.displayName;
//       // user.picture = user.picture || profile._json.image.url;
//       user.save((err) => {
//         req.flash('info', { msg: 'Slack account has been linked.' });
//         done(err, user);
//       });
//     });
//   } else {
//     return res.redirect('/');
//   }
// }));


/**
 * Login Required middleware.
 */
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

/**
 * Authorization Required middleware.
 */
exports.isAuthorized = (req, res, next) => {
  const provider = req.path.split('/').slice(-1)[0];
  const token = req.user.tokens.find(token => token.kind === provider);
  if (token) {
    next();
  } else {
    res.redirect(`/auth/${provider}`);
  }
};
