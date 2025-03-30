const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

chai.use(chaiHttp);

const server = 'http://localhost:5555'; // Ensure this is the correct URL for your test server

describe("Allergy Management", function() {
    this.timeout(10000); // 10 seconds timeout for all tests in this suite

    const allergyName = "Peanuts"; // Example allergy name
    const tokenLogin = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ZDVjNjQxZmQyNjc1MDhkMzVlMTFkOSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3MjUzNzc2MjAsImV4cCI6MTcyNTM4MTIyMH0.A89HJ2Oe9wAih4wL0XajlDG0ez7yfsgclavbv6zddwY'; // Ensure this token is valid

    // Test adding an allergy
    describe("Add allergy to user profile", function() {
        it("should add an allergy successfully", function(done) {
            chai.request(server)
                .put("/user/AddAllergy")
                .set('Cookie', `tokenLogin=${tokenLogin}`)
                .send({ allergies: allergyName })
                .end((err, res) => {
                    if (err) {
                        console.error("Error during the request:", err.message);
                        done(err);
                    } else {
                        console.log("Response body:", res.body);  // Debugging line to inspect the response
                        expect(res).to.have.status(200); // Ensure this matches the actual expected status code
                        console.log("Allergy added successfully");
                        done();
                    }
                });
        });
    });

    // Test deleting an allergy
    describe("Delete allergy from user profile", function() {
        it("should delete an allergy successfully", function(done) {
            chai.request(server)
                .delete("/user/deleteAllergy")
                .set('Cookie', `tokenLogin=${tokenLogin}`)
                .send({ allergy: allergyName })
                .end((err, res) => {
                    if (err) {
                        console.error("Error during the request:", err.message);
                        done(err);
                    } else {
                        console.log("Response body:", res.body);  // Debugging line to inspect the response
                        expect(res).to.have.status(200); // Ensure this matches the actual expected status code
                        console.log("Allergy deleted successfully");
                        done();
                    }
                });
        });
    });

    // Additional test cases for edge scenarios can be added here, e.g., adding the same allergy twice, deleting a non-existent allergy, etc.
});