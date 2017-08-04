import log from 'console';
import _ from 'lodash';

const resLog = (res, msg = '', ret) => {
  if (_.isUndefined(ret)) {
    ret = msg;
  }
  log(msg);
  res.send(ret);
}

export default resLog;
