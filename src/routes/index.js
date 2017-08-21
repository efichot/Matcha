import express from 'express';
import home from '../homepage';
import profile from '../profile-private';
import user from '../profile-public';

const router = express.Router();

router.get('/', home.renderHome);
router.post('/user/add', home.addNewUser);
router.post('/user/login', home.connectUser);
router.get('/send-reset-email/:email', home.sendResetEmail);
router.get('/reset-password/:username/:password', home.resetPassword);
router.get('/reset-my-password/:id/:password', home.setNewPassword);

router.get('/profile', profile.renderProfile);
router.post('/location', profile.getLocation);
router.get('/location', profile.getCity);
router.post('/biography/update', profile.updateBiography);
router.post('/name/update', profile.updateName);

router.get('/user/new/visit/:id', user.addVisitor);
router.get('/user/get/visits/:id', user.getVisitors);
router.get('/user/get/likes/:id', user.getLikes);
router.get('/popularity/:id', user.getPopularity);

router.get('/set/connection', profile.setLastConnection);

export default router

