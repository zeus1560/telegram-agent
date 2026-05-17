const passport = require('passport');
const config = require('config');
const expressSession = require('express-session');
const expressMySqlSession = require('express-mysql-session');
const models = require('../db');
const { localStrategy } = require('./localStrategy');
const { jwtStrategy } = require('./jwtStrategy');

const MySQLStore = expressMySqlSession(expressSession);
const sessionStore = new MySQLStore(config.session);

module.exports.passportConfig = (app) => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (userId, done) => {
    const user = await models.User.findOne({
      where: { id: userId }
    });
    done(null, user);
  });

  // 이메일 로그인
  localStrategy();

  // jwt 로그인
  jwtStrategy();

  app.use(
    expressSession({
      secret: config.cookie.secret,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: config.cookie.maxAge
      },
      name: 'platform'
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
};

module.exports.sessionStore = sessionStore;
