require("dotenv").config();
const chai = require("chai");
let chaiHttp = require("chai-http");
const { format } = require("path");
const jwtDecode = require('jwt-decode'); 

chai.use(chaiHttp);

describe(" -------------------- Test Authentication Function - Success Test -------------------- ", () => {
  it("Login function ", function (done) {
    this.timeout(20000);
    chai
    .request(`${process.env.BACKEND_URL_TEST}`)
      .post("auth/login")
      .send({ email: "ordearapp@gmail.com", password: "Admin1234" })
      .end(function (err, res) {
        if (err) {
          console.log("Res Error",err);
        } else {
          console.log(res.text);
          console.log("user logged");
        }
      });
      done();
  });
});


describe(" -------------------- Test Registration Function - Success Test -------------------- ", () => {
    it("Register and Activation function", function (done) {
      this.timeout(10000);
      chai
      .request(`https://backend.themenufy.com/`)
      .post("auth/registerClient")
        .send({
          firstName: "Donia",
          lastName: "Zidi",
          email: "fatma.abouelhija@esprit.tn",
          password: "Safa12",
          passwordVerify: "Safa12",
        })
        .end(function (err, res) {
          if (err) {
            console.log(err);
            done(err);
          } else {
            const path = res.headers["set-cookie"][0]?.replace("; Path=/", "");
            const cookiestring = res.headers["set-cookie"][0]
            const format_token = path.substr(6, path.length);
            const decoded = jwtDecode(format_token);
            const activateCode = decoded.activationCode; // Adjust this according to your token's payload structure
            console.log("Activation Code:", activateCode);
          
            chai
            .request(`https://backend.themenufy.com/`)
            .post("auth/activateAccount")
              .set("Cookie", cookiestring) 
              .send({ activationCode: activateCode })
              .end(function (err, res) {
                if (err) {
                  console.log(err.text);
                } else {
                  console.log(res.text);
                  done();
                }
              });
          }
        });
    });
  });

  describe("Test Forgot Password Function ", () => {
    it("should request a password reset code successfully", function (done) {
      this.timeout(10000); 
  
      
      chai.request('https://backend.themenufy.com/')
        .post("auth/forgotPwd")
        .send({
          email: "fatma.abouelhija@esprit.tn",
        })
        .end((err, res) => {
          if (err) {
            done(err);
          } else { 
            console.log(res);

            
            chai.request('https://backend.themenufy.com/')
            .post("/auth/verifCode")
            .set('Cookie', `tokenForgotPass=${tokenForReset}`)
            .send({ activationCodeForgotPass: resetCode })
            .end((err, res) => {
                if (err) return done(err);  
                console.log("this is res verifcode",res.headers);


            
            done();
        });
          }
        });
    });
  });


  
  