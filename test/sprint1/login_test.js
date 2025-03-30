require("dotenv").config();
const chai = require("chai");
let chaiHttp = require("chai-http");
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


describe(" -------------------- Test Responsible Authentication Function - Success Test -------------------- ", () => {
  it("Login function ", function (done) {
    this.timeout(20000);
    chai
    .request(`${process.env.BACKEND_URL_TEST}`)
      .post("auth/login")
      .send({ email: "lamis.hammami@esprit.tn", password: "lamislamis" })
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

/* describe("-------------------- Test Forgot & Reset Password Function - Success Test --------------------", () => {
  it("Forgot & Reset password function ", function (done) {
    this.timeout(10000);
    chai
    .request(`${process.env.BACKEND_URL_TEST}`)
    .put("/auth/forgotPwd")
      .send({ email: "safa.touil@esprit.tn" })
      .end(function (err, res) {
        if (err) {
          console.log(err.text);
        } else {
          const path = res?.header["set-cookie"][0]?.replace("; Path=/", "");
          const format_token = path.substr(15, path.length);
          //console.log(format_token);
          chai
          .request(process.env.BACKEND_URL_TEST)
          .post("/auth/verifCode")
            .set("Cookie", format_token) // Ajouter le cookie contenant le token
            .send({ message: "0245" })
            .end(function (err, res) {
              if (err) {
                console.log(err);
              } else {
                console.log(" Body 2 ", res.body);
                done();
              }
            });
        }
      });
  });
});

describe(" -------------------- Test Registration Function - Success Test -------------------- ", () => {
  it("Register function ", function (done) {
    this.timeout(10000);
    chai
    .request(`${process.env.BACKEND_URL_TEST}`)
    .post("/auth/registerClient")
      .send({
        firstName: "Donia",
        lastName: "Zidi",
        email: "donia.zidi@esprit.tn",
        password: "Safa12",
        passwordVerify: "Safa12",
      })
      .end(function (err, res) {
        if (err) {
          console.log(err);
        } else {
          const path = res.header["set-cookie"][0]?.replace("; Path=/", "");
          const format_token = path.substr(6, path.length);
          chai
          .request(`${process.env.BACKEND_URL_TEST}`)
          .post("/auth/activateAccount")
            .set("Cookie", format_token) // Ajouter le cookie contenant le token
            .send({ activationCode: "9932" })
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
 */
