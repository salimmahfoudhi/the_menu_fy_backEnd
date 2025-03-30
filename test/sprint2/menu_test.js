require("dotenv").config();
const chai = require("chai");
let chaiHttp = require("chai-http");
chai.use(chaiHttp);

let authToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0MjIxYTZlYmEwZmI3NDBlNjdjN2ZhMiIsInJvbGUiOiJzdXBlckFkbWluIiwiaWF0IjoxNjgyOTQyODExfQ.-Uv707WhF72pET_8ZVE0gyXqfP4P8t6ipZrq3C_DidA";

describe(" -------------------- Test Add new Menu - Test Case -------------------- ", () => {
  it("Add menu function ", function (done) {
    this.timeout(10000);
    chai
      .request(`${process.env.BACKEND_URL_TEST}`)
      .post("menu/add/642f472aba481311d532c676")
      .set("Authorization", "Bearer" + authToken)
      .send({ name: "Menu DevOps" })
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

describe(" -------------------- Find all menus - Test Case -------------------- ", () => {
  it("Fetch menus function ", function (done) {
    this.timeout(10000);
    chai
      .request(`${process.env.BACKEND_URL_TEST}`)
      .get("menu/retrieve")
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

describe(" -------------------- Find all Disabled menu - Test Case -------------------- ", () => {
  it("Fetch Disabled menu function ", function (done) {
    this.timeout(10000);
    chai
      .request(`${process.env.BACKEND_URL_TEST}`)
      .get("category/fetch/disable/642f472aba481311d532c677")
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

/* describe(" -------------------- Edit an Existant menu - Test Case -------------------- ", () => {
  it("Edit menu function ", function (done) {
    this.timeout(10000);
    chai
    .request(`${process.env.BACKEND_URL_TEST}`)
    .put("/menu/update/644fa83742a3b9e0fb65c39d")
      .set("Authorization","Bearer"+authToken)
      .send({name:"menu now is updated" })
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

describe(" -------------------- Enable an Existant menu - Test Case -------------------- ", () => {
  it("Edit menu function ", function (done) {

    this.timeout(10000);
    chai
      .request("http://127.0.0.1:5555")
      .put("/menu/update/enable/visibility/644fa83742a3b9e0fb65c39d")
      .set("Authorization","Bearer"+authToken)
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

describe(" -------------------- Find all Enabled menu - Test Case -------------------- ", () => {
  it("Fetch Enable menu function ", function (done) {
    this.timeout(10000);
    chai
      .request(`${process.env.BACKEND_URL_TEST}`)
      .get("menu/fetch/enable/642f472aba481311d532c677")
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
