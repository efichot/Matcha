import express from 'express';
import home from '../homepage';
import profile from '../profile-private';
import user from '../profile-public';
import around from '../around-me';
import search from '../advanced-search';
import messages from '../messages';

const router = express.Router();

router.get('/', home.renderHome);
router.post('/user/add', home.addNewUser);
router.post('/user/login', home.connectUser);
router.get('/send-reset-email/:email', home.sendResetEmail);
router.get('/reset-password/:username/:password', home.resetPassword);
router.get('/reset-my-password/:id/:password', home.setNewPassword);

router.get('/profile', profile.renderProfile);
router.post('/location', profile.getAddress);
router.get('/location', profile.getCity);
router.post('/biography/update', profile.editBiography);
router.post('/name/update', profile.editName);
router.post('/mail/update', profile.editMail);
router.post('/sex/update', profile.editSex);
router.post('/orientation/update', profile.editOrientation);
router.post('/interest/delete', profile.deleteInterest);
router.get('/interests/list', profile.listInterets);
router.post('/interest/add', profile.addInterest);
router.post('/cover/upload', profile.uploadCover);
router.post('/photo/upload', profile.uploadPhoto);
router.get('/photo/set/:index', profile.setProfile);
router.get('/photo/delete/:index', profile.deletePhoto);
router.get('/set/connection', profile.setLast);

router.get('/user/:id', user.renderPublic);
router.get('/user/new/visit/:id', user.addVisitor);
router.get('/user/get/visits/:id', user.getVisitors);
router.get('/user/get/likes/:id', user.getLikes);
router.get('/notifications', user.getNotifications);
router.get('/popularity/:id', user.popScore);
router.post('/like/plusone', user.likeUser);

router.get('/around-me', around.renderPage);
router.get('/advanced-search', search.renderPage);
router.get('/messages', messages.renderPage);
router.get('/messages/get', messages.getMessages);
router.post('/message/post', messages.postMessage);

router.get('/logout', home.logout);

export default router

