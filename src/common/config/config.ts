import { stringToBoolean } from "../utils/index.utils";

export default () => ({
  db: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE,
    sync: process.env.SYNC ? stringToBoolean(process.env.SYNC) : false
  },
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl: process.env.GOOGLE_CALLBACK_URL
    },
    redirectUrl: process.env.REDIRECT_URL
  },
  jwt: {
    accessTokenSecret: process.env.SECRET_KEY,
    accessTokenExpiresIn: process.env.EXPIRESIN ? parseInt(process.env.EXPIRESIN, 10) : 1000 * 60 * 60 * 3,
    refreshTokenSecret: prcoess.env.SECRET_KEY,
  },
  tz: process.env.TZ || 'Asia/Seoul',
})