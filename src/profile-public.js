import mongoConnectAsync from './config/mongo';
import { ObjectID } from 'mongodb';
import _ from 'lodash';
import { log } from 'console';

const getVisitors = (req, res, next) => {
  const { id } = req.params;

  mongoConnectAsync(res, aync (Users) => {
    const user = await findOne({ _id: ObjectID(id) });

    if (user && user.visits) {
      const visits = await Promise.all(user.visits.map(async (username, index) => {
        const user = await Users.findOne({ 'account.username': username });

        if (!user) return false;

        return (index < 3 && ({
          id: user._id,
          firstname: user.info.firstname,
          location: user.info.location,
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
}
