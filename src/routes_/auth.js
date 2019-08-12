import express from 'express';
import user from '../models_/user';
import { sendResetPasswordEmail } from '../utils_/mailer';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/', (req, res) => {
  const { credentials } = req.body;
  user
    .findOne({
      $or: [{ email: credentials.login }, { username: credentials.login }],
    })
    .then(user => {
      if (user && user.isValidPassword(credentials.password)) {
        res.json({ user: user.toAuthJSON() });
      } else {
        res.status(400).json({ errors: { global: 'Invalid credentials' } });
      }
    });
});

router.post('/confirmation', (req, res) => {
  const token = req.body.token;
  user
    .findOneAndUpdate(
      { confirmationToken: token },
      { confirmationToken: '', confirmed: true },
      { new: true },
    )
    .then(user =>
      user ? res.json({ user: user.toAuthJSON() }) : res.status(400).json({}),
    );
});

router.post('/reset_password', (req, res) => {
  user.findOne({ email: req.body.email }).then(user => {
    if (user) {
      sendResetPasswordEmail(user);
      res.json({});
    } else {
      res
        .status(400)
        .json({ errors: { global: 'There is no user with such email' } });
    }
  });
});

router.post('/validateToken', (req, res) => {
  jwt.verify(req.body.token, process.env.JWT_SECRET, err => {
    if (err) {
      res.status(401).json({});
    } else {
      res.json({});
    }
  });
});

router.post('/resetpassword', (req, res) => {
  const { password, token } = req.body.data;
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(401).json({ errors: { global: 'Invalid token' } });
    } else {
      user.findOne({ _id: decoded._id }).then(user => {
        if (user) {
          user.setPassword(password);
          user.save().then(() => res.json({}));
        } else {
          res
            .status(404)
            .json({ errors: { global: 'Invalid token or user not found' } });
        }
      });
    }
  });
});

export default router;
