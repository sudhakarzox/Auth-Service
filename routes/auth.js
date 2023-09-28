const express = require('express');
const User= require('../models/user');
const authController=require('../controllers/auth');

const { body } = require('express-validator');

const router = express.Router();


router.post('/signup',[
    body('firstName').trim().not().isEmpty().withMessage('Please enter a First Name.'),
    body('lastName').trim().not().isEmpty().withMessage('Please enter a Last Name.'),
    body('email').isEmail().withMessage('Please enter a valid email.').normalizeEmail()
    .custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject('E-Mail address already exists!');
          }
        });
      })
      ,
    body('password').trim().isLength({ min: 5 }).withMessage('Password length must be min 6.')
    ] ,authController.signup);

router.post('/login',
    [body('email').trim().not().isEmpty().normalizeEmail(),
      body('password').trim().not().isEmpty()]
    ,authController.login);

module.exports = router;

