import mongoConnectAsync from './config/mongo';
import { ObjectID } from 'mongodb';
import _ from 'lodash';
import { log } from 'console';
import { getAge } from './lib';

const getNotifications = (req, res) => {
  const { username } = req.session;

  mongoConnectAsync(res, async (Users) => {
    const user = await Users.findOne({ 'account.username': username });

    if (user) res.send({ done: 'success', notifs: _.get(user, 'notifications', []) });
    else res.send({ fail: 'no notifications' });
  });
};

const popScore = (req, res) => {
  const { id } = req.params;
  let score = 0;

  mongoConnectAsync(res, async (Users) => {
    const user = await Users.findOne({ _id: ObjectID(id) });

    if (user) {
      const { infos, location, interests, likes, visits, notifications } = user;

      if (!_.isUndefined(infos.biography)) score += 10;
      if (!_.isUndefined(infos.sex)) score += 10;
      if (!_.isUndefined(infos.orientation)) score += 10;
      if (!_.isUndefined(location)) score += 10;
      if (!_.isUndefined(location.address)) score += 10;
      if (!_.isUndefined(interests)) score += (10 + interests.length);
      if (!_.isUndefined(likes)) score += (user.likes.length * 2);
      if (!_.isUndefined(visits)) score += user.visits.length;
      if (getAge(user.infos.birthdate) < 33) score += 10;
      if (!_.isUndefined(notifications)) score += user.notifications.length;

      res.send({ score });

      Users.updateOne({ _id: ObjectID(id) }, {
        $set: { popularity: score },
      }, (err) => {
        if (err) log('Not enougth informations to get popularity score');
      });
    }
  });
};

const getLikes = (req, res) => {
  const { id } = req.params;

  mongoConnectAsync(res, async (Users) => {
    const user = await Users.findOne({ _id: ObjectID(id) });

    if (user && user.likes) {
      const likes = await Promise.all(user.likes.map(async (username, index) => {
        const user = await Users.findOne({ 'account.username': username });

        if (!user) return false;

        return index < 3 && ({
          id: user._id,
          firstname: _.get(user, 'infos.firstname', ''),
          location: _.get(user, 'location.city', 'Not defined'),
          photo: _.get(user, 'photos.profile', 'http://fakeimg.pl/200x200/'),
        });
      }));
      res.send({ done: 'success', likes });
    } res.send({ done: 'No likes yet' });
  });
};

const getVisitors = (req, res) => {
  const { id } = req.params;

  mongoConnectAsync(res, async (Users) => {
    const user = await Users.findOne({ _id: ObjectID(id) });

    if (user && user.visits) {
      const visits = await Promise.all(user.visits.map(async (username, index) => {
        const user = await Users.findOne({ 'account.username': username });

        if (!user) return false;

        return index < 3 && ({
          id: user._id,
          firstname: _.get(user, 'infos.firstname', ''),
          location: _.get(user, 'location.city', 'Not defined'),
          photo: _.get(user, 'photos.profile', 'http://fakeimg.pl/200x200/'),
        });
      }));
      res.send({ done: 'success', visits });
    } res.send({ done: 'No visits yet' });
  });
};


const addVisitor = (req, res) => {
  const { id } = req.params; // visited
  const { userID } = req.session; // visitor

  mongoConnectAsync(res, async (Users) => {
    if (ObjectID(id).equals(ObjectID(userID))) { // Error handler
      res.send({ done: 'This is your profile' });
      return false;
    }

    const visited = await Users.findOne({ _id: ObjectID(userID) });
    const visitor = await Users.findOne({ _id: ObjectID(id) });

    if (visitor && visited) {
      _.get(visited, 'notifications', []).splice(5);
      _.get(visited, 'notifications', []).unshift({
        type: 'visit',
        date: Date.now(),
        userID: ObjectID(visitor._id).toString(),
        firstname: _.get(visitor, 'account.firstname', ''),
      });

      Users.updateOne({ _id: ObjectID(id) }, {
        $set: { notifications: visited.notifications },
      }, (err) => {
        if (err) log('Visit notifications problem');
      });

      if (_.get(visited, 'visits', []).indexOf(_.get(visitor, 'account.username') === -1)) {
        _.get(visited, 'visits', []).unshift(_.get(visitor, 'account.username'));

        Users.updateOne({ _id: ObjectID(id) }, {
          $set: {
            visits: visited.visits,
            notifications: visited.notifications,
          },
        }, (err) => {
          if (!err) res.send({ done: 'success' });
        });
      } else res.send({ done: 'already' });
    }
  });
};

const likeUser = (res, req) => {
  const { id } = req.body;
  const { username } = req.session;

  mongoConnectAsync(res, async (Users) => {
    const visited = await Users.findOne({ _id: ObjectID(id) });
    const visitor = await Users.findOne({ 'account.username': username });

    if (!visitor || !visited || ObjectID(id)).equals(visitor._id || !visitor.account.hasProfilePicture) {
      res.end();
      return false;
    }

    const visitedLikes = _.get(visited, 'likes', []);
    const visitorLikes = _.get(visitor, 'likes', []);
    const isVisitorLikeVisited = visitedLikes.indexOf(visitor.account.username);
    const isVisitedLikeVisitor = visitorLikes.indexOf(visited.account.username);

    if (isVisitorLikeVisited === -1) {
      _.get(visited, 'notifications', []);
      _.get(visited, 'notifications', []).unshift({
        type: 'like',
        date: Date.now(),
        userID: visitor._id,
        firstname: visitor.infos.firsname,
      });
      visitedLikes.unshift(visitor.account.username);

      if (isVisitedLikeVisitor !== -1) { //mutual likes
        log('New Match!');
        
      }
    }
  });
}

const renderPublic = (req, res) => {
  const { username } = req.session;
  const { id } = req.params;
  const indexes = ['photo0', 'photo1', 'photo2', 'photo3', 'photo4'];

  mongoConnectAsync(res, async (Users) => {
    const me = await Users.findOne({ 'account.username': username });
    const user = await Users.findOne({ _id: ObjectID(id) });

    if (!me) {
      log('User not found, redirect to login page.');
      return res.redirect('/');
    } else if (!user) {
      log('User not found, redirect to login page.');
      return res.redirect('/profile');
    }

    const gallery = indexes.map(el => {
      _.set(user, `photos.${el}`, _.get(user, `photos.${el}`, 'http://fakeimg.pl/300x300/'));
      return _.get(user, `photos.${el}`, 'http://fakeimg.pl/300x300/');
    });

    _.set(user, 'photos.cover', _.get(user, 'photos.cover', 'http://fakeimg.pl/890x310/'));
    _.set(user, 'photos.profile', _.get(user, 'photos.profile', 'http://fakeimg.pl/300x300/'));

    return res.render('user', {
      isNotHome: true,
      title: 'Matcha - User',
      bodyPage: 'profile-body',
      user,
      id: user._id,
      login: _.capitalize(_.get(req.session, 'firstname', 'profile')),
      age: getAge(user.infos.birthdate),
      likes: _.get(user, 'likes', []).length,
      notifs: _.get(user, 'notifications', []).length,
      gallery,
    });
  });
};

export default {
  addVisitor,
  getVisitors,
  getLikes,
  popScore,
  getNotifications,
  renderPublic,
}
