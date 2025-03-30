require("dotenv").config();
const chai = require("chai");
let chaiHttp = require("chai-http");
chai.use(chaiHttp);

describe(" -------------------- Test Get privilege by employee-------------------- ", () => {
      it("Privilege function ", function (done) {
        this.timeout(10000);
        chai
        .request(`${process.env.BACKEND_URL_TEST}`)
        .get("user/getPrivilegeByEmployee/64223a4c1de3a0f192820650")
          .end(function (err, res) {
            if (err) {
              console.log(err.text);
            } else {
              console.log(res.text);
              console.log("Employee privilege retrieved successfully");
            }
            done();
          });
      });
});

describe(" -------------------- Test Update privilege employee - Success Test-------------------- ", () => {
    it("Update employee privilege function ", function (done) {
      this.timeout(10000);
      chai
      .request(`${process.env.BACKEND_URL_TEST}`)
        .put("user/updatePrivilege/employee/64d3c0ac09c5d31dec637bec")
        .send({print_qr : true , traiter_comments: false,
          table_management : true,
          consulter_historique : true,
          traiter_cmd : true,
          update_delay_waiting : false,
          livrer_cmd : false,
          paid_cash : false,
          consulter_comments : false,
          consulter_help_request : false,
          consulter_historique_help_request : false,
          traiter_help_request: true })
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
