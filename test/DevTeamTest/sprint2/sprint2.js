require("dotenv").config();
const chai = require("chai");
let chaiHttp = require("chai-http");
chai.use(chaiHttp);

const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ZWM4NGIyMmI4MDcxZTA2YjU3ZTQxNSIsInJvbGUiOiJyZXNwb25zYWJsZSIsImlhdCI6MTcxMTU1NzcwMX0.2bBNhf6hHvBKVx1eSNvLuyMY0wYZCF9ByJDPLd-bJ-I';
const backendUrl = `${process.env.BACKEND_URL_TEST_LOCAL}/order`;

// Test for /getOrdersPagination
describe("------------------------------Test getOrdersPagination Function---------------------------------", () => {
    it("Should get orders with pagination successfully", function (done) {
        this.timeout(20000);
        chai.request(backendUrl)
            .get("/getOrdersPagination")
            .set('Authorization', token)
            .query({ page: 1, search: '' }) // Adjust parameters as needed
            .end(function (err, res) {
                if (err) {
                    console.log("Error:", err);
                    done(err);
                } else {
                    console.log("Response:", res.text);
                    console.log("Orders fetched successfully");
                    done();
                }
            });
    });
});

// Test for /getOrdersPreparingPagination
describe("------------------------------Test getOrdersPreparingPagination Function---------------------------------", () => {
    it("Should get preparing orders with pagination successfully", function (done) {
        this.timeout(20000);
        chai.request(backendUrl)
            .get("/getOrdersPreparingPagination")
            .set('Authorization', token)
            .query({ page: 1, search: '' }) // Adjust parameters as needed
            .end(function (err, res) {
                if (err) {
                    console.log("Error:", err);
                    done(err);
                } else {
                    console.log("Response:", res.text);
                    console.log("Preparing orders fetched successfully");
                    done();
                }
            });
    });
});

// Test for /getOrdersCompletedPagination
describe("------------------------------Test getOrdersCompletedPagination Function---------------------------------", () => {
    it("Should get completed orders with pagination successfully", function (done) {
        this.timeout(20000);
        chai.request(backendUrl)
            .get("/getOrdersCompletedPagination")
            .set('Authorization', token)
            .query({ page: 1, search: '' }) // Adjust parameters as needed
            .end(function (err, res) {
                if (err) {
                    console.log("Error:", err);
                    done(err);
                } else {
                    console.log("Response:", res.text);
                    console.log("Completed orders fetched successfully");
                    done();
                }
            });
    });
});

// Test for /getOrdersSearchPagination
describe("------------------------------Test getOrdersSearchPagination Function---------------------------------", () => {
    it("Should get orders with search and pagination successfully", function (done) {
        this.timeout(20000);
        chai.request(backendUrl)
            .get("/getOrdersSearchPagination")
            .set('Authorization', token)
            .query({ page: 1, search: 'example' }) // Adjust parameters as needed
            .end(function (err, res) {
                if (err) {
                    console.log("Error:", err);
                    done(err);
                } else {
                    console.log("Response:", res.text);
                    console.log("Orders with search fetched successfully");
                    done();
                }
            });
    });
});

// Test for /acceptOrderOne/:id
describe("------------------------------Test acceptOrderOne Function---------------------------------", () => {
    it("Should accept an order successfully", function (done) {
        this.timeout(20000);
        const orderId = "ORDER_ID"; // Replace with actual order ID for testing
        chai.request(backendUrl)
            .put(`/acceptOrderOne/${orderId}`)
            .set('Authorization', token)
            .end(function (err, res) {
                if (err) {
                    console.log("Error:", err);
                    done(err);
                } else {
                    console.log("Response:", res.text);
                    console.log("Order accepted successfully");
                    done();
                }
            });
    });
});

// Test for /completedOrder/:id
describe("------------------------------Test completedOrder Function---------------------------------", () => {
    it("Should mark an order as completed successfully", function (done) {
        this.timeout(20000);
        const orderId = "ORDER_ID"; // Replace with actual order ID for testing
        chai.request(backendUrl)
            .put(`/completedOrder/${orderId}`)
            .set('Authorization', token)
            .end(function (err, res) {
                if (err) {
                    console.log("Error:", err);
                    done(err);
                } else {
                    console.log("Response:", res.text);
                    console.log("Order marked as completed successfully");
                    done();
                }
            });
    });
});

// Test for /getOrdersPaginationHistory
describe("------------------------------Test getOrdersPaginationHistory Function---------------------------------", () => {
    it("Should get orders history with pagination successfully", function (done) {
        this.timeout(20000);
        chai.request(backendUrl)
            .get("/getOrdersPaginationHistory")
            .set('Authorization', token)
            .query({ page: 1 }) // Adjust parameters as needed
            .end(function (err, res) {
                if (err) {
                    console.log("Error:", err);
                    done(err);
                } else {
                    console.log("Response:", res.text);
                    console.log("Orders history fetched successfully");
                    done();
                }
            });
    });
});

// Test for /cancelationOrder/:id
describe("------------------------------Test cancelationOrder Function---------------------------------", () => {
    it("Should cancel an order successfully", function (done) {
        this.timeout(20000);
        const orderId = "ORDER_ID"; // Replace with actual order ID for testing
        chai.request(backendUrl)
            .put(`/cancelationOrder/${orderId}`)
            .set('Authorization', token)
            .end(function (err, res) {
                if (err) {
                    console.log("Error:", err);
                    done(err);
                } else {
                    console.log("Response:", res.text);
                    console.log("Order canceled successfully");
                    done();
                }
            });
    });
});

// Test for /readyToCompletedOrder/:id/:status
describe("------------------------------Test readyToCompletedOrder Function---------------------------------", () => {
    it("Should set an order status to ready to complete successfully", function (done) {
        this.timeout(20000);
        const orderId = "ORDER_ID"; // Replace with actual order ID for testing
        const status = "status"; // Replace with appropriate status value
        chai.request(backendUrl)
            .put(`/readyToCompletedOrder/${orderId}/${status}`)
            .set('Authorization', token)
            .end(function (err, res) {
                if (err) {
                    console.log("Error:", err);
                    done(err);
                } else {
                    console.log("Response:", res.text);
                    console.log("Order status updated to ready to complete successfully");
                    done();
                }
            });
    });
});

// Test for /getOrdersWaitingPagination
describe("------------------------------Test getOrdersWaitingPagination Function---------------------------------", () => {
    it("Should get waiting orders with pagination successfully", function (done) {
        this.timeout(20000);
        chai.request(backendUrl)
            .get("/getOrdersWaitingPagination")
            .set('Authorization', token)
            .query({ page: 1, search: '' }) // Adjust parameters as needed
            .end(function (err, res) {
                if (err) {
                    console.log("Error:", err);
                    done(err);
                } else {
                    console.log("Response:", res.text);
                    console.log("Waiting orders fetched successfully");
                    done();
                }
            });
    });
});

// Test for /getAllOrdersWeb
describe("------------------------------Test getAllOrdersWeb Function---------------------------------", () => {
    it("Should get all orders for the web successfully", function (done) {
        this.timeout(20000);
        chai.request(backendUrl)
            .get("/getAllOrdersWeb")
            .set('Authorization', token)
            .end(function (err, res) {
                if (err) {
                    console.log("Error:", err);
                    done(err);
                } else {
                    console.log("Response:", res.text);
                    console.log("All orders fetched successfully for web");
                    done();
                }
            });
    });
});
