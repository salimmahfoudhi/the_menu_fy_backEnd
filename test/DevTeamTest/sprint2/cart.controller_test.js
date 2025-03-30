const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

chai.use(chaiHttp);

const server = 'http://localhost:5555'; // Ensure this is the correct URL for your test server

describe("add product to cart", function() {
    this.timeout(10000); // 10 seconds timeout for all tests in this suite

    const userId = "66968aeab84dde86990d8299"; // Ensure this user ID exists in your database
    const productId = "663e682a5bdccbf4ac01d579"; // Ensure this product ID exists in your database
    const restaurantId = "642f472aba481311d532c677"; // Ensure this restaurant ID exists in your database

    // Step 1: Create Cart Data before running the order test
    before(function(done) {
        chai.request(server)
            .post("/cart/addProductToCart")
            .set('Cookie', `tokenLogin=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZjE5ODUxYzliYjA2NzM4MzYyZjUyZSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3MTE1NTMzODksImV4cCI6MTcxMjE1ODE4OX0.gtYOzEPRetDvTn6cEslX9DYtHAWYlx1CktRCsvsTkeg`)
            .send({
                userId: userId,
                productId: productId,
                quantity: 1,
                tableNb: 5,
                restaurantFK: restaurantId
            })
            .end((err, res) => {
                if (err) {
                    done(err);
                } else {
                    expect(res).to.have.status(200); 
                    console.log("Product added to cart successfully");
                    done();
                }
            });
    });

    // Step 2: Add Order Test
  
    describe("Delete product from cart", function() {
        it("should delete a product from the cart successfully", function(done) {
            chai.request(server)
                .delete(`/cart/delete/product/663e682a5bdccbf4ac01d579`)
                .set('Cookie', `tokenLogin=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZjE5ODUxYzliYjA2NzM4MzYyZjUyZSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3MTE1NTMzODksImV4cCI6MTcxMjE1ODE4OX0.gtYOzEPRetDvTn6cEslX9DYtHAWYlx1CktRCsvsTkeg`)
                .send({
                    userId: userId,
                    restaurantFK: restaurantId
                })
                .end((err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        // Check if the product was successfully deleted from the cart
                        expect(res).to.have.status(200); // Ensure this matches the actual expected status code
                        console.log("Product deleted from cart successfully");
                        done();
                    }
                });
            });
            });
        
});
