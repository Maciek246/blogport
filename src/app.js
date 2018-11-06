import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import mongoose from 'mongoose';
import redis from 'express-redis';
import routes from './routes';

dotenv.config({path: '../.env'})
dotenv.load();

const app = express();
const redis_connection = redis(process.env.REDIS_PORT, process.env.REDIS_HOST, null, process.env.REDIS_NAME);

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true });
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
app.use(redis_connection)

app.use('/', routes.applicationRouter);
app.use('/user', routes.userRouter);

export default app;