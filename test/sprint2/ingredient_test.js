require("dotenv").config();
const chai = require("chai");
let chaiHttp = require("chai-http");
chai.use(chaiHttp);

describe(" -------------------- Test Add new Ingredient - Test Case -------------------- ", () => {
  it("Add Ingredient function ", function (done) {
    this.timeout(10000);
    chai
      .request(`${process.env.BACKEND_URL_TEST}`)
      .post("ingredient/add/64877e570450557ca217d094")
      .send({
        libelle: "Ingredient DevOps",
        type: "Supplement",
        quantity: 1,
        price: 0.8,
        qtMax: 2,
      })
      .end(function (err, res) {
        if (err) {
          console.log("Error", err.text);
        } else {
          console.log("Res : " + res.text);
        }
        done();

      });
  });
});

describe(" -------------------- Find all  - Test Case -------------------- ", () => {
  it("Fetch  function ", function (done) {
    this.timeout(10000);
    chai
      .request(`${process.env.BACKEND_URL_TEST}`)
      .get("ingredient/retrieve/64877e570450557ca217d094")
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

describe(" -------------------- Group by Type  - Test Case -------------------- ", () => {
  it("Fetch  function ", function (done) {
    this.timeout(10000);
    chai
      .request(`${process.env.BACKEND_URL_TEST}`)
      .get("ingredient/retrieve/group_by/type")
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
