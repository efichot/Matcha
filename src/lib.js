import { log } from 'console';
import nodemailer from 'nodemailer';
import _ from 'lodash';

const deg2rad = deg => deg * (Math.PI / 180);

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);  // deg2rad below
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km

  return Math.round(d); // Distance in km between the two points
};

const sortUsersByDistance = (allUsers) => {
  for (let i = 0; i< allUsers.length; i++) {
    for (let j = i + 1; j < allUsers.length; j++) {
      if (parseInt(allUsers[i].distance, 10) > parseInt(allUsers[j].distance, 10)) {
        let tmp = allUsers[i];
        allUsers[i] = allUsers[j];
        allUsers[j] = tmp;
      }
    }
  }
  return (allUsers);
}

const getAge = (dateString) => {
  const tmp = dateString.split('/');
  const birthdate = new Date(`${tmp[1]}/${tmp[0]}/${tmp[2]}`);
  const today = new Date();
  const age = today.getFullYear() - birthdate.getFullYear();
  const m = today.getMonth() - birthdate.getMonth();
  return ((m < 0 || (m === 0 && today.getDate() < birthdate.getDate() ? age - 1 : age)));
}

const resLog = (res, msg = '', ret) => {
  if (_.isUndefined(ret)) {
    log('ee');
    ret = msg;
  }
  log(msg);
  res.send(ret);
}

const sendEmail = (to, html, subject) => {
  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'matchaefichot@gmail.com',
      pass: 'matcha42',
    },
  });
  const mailOptions = {
    to,
    subject,
    html,
  };

  transport.sendMail(mailOptions, (err, info) => {
    log(err || info);
  });
};

export {
  resLog,
  sendEmail,
  getAge,
  getDistance,
  sortUsersByDistance,
}
