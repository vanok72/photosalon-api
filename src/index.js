import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import Promise from 'bluebird';

import auth from './routes/auth';
import users from './routes/users';

dotenv.config();
const app = express();
app.use(bodyParser.json());
mongoose.Promise = Promise;
mongoose.set('useFindAndModify', false);
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true });

app.use('/api/auth', auth);
app.use('/api/users', users);

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, () => console.log('Running on localhost:3000'));
