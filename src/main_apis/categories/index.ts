import express from 'express';
const router = express.Router();
import * as controller from './categories.controller';


// router.post('/', controller.create);
// router.post('/login',controller.loginValidation)
// // router.put('/',  controller.npaAccept);
// router.get('/get', controller.getRecord);

// router.delete('/delete/:id', controller.deleteRecord);

// router.put('/put/:id',controller.updateRecord)


 router.post('/create', controller.createCategories);
  router.get('/get', controller.getCategories);


export = router

