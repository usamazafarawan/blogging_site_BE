import express from 'express';
const router = express.Router();
import * as controller from './subscription.controller';



router.post('/create', controller.addSubscriptionMail);
router.get('/get', controller.getSubscriptionMailList);


export = router

