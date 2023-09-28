const expect = require('chai').expect;
const sinon = require('sinon');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rewire = require('rewire');
var AuthController = rewire('../controllers/auth');
const User = require('../models/user');
const { validationResult } = require('express-validator');




describe('Auth Controller',  function() {
    
    context('login',()=>{

      it('should throw an error with code 500 if accessing the database fails',async function() {
        sinon.stub(User, 'findOne');
        User.findOne.callsFake(()=>{throw {}});

        const req = {
          body: {
            email: 'test@test.com',
            password: 'tester'
          }
        };

        const result =await  AuthController.login(req, {}, () => {});
        //console.log(result);
        expect(result).to.have.property('statusCode', 500);
        
        User.findOne.restore();
        
      });

      it('should throw an error with code 401 if user account not found',async function() {
        
        sinon.stub(User, 'findOne');
        User.findOne.callsFake(()=>{});

        const req = {
          body: {
            email: 'test@test.com',
            password: 'test'
          }
        };

        const result1 =await  AuthController.login(req, {}, () => {});
        //console.log(result1 + '////////////////////');
        expect(result1).to.have.property('statusCode', 401);
        
       User.findOne.restore();
        
      });

      it('should throw an error with code 401 for invalid credintials',async function() {
        
        let doc={
          email: 'test@teat',
          password: 'test'
        }

        sinon.stub(User, 'findOne');
        User.findOne.callsFake(()=>doc);

        sinon.stub(bcrypt, 'compare');
        bcrypt.compare.callsFake(()=> false );

        const req = {
          body: {
            email: 'test@test.com',
            password: 'test'
          }
        };

        const result1 =await  AuthController.login(req, {}, () => {});
        //console.log(result1 + '////////////////////');
        expect(result1).to.have.property('statusCode', 401);
        
        bcrypt.compare.restore();
        User.findOne.restore();
        
      });

      it('should return response with code 200 for valid credintials',async function() {
        
        const doc={
          _id:123,
          email: 'test@teat',
          password: 'test'
        }

        const res = {
          statusCode:null,
          status: (function (data) {
            this.statusCode=data;
            return this;
          }) ,
          cookie: (function (data,data1,data2){
            return this;
          }),
          json: function (body) {
            this.body = body
            return this;
        }
        }

        sinon.stub(User, 'findOne');
        User.findOne.resolves(doc);

        // sinon.stub(res, 'cookie');
        // res.cookie.resolves('access_token');

        sinon.stub(bcrypt, 'compare');
        bcrypt.compare.callsFake(()=>true);

        sinon.stub(jwt, 'sign');
        jwt.sign.callsFake(()=> 'jwtToken');
        

        const req = {
          body: {
            email: 'test@test.com',
            password: 'test'
          }
        };

        const result1 =await  AuthController.login(req, res, () => {});
        //console.log(result1 + '////////////////////');
        expect(result1).to.have.property('statusCode', 200);
        
        bcrypt.compare.restore();
        User.findOne.restore();
        jwt.sign.restore();
        
      });


    })

    context('signup',()=>{


      it('should return response with code 201 if signup is successfull',async function(){
        
        const doc={
          _id:123,
          email: 'test@teat',
          password: 'test'
        }

        saveStub=sinon.stub().resolves(doc);
        FakeUserClass = sinon.stub().returns({save:saveStub});

        AuthController.__set__('User',FakeUserClass);

        sinon.stub(bcrypt, 'hash');
        bcrypt.hash.resolves('hash');

        const req = {
          body: {
            firstName: 'test@test.com',
            lastName:'test',
            email:'test@test.com',
            password: 'tester'
          }
        };

        const res = {
          statusCode:null,
          status: (function (data) {
            this.statusCode=data;
            return this;
          }),
          json: function (body) {
            this.body = body
            return this;
        }
        }

        const result=await AuthController.signup(req,res,()=>{});
        expect(result).to.have.property('statusCode', 201);

        bcrypt.hash.restore();

      })

      it('should throw an error with code 500 if db fails',async function(){

        saveStub=sinon.stub().rejects('error');
        FakeUserClass = sinon.stub().returns({save:saveStub});

        AuthController.__set__('User',FakeUserClass);

        sinon.stub(bcrypt, 'hash');
        bcrypt.hash.resolves('hash');


        const req = {
          body: {
            firstName: 'test@test.com',
            lastName:'test',
            email:'test@test.com',
            password: 'tester'
          }
        };

        const res = {
          statusCode:null,
          status: (function (data) {
            this.statusCode=data;
            return this;
          }),
          json: function (body) {
            this.body = body
            return this;
        }
        }

        const result=await AuthController.signup(req,res,()=>{});
        expect(result).to.have.property('statusCode', 500);

        bcrypt.hash.restore();

      })

      it('should throw an error with code 400 if validation fails',async function(){

        isEmptyStub=sinon.stub().returns(false);
        arrayStub=sinon.stub().returns('[]');

        validationStub=sinon.stub().returns({isEmpty:isEmptyStub,array:arrayStub});
        
        AuthController.__set__('validationResult',validationStub);

        const req = {
          body: {
            firstName: 'test@test.com',
            lastName:'',
            email:'test@.com',
            password: 'tester'
          }
        };

        const res = {
          statusCode:null,
          status: (function (data) {
            this.statusCode=data;
            return this;
          }),
          json: function (body) {
            this.body = body
            return this;
        }
        }

        const result=await AuthController.signup(req,res,()=>{});
        //console.log(result)
        expect(result).to.have.property('statusCode', 400);

       

      })

    })

    

      
});

// it('should throw an error with code 400 if validation fails',  function(done) {
        
//     const req = {
//       body: {
//         email: '',
//         password: '',
//       }
//     };
  
//     try {
//       const result =  AuthController.login(req,{},()=>{});
//       //console.log(result);
//       //expect(result).to.be.an('error');
//       expect(result).to.have.property('statusCode', 500);
//       done();
//     } catch (err) {
//       console.log(err);
//       done(err);
//     } 
//   });