require("dotenv").config();
const chai = require("chai");
let chaiHttp = require("chai-http");
chai.use(chaiHttp);

let authToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0MjIxYTZlYmEwZmI3NDBlNjdjN2ZhMiIsInJvbGUiOiJzdXBlckFkbWluIiwiaWF0IjoxNjgyOTQyODExfQ.-Uv707WhF72pET_8ZVE0gyXqfP4P8t6ipZrq3C_DidA";

describe(" -------------------- Test Add new Category - Test Case -------------------- ", () => {
  it("Add Category function ", function (done) {
    this.timeout(20000);
    chai
    .request(`${process.env.BACKEND_URL_TEST}`)
      .post("category/add/64d60d1fd40e3c8c50934cc0")
      .set("Authorization", "Bearer" + authToken)
      .send({
        libelle: "Category DevOps Test 1 ",
        description: "Category DevOps Test 1",
        photo: "category3.jpg",
      })
      .end(function (err, res) {
        if (err) {
          console.log(err);
        } else {
          console.log(res.text);
        }
        done();
      });
  });
});

describe(" -------------------- Find all Categories - Test Case -------------------- ", () => {
  it("Fetch Categories function ", function (done) {
    this.timeout(20000);
    chai
    .request(`${process.env.BACKEND_URL_TEST}`)
      .get("category/retrieveall")
      .set("Authorization", "Bearer" + authToken)
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

describe(" -------------------- Find all Disabled Categories - Test Case -------------------- ", () => {
  it("Fetch Disabled Categories function ", function (done) {
    this.timeout(20000);
    chai
    .request(`${process.env.BACKEND_URL_TEST}`)
      .get("category/fetch/disable/64d60d1fd40e3c8c50934cc0")
      .set("Authorization", "Bearer" + authToken)
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

/* describe(" -------------------- Edit an Existant Category - Test Case -------------------- ", () => {
  it("Edit Category function ", function (done) {
    this.timeout(10000);
    chai
      .request("http://127.0.0.1:5555")
      .put("/category/update/64494516d4be0bdb84364e10")
      .set('Authorization','Bearer'+authToken)
      .send({description:"description de test edited 2" })
      .end(function (err, res) {
        if (err) {
          console.log(err.text);
        } else {
          console.log(res.text);
          done();
        }
      });
  });
});

describe(" -------------------- Enable an Existant Category - Test Case -------------------- ", () => {
  it("Edit Category function ", function (done) {
    this.timeout(10000);
    chai
      .request("http://127.0.0.1:5555")
      .put("/category/update/enable/visibility/644948ca924d04faf4451da0")
      .set('Authorization','Bearer'+authToken)
      .send({visibility:"ENABLE" })
      .end(function (err, res) {
        if (err) {
          console.log(err.text);
        } else {
          console.log(res.text);
          done();
        }
      });
  });
}); */

describe(" -------------------- Find all Enabled Categories - Test Case -------------------- ", () => {
  it("Fetch Enable Categories function ", function (done) {
    this.timeout(20000);
    chai
    .request(`${process.env.BACKEND_URL_TEST}`)
      .get("category/fetch/enable/64d60d1fd40e3c8c50934cc0")
      .set("Authorization", "Bearer" + authToken)
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
