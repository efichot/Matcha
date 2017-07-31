import express from 'express';
import home from '../homepage';

const router = express.Router()

router.get('/', home.renderHome);

export default router

