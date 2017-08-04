import { MongoClient } from 'mongodb';

const mongoConnectAsync = (res, callback) => {
  const { connect } = MongoClient;

  const url = 'mongodb://localhost:27017/matcha_efichot';
  connect(url, (err, db) => {
    if (err) {
      res.status(500).send('Error - Failed to connect to database');
    } else {
      const Users = db.collection('users');
      callback(Users);
    }
  });
  return (true);
}

export default mongoConnectAsync;
