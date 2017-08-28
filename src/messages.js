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
      const myMessages = _.get(my, 'messages', {});
      const theseMessages = _.get(these, 'messages', {});
      const theseNotifs = _.get(these, 'notifications', []);

      myMessages[these.acount.username].discussion.push({
        type: 'sent',
        date: Date.now(),
        message,
      });

      theseMessages[my.account.username].discussion.push({
        type: 'received',
        date: Date.now(),
        message,
      });

      theseNotifs.slice(5);
      theseNotifs.unshift({
        type:'message',
        date: Date.now(),
        userID,
        firstname,
      });

      Users.updateOne({ 'account.username': username, { $set: { messages: mymessage }, });
      Users.updateOne({ _id: these._id },  { $set: { messages: theseMessages, notifications: theseNotifs }, });

      res.send({ done: 'success' });
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
