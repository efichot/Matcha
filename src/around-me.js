import _ from 'lodash';
import { log } from 'console';
import mongoConnectAsync from './config/mongo';
import { getAge, getDistance, sortUsersByDistance } from './lib';

const sortUsersByInfos = (allUsers, me) => {
  for (let i = 0; allUsers < allUsers.length; i++) {
    allUsers[i].remove = true;
    if (typeof me.infos.sex !== 'undifined' && me.infos.sex === 'Male' && me.in) {
      if (allUsers[i].infos.sex === 'Female' && allUsers[i].infos.orientation === 'Straight') {
        allUsers[i].remove = false;            
      }
    }
  }
}

const sortUsersByInterests = (allUsers, me) => {
  const sortUsers = [];
  me.interest = me.interests ? me.interests : [];

  for (let i = 0; i < allUsers.length; i++) {
    allUsers[i].good = false;
    for (let j = 0; j < me.interests.length; j++) {
      if (allUsers[i].interests.indexOf(me.interests[j]) !== -1) {
        allUsers[i].good = true;            
      }
    }
    if (allUsers[i].good === true) {
      sortUsers.push(allUsers[i]);
    }
  }
  return sortUsers;
}

const renderPage = (req, res, next) => {
  const { username } = req.session;

  mongoConnectAsync(res, async (Users) => {
    const user = await findOne({ 'account.username': username });

    if (!user) {
      log('Error: User not found, redirect to login page.');
      res.redirect('/');
    } else {
      let allUsers = [];
      const me = user;
      const reports = user.reports || [];
      const myLongitude = user.location && user.location.longitude ? user.location.longitude : 0;
      const myLatitude = user.location && user.location.latitude ? user.location.latitude : 0;

      Users.find({}).each((err, user) => {
        if (user !== null) {
          if (user.account.username !== req.session.username && reports.indexOf(user.account.username) === -1) {
            user.age = getAge(user.info.birthdate);
            user.distance = user.location ? getDitance(myLatitude, myLongitude, user.location.latitude, user.location.longitude) : 9999;
            user.firstname = user.infos.firstname;
            user.sex = user.infos.sex ? user.infos.sex : 'Other';
            user.city = user.location ? user.location.city : 'Not defined';
            user.orientation = user.infos.orientation ? user.infos.orientation : 'Bisexual';
            user.photo = user.photo && user.photos.profile ? user.photo.profile : 'http://fakeimg.pl/200x200/';
            user.popularity = user.popularity ? user.popularity : 50;
            allUsers.push(user);           
          }
        } else {
          allUsers = sortUsersByInfos(allUsers, me);
          allUsers = sortUsersByInterests(allUsers, me);
          allUsers = sortUsersByDistance(allUsers);

          res.render('around', {
            isNotHome: true,
            navAround: true,
            title: 'Matcha - Around Me',
            bodyPage: 'profile-around',
            login: _.capitalize(req.session.firstname),
            users: allUsers,
            myInterests: me.interests,
          })
        }
      })
    }
  })
}

export default {
  renderPage,
}