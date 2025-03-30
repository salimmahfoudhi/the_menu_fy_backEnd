const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const express = require("express");
const linkRouter = require("../../routers/link.router");
const Link = require("../../models/link.model");
const app = express();
app.use(express.json());
app.use("/links", linkRouter);

chai.use(chaiHttp);
const expect = chai.expect;
describe("Link API Tests", () => {
    before(async () => {
      await mongoose.connect("mongodb+srv://Ipactconsult:Ipact2021@cluster0.jt1kl.mongodb.net/Ordear_DB", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    });
  
    after(async () => {
      await mongoose.disconnect();
    });
  
    const backendUrl = process.env.BACKEND_URL_TEST || "https://backend.themenufy.com"; 

    it("should get all links", async () => {
        await Link.deleteMany({});
      
        await Link.create([
          { link: "https://example1.com", active: true },
          { link: "https://example2.com", active: true }
        ]);
      
        const res = await chai.request(backendUrl).get("/links");
      
        console.log("Response body:", res.body); // Add this line for debugging
      
        expect(res).to.have.status(200);
      
        expect(res.body.success).to.be.true;
      
        expect(res.body.data).to.be.an("array");
      
        expect(res.body.data).to.have.lengthOf(2);
      });
    it("should update a link", async () => {
      const createdLink = await Link.create({ link: "https://example.com" });
  
      const updatedLink = { link: "https://updated.com" };
      const res = await chai
        .request(backendUrl)
        .put(`/links/${createdLink._id}`)
        .send(updatedLink);
  
      // Assert the response
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("object");
      expect(res.body.data.link).to.equal(updatedLink.link);
    });
  
    // Add more tests for other endpoints here...
  
  });
  