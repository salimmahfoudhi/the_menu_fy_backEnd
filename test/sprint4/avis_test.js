require("dotenv").config();
const chai = require("chai");
let chaiHttp = require("chai-http");
chai.use(chaiHttp);

describe(" -------------------- Test ResponseAvis- Success Test-------------------- ", () => {
  it("ResponseAvis data function ", function (done) {
    this.timeout(10000);
    chai
      .request(`${process.env.BACKEND_URL_TEST}`)
      .put("avis/responseAvis/64cb99d729ad612e08a7093b")
      .send({ response: "Désolé pour votre experience clientéle -- DevOps Testing" })
      .end(function (err, res) {
        if (err) {
          console.log(err.text);
        } else {
          console.log(res.text);
        }
        done();
      });
  });
});

describe(" -------------------- Fetch Avis - Test Case -------------------- ", () => {
  it(" Fetch Avis BYID function ", function (done) {
    this.timeout(10000);
    chai
      .request(`${process.env.BACKEND_URL_TEST}`)
      .get("avis/getById/64cb99d729ad612e08a7093b")
      .end(function (err, res) {
        if (err) {
          console.log(err.text);
        } else {
          console.log(res.text);
        }
        done();
      });
  });
});

describe(" -------------------- Fetch Comments ByID - Test Case -------------------- ", () => {
  it(" Fetch Comments ByID  function ", function (done) {
    this.timeout(10000);
    chai
      .request(`${process.env.BACKEND_URL_TEST}`)
      .get("avis/getComments/64c3a8d750e3c9311052c18e")
      .end(function (err, res) {
        if (err) {
          console.log(err.text);
        } else {
          console.log(res.text);
        }
        done();
      });
  });
});
