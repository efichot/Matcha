import { log } from 'console';
import nodemailer from 'nodemailer';
import _ from 'lodash';

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
}
