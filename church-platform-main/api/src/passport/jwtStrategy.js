const passport = require('passport');
const config = require('config');
const passportJWT = require('passport-jwt');

const ExtractJWT = passportJWT.ExtractJwt;
const JWTStrategy = passportJWT.Strategy;

const models = require('../db');
const { ErrInfo, TockError } = require('../err');

module.exports.jwtStrategy = () => {
  passport.use(
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromHeader('authorization'),
        secretOrKey: config.JWT.JWT_SECRET
      },
      async (jwtPayload, done) => {
        const exUser = await models.User.findOne({
          where: { id: jwtPayload.id }
        });
        if (exUser) {
          return done(null, exUser);
        }
        return done(new TockError(ErrInfo.UnAuthorized));
      }
    )
  );
};

module.exports.checkUserToken = (req, res, next) => {
  // 세션 로그인이 안될 경우 토큰 로그인으로 유저를 체크 한다.
  if (req.user === undefined || req.user === null) {
    passport.authenticate('jwt', { session: false }, (_err, user) => {
      if (user) {
        req.user = user;
      }
      next();
    })(req, res, next);
  } else {
    next();
  }
};
