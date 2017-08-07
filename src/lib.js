import { log } from 'console';
import nodemailer from 'nodemailer';
import _ from 'lodash';

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
}
