require("dotenv").config();
const chai = require("chai");
let chaiHttp = require("chai-http");
chai.use(chaiHttp);

let authToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0MjIxYTZlYmEwZmI3NDBlNjdjN2ZhMiIsInJvbGUiOiJzdXBlckFkbWluIiwiaWF0IjoxNjgyOTQyODExfQ.-Uv707WhF72pET_8ZVE0gyXqfP4P8t6ipZrq3C_DidA";

describe(" -------------------- Test Add new product - Test Case -------------------- ", () => {
  it("Add Product function ", function (done) {
    this.timeout(10000);
    chai
      .request(`${process.env.BACKEND_URL_TEST}`)
      .post("product/add/64495a5a1a671c879d98aa6a")
      .set("Authorization", "Bearer" + authToken)
      .send({
        name: "Product DevOps",
        photo: "category6.jpg",
        description: "Description DevOps",
        price: 30,
        disponibilityDuration: 6,
        promotion: 15,
      })
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

describe(" -------------------- Find all products - Test Case -------------------- ", () => {
  it("Fetch products function ", function (done) {
    this.timeout(10000);
    chai
      .request(`${process.env.BACKEND_URL_TEST}`)
      .get("product/retrieve")
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

describe(" -------------------- Find all Enabled Products - Test Case -------------------- ", () => {
  it("Fetch Enabled Products function ", function (done) {
    this.timeout(10000);
    chai
      .request(`${process.env.BACKEND_URL_TEST}`)
      .get("product/fetch/enable")
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

describe(" -------------------- Enable an Existant Product - Test Case -------------------- ", () => {
  it("Edit Product function ", function (done) {
    this.timeout(10000);
    chai
      .request(`${process.env.BACKEND_URL_TEST}`)
      .put("product/update/enable/visibility/64495a5a1a671c879d98aa6a")
      .set("Authorization", "Bearer" + authToken)
      .send({ visibility: "ENABLE" })
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

describe(" -------------------- Find all Enabled Products - Test Case -------------------- ", () => {
  it("Fetch Enable Products function ", function (done) {
    this.timeout(10000);
    chai
      .request(`${process.env.BACKEND_URL_TEST}`)
      .get("product/fetch/enable")
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

describe(" -------------------- Find by category - Test Case -------------------- ", () => {
  it("Fetch by category function ", function (done) {
    this.timeout(10000);
    chai
      .request(`${process.env.BACKEND_URL_TEST}`)
      .get(
        "product/retrieve/enabled/products/category/64495a5a1a671c879d98aa6a"
      )
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
