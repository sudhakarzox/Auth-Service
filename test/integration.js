const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const app = require('../app');
const should = chai.should();
const expect = chai.expect;
const User= require('../models/user');


describe('POST /auth/signup', () => {

  it('should return response with code 201 if signup is successfull', function (done) {
      this.timeout(5000);
    chai
      .request(app)
      .post('/auth/signup')
      .send({
          "firstName":"Sudhakar",
          "lastName":"p",
          "email":"test@test.com",
          "password":"1234567"
      })
      .end((err, res) => {
        res.should.have.status(201);
        //expect(res.body).to.deep.equal();
        done();
      });
  });

  it('should throw error with code 400 if user already exist', function (done) {
      this.timeout(5000);
    chai
      .request(app)
      .post('/auth/signup')
      .send({
          "firstName":"Sudhakar",
          "lastName":"p",
          "email":"test@test.com",
          "password":"1234567"
      })
      .end((err, res) => {
        res.should.have.status(400);
        //expect(res.body).to.deep.equal();
        done();
      });
  });

  it('should throw error with code 400 if fields validation fails', function (done) {
      this.timeout(5000);
    chai
      .request(app)
      .post('/auth/signup')
      .send({
          "firstName":"",
          "lastName":"",
          "email":"test@test.com",
          "password":"1234567"
      })
      .end((err, res) => {
        res.should.have.status(400);
        //expect(res.body).to.deep.equal();
        done();
      });
  });


});

describe('POST /auth/login', () => {
    
    it('should return a token for valid credintials when called', function (done) {
        this.timeout(5000);
      chai
        .request(app)
        .post('/auth/login')
        .send({"email":"test@test.com",
                "password":"1234567"})
        .end((err, res) => {
          res.should.have.status(200);
          //expect(res.body).to.deep.equal();
          done();
        });
    });

    it('should throw error with code 400 if validation fails', function (done) {
        this.timeout(5000);
      chai
        .request(app)
        .post('/auth/login')
        .send({"email":"",
                "password":""})
        .end((err, res) => {
          res.should.have.status(400);
          //expect(res.body).to.deep.equal();
          done();
        });
    });

    it('should throw error with code 401 for invalid credintials when called', done => {
      chai
        .request(app)
        .post('/auth/login')
        .send({"email":"test@test.com",
                "password":"12356"})
        .end((err, res) => {
           // console.log(res.message);
          res.should.have.status(401);
          //expect(res.body).to.deep.equal();
          done();
    });
   
    }).timeout(5000);

    after(function(done){
      this.timeout(5000);
      User.deleteOne({email:'test@test.com'})
      .then(()=> done());
    });
});

