const User= require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = (req, res, next) => {
    
    const name = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;
    bcrypt
      .hash(password, 12)
      .then(hashedPw => {
        const user = new User({
          email: email,
          password: hashedPw,
          firstName: name,
          lastName: lastName
        });
        return user.save();
      })
      .then(result => {
        res.status(201).json({ message: 'User created!', userId: result._id });

      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  };

  exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    console.log(email);
    let loadedUser;
    User.findOne({ email: email })
      .then(user => {
        if (!user) {
          const error = new Error('A user with this email could not be found.');
          error.statusCode = 401;
          throw error;
        }
        loadedUser = user;
        return bcrypt.compare(password, user.password);
      })
      .then(isEqual => {
        if (!isEqual) {
          const error = new Error('Wrong password!');
          error.statusCode = 401;
          throw error;
        }
        const token = jwt.sign(
          {
            email: loadedUser.email,
            userId: loadedUser._id.toString()
          },
          'somesupersecretsecret',
          { expiresIn: '1h' }
        );
        //res.status(200).json({ token: token, userId: loadedUser._id.toString() });
        res.cookie("access_token", token, {
          httpOnly: true//,
          //secure: process.env.NODE_ENV === "production",
        })
        .status(200)
        .json({ message: "Logged in successfully", userId: loadedUser._id.toString() });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  };