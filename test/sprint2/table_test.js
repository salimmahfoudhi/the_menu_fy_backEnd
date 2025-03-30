require("dotenv").config();
const chai = require("chai");
let chaiHttp = require("chai-http");
chai.use(chaiHttp);

let authToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0Y2EzOThmMGQ3MjM4NmUzMWE5OGJjNSIsInJvbGUiOiJyZXNwb25zYWJsZSIsImlhdCI6MTY5MjQ5MjA5MX0.t8ZCiWg1MJrmkTwEXkTRIRVhAVcr3Q_Pi--lbSjUvC0";


/* describe(" -------------------- Test Update tableFunction - Success Test-------------------- ", () => {
  it("Update Table function ", function (done) {
    this.timeout(10000);
    chai
      .request("https://backend.themenufy.com")
      .put("/table/update/64c6cac519a0e4004bc6f268")
      .send({chairNb: "4" })
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
 */
/* describe(" -------------------- Test Get tableFunction  - Success Test -------------------- ", () => {
  it("Get tables function ", function (done) {
    this.timeout(10000);
    chai
      .request(`${process.env.BACKEND_URL_TEST}`)
      .get("/table/getTables")
      .set("Cookie", authToken)
      .end(function (err, res) {
        if (err) {
          console.log(err.text);
        } else {
          console.log(res.text);
        }
        done();
      });
  });
}); */

describe(" -------------------- Test Get tableFunction byId - Success Test -------------------- ", () => {
  it("Get table function ", function (done) {
    this.timeout(10000);
    chai
      .request(`${process.env.BACKEND_URL_TEST}`)
      .get("table/getTablebyId/6480a385043657d8b6d68c63")
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
