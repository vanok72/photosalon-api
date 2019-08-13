import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import Promise from 'bluebird';

import auth from './routes/auth';

import users from './routes/users';
import books from './routes/books';

import usr from './models/user';

dotenv.config();
const app = express();
app.use(bodyParser.json());
mongoose.Promise = Promise;
mongoose.set('useFindAndModify', false);
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true });

app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/books', books);

app.get('/*', (req, res) => {
  usr
    .findOne({
      $or: [
        { email: 'nevermoreagain72@gmail.com' },
        { username: 'nevermoreagain72@gmail.com' },
      ],
    })
    .then(user => {
      if (user) {
        console.log(`User found`), res.json({ user: user });
      } else {
        console.log(`User not found`),
          res.status(400).json({ errors: { global: 'Invalid credentials' } });
      }
    });
  //res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(process.env.PORT, () =>
  console.log(`Our app is running on port ${process.env.PORT}`),
);
