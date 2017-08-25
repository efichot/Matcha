import _ from 'lodash';
import { log } from 'console';
import mongoConnectAsync from './mongo';
import { ObjectID } from 'mongodb';

const postMessage = (req, res ,next) => {
  const { username, userID, firstname } = req.session;
  const { toID, message } = req.body;

  mongoConnectAsync(res, async (Users) => {
    const my = await Users.findOne({ 'account.username': username });
    const these = await Users.findOne({ _id: ObjectID(toID) });

    if (my && these) {

    } else {
      res.end();
    }
  })
}

const getMessages = (req, res, next) => {
  const { username } = req.session;

  mongoConnectAsync(res, async (Users) => {
    const user = await Users.findOne({ 'account.username': username });

    if (!user) {
      log('Error: User not found, redirect to login page.');
      res.send({
        done: 'User has not messages yet',
      });
    } else {
      res.send({
        done: 'success',
        messages: _.get(user, 'messages', []);
        photo: _.get(user, 'photo', 'http://fakeimg.pl/300x300/'),
      });
    }
  });
}

const renderPage = (req, res) => {
  const { username } = req.session;

  mongoConnectAsync(res, async (Users) => {
    const user = await Users.findOne({ 'account.username': username });

    if (!user) {
      log('Error: User not found, redirect to login page.');
      res.redirect('/');
    } else {
      res.render('messages', {
        isNotHome: true,
        title: 'Matcha - Mesages',
        bodyPage: 'messages-body',
        user,
        id: user._id,
        login: _.capitalize(_.get(req.session, 'firstname', 'profile'));
      });
    }
  });
};

export default {
  renderPage,
  getMessages,
  postMessages,
}
