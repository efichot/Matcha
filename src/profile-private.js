import mongoConnectAsync from './config/mongo';
import { log } from 'console';
import _ from 'lodash';
import { getAge } from './lib';

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

      const likes = [1,1];

      _.set(user, 'likes', likes); 

      const location = {
        longitude: 0,
        latitude: 0,
      }

      _.set(user, 'location', location);       

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
}