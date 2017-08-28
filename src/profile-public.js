import mongoConnectAsync from './config/mongo';
import { ObjectID } from 'mongodb';
import _ from 'lodash';
import { log } from 'console';
import { getAge } from './lib';

const getNotifications = (req, res, next) => {
  const { username } = req.session;

  mongoConnectAsync(res, async (Users) => {
    const user = await Users.findOne({ 'account.username': username });

    if (user) res.send({ done: 'success', notifs: _.get(user, 'notifications', []) });
    else res.send({ fail: 'no notifications' });
  });
}

const getPopularity = (req, res, next) => {
  const { id } = req.params;
  let score = 0;  

  mongoConnectAsync(res, async (Users) => {
    const user = await Users.findOne({ _id: ObjectID(id) });

    if (!user) return false;

    if (user) {
      const { info, location, interest, likes, visits, notifications } = user;

      if (!_.isUndefined(info.biography)) score += 10;
      if (!_.isUndefined(info.sex)) score += 10;
      if (!_.isUndefined(info.orientation)) score += 10;
      if (!_.isUndefined(location)) score += 10;
      if (!_.isUndefined(location.address)) score += 10;
      if (!_.isUndefined(interests)) score += (10 + interests.length);
      if (!_.isUndefined(likes)) score += (likes.length * 2);
      if (!_.isUndefined(visits)) score += (visits.length);
      if (getAge(user.info.birthdate) < 33) score += 10;
      if (!_.isUndefined(notifications)) score += (10 + notifications.length);      
      
      Users.updateOne({ _id: ObjectID(id) }, {
          $set: {
            popularity: score,
          }
        }, (err) => {
          if (err) log('Not enougth informations to get popularity');
        }
      );

      res.send({ done: 'success', score });
      
    }
  });
}

const getLikes = (req, res, next) => {
  const { id } = req.params;

  mongoConnectAsync(res, async (Users) => {
    const user = await Users.findOne({ _id: ObjectID(id) });

    if (user && user.likes) {
      const likes = await Promise.all(user.likes.map(async (username, index) => {
        const user = await Users.findOne({ 'account.username': username });

        if (!user) return false;

        return (index < 3 && ({
          id: user._id,
          firstname: user.info.firstname,
          location: user.location.city,
          photo: user.photo.profile,
        }))
      }));
      res.send({ done: 'success', likes });
    }
    res.send({ done: 'no likes yet' });
  })
}

const getVisitors = (req, res, next) => {
  const { id } = req.params;

  mongoConnectAsync(res, async (Users) => {
    const user = await findOne({ _id: ObjectID(id) });

    if (user && user.visits) {
      const visits = await Promise.all(user.visits.map(async (username, index) => {
        const user = await Users.findOne({ 'account.username': username });

        if (!user) return false;

        return (index < 3 && ({
          id: user._id,
          firstname: user.info.firstname,
          location: user.location.city,
          photo: user.photo.profile,
        }));
      }));
      res.send('sucess', visits);
    }
    res.send('no visits yet');
  })
}

const addVisitor = (req, res, next) => {
  const { id } = req.params; // visited
  const { userID } = req.session; // visitor

  monogoConnectAsync(res, async (Users) => {
    if (ObjectID(id) === ObjectID(userID)) {
      res.send('This is your profile');
      return false;
    }

    const visited = await Users.findOne({ _id: ObjectID(id) });
    const visitor = await Users.findOne({ _id: ObjectID(userID) });

    if (visited && visitor) {
      _.get(visited, 'notifications', []);
      visited.notifications.splice(5);
      visited.notifications.unshift({
        type: 'visit',
        date: Date.now(),
        userID: ObjectID(visitor._id).toString(),
        firstname: visitor.account.firstname,
      });
    }

    Users.updateOne({ _id: ObjectID(id) }, {
      $set: { notifications: visited.notifications },
    }, (err) => {
      if (err) log('Visited notifications problem');
    })

    if (_.get(visited, 'visits', []).indexOf(visitor.account.username) === -1) {
      visited.visits.unshift(visitor.account.username);
      Users.updateOne({ _id: ObjectID(id) }, {
        $set: {
          visits: visited.visits,
        }
      }, (err) => {
        if (!err) res.send({ done: 'success' });
      })
    } else {
      res.send({ done: 'already' });
    }
  })
}

export default {
  addVisitor,
  getVisitors,
  getLikes,
  getPopularity,
  getNotifications,
}
