import mongoConnectAsync from './config/mongo';
import { log } from 'console';
import _ from 'lodash';
import { getAge } from './lib';
import geoLib from 'geolib';
import { satelize } from 'satelize';

const geoCoder = require('node-geocoder')('google');
const getIP = require('external-ip')();

const getCity = (req, res, next) => {
  const { username } = req.session;
  const paris = {
    lat: 48.866667,
    lon: 2.333333,
  }

  getIP((err, ip) => {
    satelize({ ip }, (err, payload) => {
      if (err) return res.end();

      geoCoder.reverse({
        lat: payload.latitude || paris.lat,
        lon: payload.longitude || paris.lon,
      }, (err, loc) => {
        if (err) return res.end();

        res.send({
          city: loc[0].city || 'Paris',
          country: loc[0].country || 'France',
          latitude: payload.latitude || paris,lat,
          longitude: payload.longitude || paris.lon,
        })
      });

      mongoConnectAsync(res, async (Users) => {
        Users.updateOne({ 'account.usernaem': username }, {
          $set: {
            location: {
              country: loc[0].country,
              city: loc[0].city,
              latitude: payload.latitude || paris, lat,
              longitude: payload.longitude || paris.lon,
            }
          }
        }, (err) => {
          if(!err) log('Location updated');
        })
      })
      return true;
    })
    return true;
  })
}

const getLocation = (req, res, next) => {
  const { username } = req.session;

  geoCoder.reverse({
    lat: req.body.latitude,
    lon: req.body.longitude,
  }), (err, loc) => {
    res.send({ address: loc[0].formattedAddress });

    mongoConnectAsync(res, async(Users) => {
      Users.updateOne({ 'account.username': username }, {
        $set: {
          location: {
            country: loc[0].country,
            city: loc[0].city,
            address: loc[0].formattedAddress,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
          },
        },
      }, (err) => {
        if (!err) log('Location updated');
      });
    })
  }
}

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
  getLocation,
  getCity,
}
