import express from 'express';
import home from '../homepage';
import profile from '../profile-private';

const router = express.Router();

router.get('/', home.renderHome);
router.post('/user/add', home.addNewUser);
router.post('/user/login', home.connectUser);
router.get('/send-reset-email/:email', home.sendResetEmail);
router.get('/reset-password/:username/:password', home.resetPassword);
router.get('/reset-my-password/:id/:password', home.setNewPassword);

router.get('/profile', profile.renderProfile);

router.get('/set/connection', profile.setLastConnection);

export default router

