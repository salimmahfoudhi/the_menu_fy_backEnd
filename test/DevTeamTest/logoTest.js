const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const Logo = require("../../models/logo.model");

chai.use(chaiHttp);
const expect = chai.expect;

describe("Logo API Tests", () => {
  before(async () => {
    await mongoose.connect("mongodb+srv://Ipactconsult:Ipact2021@cluster0.jt1kl.mongodb.net/Ordear_DB", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  after(async () => {
    await mongoose.disconnect();
});





  describe("GET /logos", () => {
    it("should get all logos", async () => {
      await Logo.create([
        { name: "Logo 1", img: "image1.jpg" },
        { name: "Logo 2", img: "image2.jpg" },
      ]);
  
      const res = await chai.request(`${process.env.BACKEND_URL_TEST}`).get("/logos");
  
      console.log("Response body:", res.body); // Logging the response body
  
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("array");
      expect(res.body).to.have.lengthOf.at.least(2); 
    });
  });
  



});
