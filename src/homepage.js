import mongoConnectAsync from './config/mongo';
import { resLog, sendEmail } from './lib';
import hash from 'mhash';
import { log } from 'console';

const renderHome = (req, res, next) => {
  // addFixures(res);

  res.render('home', {
    isNotHome: false,
    title: 'Matcha- Home',
    bodyPage: 'home-body',
  });
}

const addNewUser = (req, res, next) => {
  const { username, password, mail, firstname, lastname, birthdate } = req.body;

  mongoConnectAsync(res, async (Users) => {
    const usernameNbr = await Users.find({ 'account.username': username }).count();
    const mailNbr = await Users.find({ 'account.mail': mail }).count();

    if (usernameNbr > 0) {
      resLog(res, 'User already exist', { error: 'login' });
    } else if (mailNbr > 0) {
      resLog(res, 'Mail already exist', { error: 'mail' });
    } else {
      const { ops, insertedCount } = await Users.insertOne({
        account: {
          username,
          password: hash('whirlpool', password),
          mail,
        },
        info: {
          firstname,
          lastname,
          birthdate,
        },
      });

      if (insertedCount > 0 && ops[0]) {
        req.session.username = ops[0].account.username;
        req.session.firstname = ops[0].info.firstname;
        req.session.userID = ops[0]._id;
        resLog(res, 'Success: User added', { redirect: '/profile' });
      } else {
        resLog(res, 'Failed: To add user');
      }
    }
  })
}

const connectUser = (req, res, next) => {
  const { username, password } = req.body;

  mongoConnectAsync(res, async (Users) => {
    const user = await Users.findOne({ 'account.username': username });

    if (!user) {
      resLog(res, 'Login error, user not found.', { error: 'login' });
    } else if (user.account.password !== hash('whirlpool', password)) {
      resLog(res, 'Login error, bad password.', { error: 'password' });
    } else {
      req.session.username = user.account.username;
      req.session.firstname = user.account.firstname;
      req.sessionuserId = user._id;
      resLog(res, `User ${username} found. Access granted !`, { redirect: '/profile' });
    }
  })
}

const sendResetEmail = (req, res, next) => {
  const { email } = req.params;

  mongoConnectAsync(res, async (Users) => {
    const user = await Users.findOne({ 'account.mail': email });

    if (!user) {
      resLog(res, 'Mail provided don\'t match with existing user');
    } else {
      const { username, password } = user.account;
      const magicLink = `http://localhost:3000/reset-password/${username}/${password}`;
      const text = `<p>Follow <a href="${magicLink}" target="_blank">this link</a> to reset your password.</p>`;
      const subject = '✔ Let\'s reset your password';

      sendEmail(email, text, subject);
      resLog(res, 'Email sent', { done: 'success' });
    }
  })
}

export default {
  renderHome,
  addNewUser,
  connectUser,
  sendResetEmail,
};