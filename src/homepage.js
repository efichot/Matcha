import mongoConnectAsync from './config/mongo';
import resLog from './lib';
import hash from 'mhash';
import { log } from 'console';

console.log(resLog);

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
      const { ops, insertCount } = await Users.insertOne({
        account: {
          username,
          password: hash('whrilpool', password),
          mail,
        },
        info: {
          firstname,
          lastname,
          birthdate,
        },
      });

      if (insertCount > 0 && ops[0]) {
        req.session.username = ops[0].account.username;
        req.session.firstname = ops[0].info.firstname;
        req.session.userID = ops[0]._id;
        resLog(res, 'Success: User added', { redirect: '/profile' });
      } else {
        resLog(res, 'Error: User not added');
      }
    }
  })
}

const connectUser = (req, res, next) => {

}

export default {
  renderHome,
  addNewUser,
  connectUser,
}