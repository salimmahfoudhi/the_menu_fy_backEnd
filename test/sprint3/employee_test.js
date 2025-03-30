require("dotenv").config();
const chai = require("chai");
let chaiHttp = require("chai-http");
chai.use(chaiHttp);

describe(" -------------------- Test Update employee data- Success Test-------------------- ", () => {
  it("Update employee data function ", function (done) {
    this.timeout(10000);
    chai
      .request(`${process.env.BACKEND_URL_TEST}`)
      .put("user/updateEmployee/64d3c0ac09c5d31dec637bec")
      .send({ firstName: "Employee DevOps Updated" })
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

describe(" -------------------- Test Disable Account employee data- Success Test-------------------- ", () => {
  it(" Disable Account data function ", function (done) {
    this.timeout(10000);
    chai
      .request(`${process.env.BACKEND_URL_TEST}`)
      .put("user/disableEmployeeAccount/64d3c0ac09c5d31dec637bec")
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
