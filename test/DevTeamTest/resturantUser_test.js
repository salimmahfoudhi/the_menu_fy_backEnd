require("dotenv").config();
const chai = require("chai");
let chaiHttp = require("chai-http");
chai.use(chaiHttp);

describe(" -------------------- Test Authentication Function - Success Test -------------------- ", () => {
  it("Login function ", function (done) {
    this.timeout(20000);
    chai
    .request(`${process.env.BACKEND_URL_TEST_LOCAL}`)
      .post("auth/login")
      .send({ email: "khaled.hafaiedh@esprit.tn", password: "titnriig" })
      .end(function (err, res) {
        if (err) {
          console.log("Res Error",err);
        } else {
          console.log(res.text);
          console.log("user logged");
        }
      });
      done();
  });
});

describe("------------------------------Test addEmployee Function - Success Test------------------------", () => {
    it("Should add an employee successfully", function (done) {
        this.timeout(20000);
        chai.request(`${process.env.BACKEND_URL_TEST_LOCAL}`)
        .post("user/addEmployee") // Assuming the endpoint is '/addEmployee'
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ZWM4NGIyMmI4MDcxZTA2YjU3ZTQxNSIsInJvbGUiOiJyZXNwb25zYWJsZSIsImlhdCI6MTcxMTU1NzcwMX0.2bBNhf6hHvBKVx1eSNvLuyMY0wYZCF9ByJDPLd-bJ-I')
       .send({ 
                userName: "Test User",
                email: "salim@example.com",
                phone: "123456789",
                address: "123 Test St",
                // Other required fields
            })
            .end(function (err, res) {
                if (err) {
                    console.log("Error:", err);
                    done(err); // Call done with error if there's an error
                } else {
                    console.log("Response:", res.text);
                    console.log("Employee added successfully");
                    done(); // Call done to signal completion without error
                }
            });
    });
});


describe("------------------------------Test getEmployeePagination Function---------------------------------", () => {
    it("Should get employees with pagination successfully", function (done) {
        this.timeout(20000);
        chai.request(`${process.env.BACKEND_URL_TEST_LOCAL}`)
            .get("user/getEmployeePagination")
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ZWM4NGIyMmI4MDcxZTA2YjU3ZTQxNSIsInJvbGUiOiJyZXNwb25zYWJsZSIsImlhdCI6MTcxMTU1NzcwMX0.2bBNhf6hHvBKVx1eSNvLuyMY0wYZCF9ByJDPLd-bJ-I')
            .query({ page: 1, search: '' }) // Adjust parameters as needed
            .end(function (err, res) {
                if (err) {
                    console.log("Error:", err);
                    done(err); // Call done with error if there's an error
                } else {
                    console.log("Response:", res.text);
                    console.log("Employees fetched successfully");
                    done(); // Call done to signal completion without error
                }
            });
    });
});

describe("--------------------------------Test getEmployeeArchiverPagination Function-------------------------", () => {
    it("Should get archived employees with pagination successfully", function (done) {
        this.timeout(20000);
        chai.request(`${process.env.BACKEND_URL_TEST_LOCAL}`)
            .get("user/getEmployeeArchiverPagination")
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ZWM4NGIyMmI4MDcxZTA2YjU3ZTQxNSIsInJvbGUiOiJyZXNwb25zYWJsZSIsImlhdCI6MTcxMTU1NzcwMX0.2bBNhf6hHvBKVx1eSNvLuyMY0wYZCF9ByJDPLd-bJ-I')
            .query({ page: 1, search: '' }) // Adjust parameters as needed
            .end(function (err, res) {
                if (err) {
                    console.log("Error:", err);
                    done(err); // Call done with error if there's an error
                } else {
                    console.log("Response:", res.text);
                    console.log("Archived employees fetched successfully");
                    done(); // Call done to signal completion without error
                }
            });
    });
});



describe("--------------------------- Test archiveEmployeById Function --------------------------", () => {
    it("Should archive/unarchive an employee account successfully", function (done) {
        this.timeout(20000);
        // Assuming you have an employee ID available for testing
        const employeeId = "65f9d19493089d6ffb14132f";
        
        chai.request(`${process.env.BACKEND_URL_TEST_LOCAL}`)
            .put(`user/archiveEmployeById/${employeeId}`)
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ZWM4NGIyMmI4MDcxZTA2YjU3ZTQxNSIsInJvbGUiOiJyZXNwb25zYWJsZSIsImlhdCI6MTcxMTU1NzcwMX0.2bBNhf6hHvBKVx1eSNvLuyMY0wYZCF9ByJDPLd-bJ-I')
            .end(function (err, res) {
                if (err) {
                    console.log("Error:", err);
                    done(err); // Call done with error if there's an error
                } else {
                    console.log("Response:", res.text);
                    console.log("Employee account archived/unarchived successfully");
                    done(); // Call done to signal completion without error
                }
            });
    });
});

describe("--------------------Test getTaxeCanada Route----------", () => {
    it("Should fetch tax data from Canada Revenue Agency website successfully", function (done) {
        this.timeout(20000);
        
        chai.request(`${process.env.BACKEND_URL_TEST_LOCAL}`)
            .get("restaurant/getTaxeCanada") // Assuming correct endpoint
            .end(function (err, res) {
                if (err) {
                    console.log("Error:", err);
                    done(err); // Call done with error if there's an error
                } else {
                    console.log("Response:", res.text);
                    console.log("Tax data fetched successfully");
                    done(); // Call done to signal completion without error
                }
            });
    });
});


describe("------------------------- Test getAllTaxe Function --------------------", () => {
    it("Should fetch all tax data successfully", function (done) {
        this.timeout(20000);
        
        chai.request(`${process.env.BACKEND_URL_TEST_LOCAL}`)
            .get("restaurant/getAllTaxe") // Assuming correct endpoint
            .end(function (err, res) {
                if (err) {
                    console.log("Error:", err);
                    done(err); // Call done with error if there's an error
                } else {
                    console.log("Response:", res.text);
                    console.log("Tax data fetched successfully");
                    done(); // Call done to signal completion without error
                }
            });
    });
});
describe("----------------------Test updateRestaurantCRM Function--------------", () => {
    it("Should update restaurant CRM data successfully", function (done) {
        this.timeout(20000);
        
        // Mock restaurant ID and request body
        const restaurantId = "64ec84b22b8071e06b57e416";
        const requestBody = {
            nameRes: "Updated Restaurant Name",
            address: "Updated Restaurant Address",
            color: "#720823",
            latitude: 36.86889103409991, // Example longitude value
            longitude: 10.099552601808607, // Example latitude value
            facebookLink: "Updated Facebook Link",
            twitterLink: "Updated Twitter Link",
            instagramLink: "Updated Instagram Link",
            tiktokLink: "Updated TikTok Link",
            phone: "Updated Phone Number",
            email: "updated@example.com"
        };
        

        chai.request(`${process.env.BACKEND_URL_TEST_LOCAL}`)
            .post(`restaurant/updateRestaurantCRM/${restaurantId}`)
            .send(requestBody)
            .end(function (err, res) {
                if (err) {
                    console.log("Error:", err);
                    done(err); // Call done with error if there's an error
                } else {
                    console.log("Response:", res.text);
                    console.log("Restaurant CRM data updated successfully");
                    done(); // Call done to signal completion without error
                }
            });
    });
});
