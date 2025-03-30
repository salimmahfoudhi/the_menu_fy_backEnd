require("dotenv").config();
const chai = require("chai");
let chaiHttp = require("chai-http");
chai.use(chaiHttp);


describe(" -------------------- Test Update Reclamation- Success Test-------------------- ", () => {
  it("Update Reclamation data function ", function (done) {
    this.timeout(10000);
    chai
    .request(`${process.env.BACKEND_URL_TEST}`)
    .put("reclamation/executeReclamation/64bf27cee5c0d708c7475690")
      .send({response : "Nous sommes désolés -- DevOps Message" })
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

describe(" -------------------- Fetch ReclamationNotTretead - Test Case -------------------- ", () => {
  it(" Fetch Reclamation Not Tretead  function ", function (done) {
    this.timeout(10000);
    chai
    .request(`${process.env.BACKEND_URL_TEST}`)
    .get("reclamation/getNotTretead")
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

describe(" -------------------- Fetch Reclamation ByID - Test Case -------------------- ", () => {
  it(" Fetch Reclamation ByID  function ", function (done) {
    this.timeout(10000);
    chai
    .request(`${process.env.BACKEND_URL_TEST}`)
    .get("reclamation/getById/64bf27cee5c0d708c7475690")
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
