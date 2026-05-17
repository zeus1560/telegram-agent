const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors = require('cors');
const config = require('config');
const swaggerUi = require('swagger-ui-express');
const { loadApiDoc } = require('./apiDoc');
const err = require('./err');
const commonRouter = require('./common/routers');
const boardRouter = require('./board/routers');
const { passportConfig } = require('./passport');
const { checkUserToken } = require('./passport/jwtStrategy');

const logger = morgan('dev');

const app = express();

const allowList = new Set([
  'http://localhost:4910',
  'http://localhost:4131',
  'http://localhost:4930'
]);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);

      if (allowList.has(origin))
        return cb(null, true);

      return cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true
  })
);

app.options('*', cors());

app.use(logger);
app.use(express.json({ limit: '5mb' }));
app.use(
  express.urlencoded({
    extended: true
  })
);
app.use(cookieParser(config.cookie.secret));

passportConfig(app);

// Swagger API Documentation
const serverUrl = `http://localhost:${config.PORT}`;
const swaggerSpec = loadApiDoc(serverUrl);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const prefix = '/api';
function registerRouters(router) {
  router.use(`${prefix}/`, commonRouter);
  router.use(`${prefix}/board`, boardRouter);
}
const apiRouter = express.Router();
registerRouters(apiRouter);
app.use(checkUserToken, apiRouter);

app.use(err.errHandler);

module.exports = app;
