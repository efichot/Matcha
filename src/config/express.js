import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import passport from 'passport'
import session from 'express-session'
import { log } from 'console'
import hbs from 'express-handlebars';

import router from '../routes'

const { SERVER_PORT } = process.env

const app = express()

app.set('view engine', 'handlebars'); // Set template engine
app.engine('handlebars', hbs({
  defaultLayout: 'main',
  helpers: {
    mod4: (key, options) => ((parseInt(key, 10) + 1) % 4) === 0 ? options.fn(this) : options.inverse(this),
  },
}))

app
  .use(morgan('dev')) // :method :url :status :response-time ms - :res[content-length]
  .use(cookieParser()) // read cookies signed or not signed
  .use(bodyParser.json()) // Parse application/json
  .use(bodyParser.urlencoded({ extended: true })) // Parse application/x-www-form-urlencoded
  .use(cors()) // Enable Cross Origin Resource Sharing
  .use(helmet()) // Secure your app by setting various HTTP headers
  .use(passport.initialize()) // initialize passport middleware
  .use(express.static('public'))
  .use(express.static('node_modules'))
  .use(session({
    secret: 'matcha',
    resave: false,
    saveUninitialized: true,
  }));

app
  .disable('x-powered-by') // Disable 'X-Powered-By' header in response
  .disable('etag') // Remove No Cache Control

app
  .use('/', router) // Main routes

app.listen(SERVER_PORT, () =>
  log('[Express] Api is running on port', SERVER_PORT),
)
