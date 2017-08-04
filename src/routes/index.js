import express from 'express';
import home from '../homepage';

const router = express.Router()

router.get('/', home.renderHome);
router.post('/user/add', home.addNewUser);
router.post('/user/login', home.connectUser);

export default router

