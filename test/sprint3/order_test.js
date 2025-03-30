require("dotenv").config();
const chai = require("chai");
let chaiHttp = require("chai-http");
chai.use(chaiHttp);

describe(" -------------------- Test reject cancel order request-------------------- ", () => {
  it("Reject cancel order request function ", function (done) {
    this.timeout(10000);
    chai
      .request(`${process.env.BACKEND_URL_TEST}`)
      .put("order/rejectCancelOrder/64cc31e8ee1f5c0b4230f66c")
      .send({ noteCancelOrder: "Order in progress DevOps" })
      .end(function (err, res) {
        if (err) {
          console.log(err.text);
        } else {
          // console.log(res.text);
          console.log("Cancel order request rejected");
        }
        done();
      });
  });
});

describe(" -------------------- Test Get Order byId - Success Test -------------------- ", () => {
  it("Get Order ById function ", function (done) {
    this.timeout(10000);
    chai
      .request(`${process.env.BACKEND_URL_TEST}`)
      .get("order/getById/64ca8902ddfdaaed6857c24e")
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
