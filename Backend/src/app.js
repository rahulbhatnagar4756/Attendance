const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const cron = require('node-cron');
const leaveScheduler = require('./scheduler/leavescheduler');
const markAbsentScheduler = require('./scheduler/markAbsentScheduler');
const upload = require('express-fileupload');
const path = require('path');

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

//schedule leaves
cron.schedule('0 0 1 * *', () => {
  leaveScheduler.addMonthlyLeaves();
});
//allotted leaves yearly
cron.schedule('0 0 1 1 *', () => {
  leaveScheduler.updateYearlyAllottedLeaves();
});

// mark absent users daily in midnight
cron.schedule('0 50 23 * * *', () => {
  markAbsentScheduler.markAbsentForNotCheckedInUsers();
});

// cron.schedule('*/10 * * * * *', function () {
//   console.log('running a task every 10 second');
//   markAbsentScheduler.markAbsentForNotCheckedInUsers();
// });

// Use EJS as the view engine
app.set('view engine', 'ejs');

// static path in app for files
app.use(express.static('public'));

app.use(bodyParser.json());
// in latest body-parser use like below.
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
app.use(upload());
// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static( path.join(__dirname,"..", "public")));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// v1 api routes
app.use('/v1', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
