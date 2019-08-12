import express from 'express';
import user from '../models/user';
import parseErrors from '../utils_/parseErrors';
import { sendConfirmationEmail } from '../utils_/mailer';
import authenticate from '../middlwares/authenticate';

const router = express.Router();

router.post('/', (req, res) => {
  const { email, username, password } = req.body.user;
  const currentUser = new user({ email, username });
  currentUser.setPassword(password);
  currentUser.setConfirmationToken();
  currentUser
    .save()
    .then(userRecord => {
      sendConfirmationEmail(userRecord);
      res.json({ user: userRecord.toAuthJSON() });
    })
    .catch(err => res.status(400).json({ errors: parseErrors(err.errors) }));
});

router.get('/current_user', authenticate, (req, res) => {
  res.json({
    user: {
      email: req.currentUser.email,
      confirmed: req.currentUser.confirmed,
      username: req.currentUser.username,
    },
  });
});

export default router;
