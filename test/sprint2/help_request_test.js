require("dotenv").config();
const chai = require("chai");
let chaiHttp = require("chai-http");
chai.use(chaiHttp);

describe(" -------------------- Test Get List HelpFunction - Success Test -------------------- ", () => {
  it("Get All help function ", function (done) {
    this.timeout(10000);
    chai
      .request(`${process.env.BACKEND_URL_TEST}`)
      .get("help/getHelpList")
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
describe(" -------------------- Test Get  HelpFunction byId - Success Test -------------------- ", () => {
  it("Get help function ", function (done) {
    this.timeout(10000);
    chai
      .request(`${process.env.BACKEND_URL_TEST}`)
      .get("help/getHelpById/64a7c541b094980763a1fdad")
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
/* describe(" -------------------- Test Update HelpFunction byId - Success Test -------------------- ", () => {
  it("Update help function ", function (done) {
    this.timeout(10000);
    chai
      .request(`${process.env.BACKEND_URL_TEST}`)
      .put("/help/updateHelp/64a7c541b094980763a1fdad")
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
