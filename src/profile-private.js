import mongoConnectAsync from './config/mongo';
import { log } from 'console';
import _ from 'lodash';
import { getAge } from './lib';
import geoLib from 'geolib';
import { satelize } from 'satelize';

const geoCoder = require('node-geocoder')('google');
const getIP = require('external-ip')();

const deletePhoto = (req, res, next) => {
  const { username } = req.session;
  const { index } = parseInt(req.params) || -1;

  mongoConnectAsync(res, async (Users) => {
    const user = await Users.findOne({ 'account.username': username });
    const key = `photos.photo${index}`;
    const myObj = {
      key: 'http://fakeimg.pl/300x300/',
      'account.hasProfilePicture': false,
    }

    if (user) {
      Users.updateOne({ 'account.username': username }, {
        $set: {
          myObj,
        },
      }, (err) => {
        if (!err) res.send({ done: 'success' });
        else res.send({ done: `no photo to delete in index ${index}` });
      })
    } else res.send({ done: `no photo to delete in index ${index}` });
  })
}

const setProfile = (req, res, next) => {
  const { username } = req.session;
  const { index } = parseInt(req.params) || -1;

  mongoConnectAsync(res, async (Users) => {
    const user = await Users.findOne({ 'account.username': username });
    const key = `photo${index}`;

    if (user) {
      Users.updateOne({ 'account.username': username }, {
        $set: {
          'photos.profile': user.photos[key],
          'account.hasProfilePicture': true,
        },
      }, (err) => {
        if (!err) res.send({ done: 'success' });
        else res.send({ done: 'fail' });
      })
    } else res.send({ done: 'fail' });
  })
}

const uploadPhoto = (req, res, next) => {
  const { username } = req.session;
  const { photo, index } = req.body;
  let myObj = {};
  _.set(myObj, `photos.photo${index}`, photo);

  mongoConnectAsync(res, async (Users) => {
    Users.updateOne({ 'account.username': username }, {
      $set: {
        myObj,
      },
    }, (err) => {
      if (!err) res.send({ done: 'success' });
      else res.send({ done: 'fail' });
    });
  })
}

const addCover = (req, res, next) => {
  const { username } = req.session;
  const { cover } = req.body;

  mongoConnectAsync(res, async (Users) => {
    Users.updateOne({ 'account.username': username }, {
      $set: {
        'photo.cover': cover,
      },
    }, (err) => {
      if (!err) res.send({ done: 'success' });
      else res.send({ done: 'fail' });
    });
  })
}

const addInterests = (req, res, next) => {
  const { newInterest } = req.body;
  const { username } = req.session;

  mongoConnectAsync(res, async (Users) => {
    const user = await Users.findOne({ 'account.username': username });
    if (!user) res.send({ done: 'fail' });
    if (user) {
      const interests = user.interests || [];
      if (interests.indexOf(newInterest) < 0) {
        interests.push(newInterest);
        Users.updateOne({ 'account.username': username }, {
          $set: {
            interests,
          }
        }, (err) => {
          if (!err) res.send({ done: 'success' });
          else res.send({ done: 'fail' });
        })
      } else {
        res.send({ done: 'fail' });
      }
    }
  })
}

const getInterests = (req, res, next) => {
  mongoConnectAsync(res, async (Users) => {
    const request = await Users.find({}, { interests: 1 });
    let tab = [];

    request.forEach((v, i) => {
      if (!_.isUndefined(v.interests)) {
        v.interests.forEach((v2, i2) => {
          tab.push(v2);
        });
      }
    });
    res.send({ list: _.uniq(tab) });
  })
}

const deleteInterest = (req, res, next) => {
  const { toDelete } = req.body;
  const { username } = req.session;

  mongoConnectAsync(res, async (Users) => {
    const user = await Users.findOne({ 'account.username': username });

    if (user && user.interests) {
      const indexToDelete = user.interests.indexOf(toDelete);
      if (indexToDelete > -1) {
        user.interest.splice(indexToDelete, 1);

        Users.updateOne({ 'account.username': username }, {
          $set: {
            interests: user.interests,
          },
        }, (err) => {
          if (!err) res.send({ done: 'success' });
          else res.send({ data: 'fail' });
        })
      }
    }
  })
};

const updateOrientation = (req, res, next) => {
  const { orientation } = req.body;
  const { username } = req.session;

  mongoConnectAsync(res, async (Users) => {
    if (orientation === 'Straight' || orientation === 'Gay' || orientation === 'Bisexual') {
      Users.updateOne({ 'account.username': username }, {
        $set: {
          'info.orientation': orientation,
        },
      }, (err) => {
        if (!err) res.send({ done: 'success' });
        else res.send({ data: 'fail' });
      })
    } else res.send({ data: 'fail' });
  })
}

const updateSex = (req, res, next) => {
  const { sex } = req.body;
  const { username } = req.session;

  mongoConnectAsync(res, async (Users) => {
    if (sex === 'Male' || sex === 'Female' || sex === 'Other') {
      Users.updateOne({ 'account.username': username }, {
        $set: {
          'info.sex': sex,
        },
      }, (err) => {
        if (!err) res.send({ done: 'success' });
        else res.send({ data: 'fail' });
      })
    } else res.send({ data: 'fail' });
  })
}

const updateMail = (req, res, next) => {
  const { username } = req.session;
  const { mail } = req.body;

  mongoConnectAsync(res, async (Users) => {
    Users.updateOne({ 'account.username': username }, {
      $set: {
        'account.mail': mail,
      },
    }, (err) => {
      if (!err) res.send({ done: 'success' });
      else res.send({ done: 'fail' });
    });
  })
}

const updateName = (req, res, next) => {
  const { username } = req.session;
  const { info } = req.body;

  mongoConnectAsync(res, async (Users) => {
    Users.updateOne({ 'account.username': username }, {
      $set: {
        'info.firstname': info.firstname,
        'info.lastname': info.lastname,
      },
    }, (err) => {
      if (!err) res.send({ done: 'success' });
      else res.send({ done: 'fail' });
    })
  })
}

const updateBiography = (req, res, next) => {
  const { username } = req.session;
  const { biography } = req.body;

  mongoConnectAsync(res, async (Users) => {
    Users.updateOne({ 'account.username': username }, {
      $set: {
        'info.biography': biography,
      },
    }, (err) => {
      if (!err) res.send({ done: 'success' });
    });
  });
}

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
          latitude: payload.latitude || paris, 
lat,
          longitude: payload.longitude || paris.lon,
        })
      });

      mongoConnectAsync(res, async (Users) => {
        Users.updateOne({ 'account.usernaem': username }, {
          $set: {
            location: {
              country: loc[0].country,
              city: loc[0].city,
              latitude: payload.latitude || paris,
lat,
              longitude: payload.longitude || paris.lon,
            },
          },
        }, (err) => {
          if (!err) log('Location updated');
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

    mongoConnectAsync(res, async (Users) => {
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
  updateBiography,
  updateName,
  updateMail,
  updateSex,
  updateOrientation,
  deleteInterest,
  getInterests,
  addInterests,
  addCover,
  uploadPhoto,
  deletePhoto,
}
