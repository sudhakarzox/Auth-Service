const User= require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    //validation check
    if(!errors.isEmpty()){
      console.error("Validation Failed");
      return res.status(400).json({message:"Validation Failed",error:errors.array()});
    }

    const name = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;

    //return success message on successfull creation of user
    return bcrypt
      .hash(password, 12)
      .then(hashedPw => {
        //console.log(hashedPw+"/////////////////////")
        const user = new User({
          email: email,
          password: hashedPw,
          firstName: name,
          lastName: lastName
        });
        return user.save();
      })
      .then(result => {
        //console.log(result+"///////////////////// final");
        res.status(201).json({ message: 'User created!', userId: result._id });
        return res;
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        console.error("somthing went wrong while signing up -- status:"+err.statusCode);
        next(err);
        return err;
      });
  };

  exports.login =async  (req, res, next) => {
    const errors = validationResult(req);
    //validation check
    if(!errors.isEmpty()){
      console.error("Validation Failed");
      return res.status(400).json({message:"Validation Failed",error:errors.array()});
    }

    const email = req.body.email;
    const password = req.body.password;

    //return token if credentials valid, else throw error
    let loadedUser;
    try{
      const user= await User.findOne({ email: email });
      //console.log(user + "--------------------------");
        if (!user) {
          const error = new Error('A user with this email could not be found.');
          error.statusCode = 401;
          throw error;
        }
        loadedUser = user;

        if (! await bcrypt.compare(password, user.password)) {
          const error = new Error('Wrong password!');
          error.statusCode = 401;
          throw error;
        }
        //console.log(loadedUser +"------------------LoadedUser");
        const token = jwt.sign( 
          {
            email: loadedUser.email,
            userId: loadedUser._id.toString()
          },
          
          'somesupersecretsecret',
          { expiresIn: '1h' }
        );
        //console.log(token);
        //res.status(200).json({ token: token, userId: loadedUser._id.toString() });
        res.cookie("access_token", token, {
            httpOnly: true//,
            //secure: process.env.NODE_ENV === "production",
          })
          .status(200)
          .json({ message: "Logged in successfully", userId: loadedUser._id.toString() });
        return res;
      
      } 
      catch(err) {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
        //console.log("test error" + err)
        return err;
      }
  
  };

  //   exports.login = (req, res, next) => {
  //   const errors = validationResult(req);
  //   if(!errors.isEmpty()){
  //     return res.status(400).json({message:"Validation Failed",error:errors.array()});
  //   }

  //   const email = req.body.email;
  //   const password = req.body.password;

  //   console.log(email);
  //   let loadedUser;

  //   User.findOne({ email: email })
  //     .then(user => {
  //       if (!user) {
  //         const error = new Error('A user with this email could not be found.');
  //         error.statusCode = 401;
  //         throw error;
  //       }
  //       loadedUser = user;
  //       return bcrypt.compare(password, user.password);
  //       })
  //     .then(isEqual => {
  //       if (!isEqual) {
  //         const error = new Error('Wrong password!');
  //         error.statusCode = 401;
  //         throw error;
  //       }
  //       const token = jwt.sign(
  //         {
  //           email: loadedUser.email,
  //           userId: loadedUser._id.toString()
  //         },
  //         'somesupersecretsecret',
  //         { expiresIn: '1h' }
  //       );
  //       //res.status(200).json({ token: token, userId: loadedUser._id.toString() });
  //       res.cookie("access_token", token, {
  //         httpOnly: true//,
  //         //secure: process.env.NODE_ENV === "production",
  //       })
  //       .status(200)
  //       .json({ message: "Logged in successfully", userId: loadedUser._id.toString() });
  //       return;
  //     })
  //     .catch(err => {
  //       if (!err.statusCode) {
  //         err.statusCode = 500;
  //       }
  //       next(err);
  //       return err;
  //     });
  
  // }; 


  // exports.test= async (req, res, next)=>{
  //     try{const result=await User.findOne({email:req.body.email})
  //     console.log(result)
  //     return result;}
  //     catch(err){
  //       console.log('/////////////////////////////////////////')
  //       return err
  //     }
  // }