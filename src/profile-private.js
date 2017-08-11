import mongoConnectAsync from './config/mongo';
import { log } from 'console';
import _ from 'lodash';
import { getAge } from './lib';
import geoLib from 'geolib';

const setLastConnection = (req, res, next) => {
  const { username } = req.session;
  const date = new Date();

  mongoConnectAsync(res, async (Users) => {
    Users.updateOne({ 'account.username': username }, {
      $set: { last: date },
    }, (err) => {
      if (!err) {
        res.send({ done: 'success', date });
      } else {
        res.send({ done: 'fail' });
      }
    },
    );
  })
}

const renderProfile = (req, res, next) => {
  const { username } = req.session;

  mongoConnectAsync(res, async (Users) => {
    const user = await Users.findOne({ 'account.username': username });

    if (!user) {
      log('User not found redirect to login page');
      res.redirect('/');
    } else {
      const photos = {
        photo0: 'https://fakeimg.pl/300x300/',
        photo1: 'https://fakeimg.pl/300x300/',
        photo2: 'https://fakeimg.pl/300x300/',
        photo3: 'https://fakeimg.pl/300x300/',
        photo4: 'https://fakeimg.pl/300x300/',
        cover: 'https://fakeimg.pl/890x310/',
        profile: 'https://fakeimg.pl/300x300/',
      };
      _.set(user, 'photos', photos);

      const interests = ['read'];

      _.set(user, 'interests', interests);

      const reports = [1, 1, 1];

      _.set(user, 'reports', reports);

      const likes = [1, 1];

      _.set(user, 'likes', likes);

      const location = { // paris
        latitude: 48.8962946,
        longitude: 2.3169199,
      }

      _.set(user, 'location', location);

      log(user);
      res.render('profile', {
        isNotHome: true,
        navProfile: true,
        title: 'Matcha - Profile',
        bodyPage: 'profile-body',
        user,
        login: _.capitalize(user.info.firstname),
        age: getAge(user.info.birthdate),
        likes: user.likes.length,
        reports: user.reports.length,
      });
    }
  });
}

export default {
  renderProfile,
  setLastConnection,
}
