const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const bcrypt = require('bcrypt');
const models = require('../db');
const { ErrInfo, Err } = require('../err');

module.exports.localStrategy = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'mail',
        passwordField: 'password'
      },
      async (userMail, password, done) => {
        const user = await models.User.findOne({
          where: {
            mail: userMail
          }
        });
        if (user === null) {
          return done(new Err(ErrInfo.UserNotExist));
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return done(new Err(ErrInfo.PasswordNotMatch));
        }
        return done(null, user);
      }
    )
  );
};
