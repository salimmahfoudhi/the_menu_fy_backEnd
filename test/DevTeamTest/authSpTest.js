require("dotenv").config();
const chai = require("chai");
let chaiHttp = require("chai-http");
chai.use(chaiHttp);

describe(" -------------------- Test Authentication Function - Success Test -------------------- ", () => {
  it("Login function ", function (done) {
    this.timeout(20000);
    chai
    .request(`${process.env.BACKEND_URL_TEST}`)
      .post("/auth/login")
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



  