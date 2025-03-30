const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const WhyChooseUs = require("../../models/2024/WhyChooseUs.model");

chai.use(chaiHttp);
const expect = chai.expect;

describe("WhyChooseUs API CRUD Tests", () => {
  before(async () => {
    // Connect to your MongoDB database before running the tests
    await mongoose.connect("mongodb+srv://Ipactconsult:Ipact2021@cluster0.jt1kl.mongodb.net/Ordear_DB", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  after(async () => {
    // Disconnect from the MongoDB database after running the tests
    await mongoose.disconnect();
  });

  it("should create a new WhyChooseUs item", async () => {
    const newWhyChooseUs = {
      number:234,
      title: "Test Title",
      description: "Test Description",
      
    };

    const res = await chai
      .request(`${process.env.BACKEND_URL_TEST}/whyChooseUs`)
      .post("/whychooseuss")
      .send(newWhyChooseUs);

    expect(res).to.have.status(201);
    expect(res.body).to.be.an("object");
    expect(res.body).to.have.property("_id");
    expect(res.body.number).to.equal(newWhyChooseUs.number);
    expect(res.body.title).to.equal(newWhyChooseUs.title);
    expect(res.body.description).to.equal(newWhyChooseUs.description);
  });

  it("should get all WhyChooseUs items", async () => {
    // Clear existing data
    await WhyChooseUs.deleteMany({});
  
    // Create new items
    await WhyChooseUs.create([
      { number: 4, title: "Title 3", description: "Description 3" },
      { number: 5, title: "Title 4", description: "Description 4" }
    ]);
  
    // Make the request to retrieve items
    const res = await chai.request(`${process.env.BACKEND_URL_TEST}/whyChooseUs`).get("/whychooseus");
  
    // Log the response body for debugging
    console.log("Response body:", res.body);
  
    // Assertions
    expect(res).to.have.status(200);
    expect(res.body).to.be.an("array");
    expect(res.body).to.have.lengthOf(2);
  });

  it("should update a WhyChooseUs item", async () => {
    const whyChooseUs = await WhyChooseUs.create({
      number: 234,
      title: "second Title",
      description: "second Description",
      
    });

    const updatedData = { title: "Verify Title" };

    const res = await chai
      .request(`${process.env.BACKEND_URL_TEST}/whyChooseUs`)
      .put(`/whychooseus/${whyChooseUs._id}`)
      .send(updatedData);

    expect(res).to.have.status(200);
    expect(res.body).to.be.an("object");
    expect(res.body.title).to.equal(updatedData.title);
  });

  

});
