const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const express = require("express");
const contactRouter = require("../../routers/contact.router");
const Contact = require("../../models/contact.model");

const app = express();
app.use(express.json());
app.use("/contact", contactRouter);

chai.use(chaiHttp);
const expect = chai.expect;

describe("Contact API Tests", () => {
  before(async () => {
    await mongoose.connect("mongodb+srv://Ipactconsult:Ipact2021@cluster0.jt1kl.mongodb.net/Ordear_DB", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  after(async () => {
    await mongoose.disconnect();
  });

  it("should create a new contact", async () => {
    const newContact = {
      phone: "1234567890",
      email: "test@example.com",
      adresse: "123 Test St",
      localisation: [0, 0],
    };

    const res = await chai.request(`${process.env.BACKEND_URL_TEST}`).post("/contact").send(newContact);

    expect(res).to.have.status(201);
    expect(res.body).to.be.an("object");
    expect(res.body).to.have.property("_id");
    expect(res.body.phone).to.equal(newContact.phone);
    expect(res.body.email).to.equal(newContact.email);
    expect(res.body.adresse).to.equal(newContact.adresse);
    expect(res.body.localisation).to.deep.equal(newContact.localisation);
  });

  it("should get all contacts", async () => {
    try {
      await Contact.create([
        {
          phone: "1234567890",
          email: "test1@example.com",
          adresse: "123 Test St",
          localisation: [0, 0],
        },
        {
          phone: "0987654321",
          email: "test2@example.com",
          adresse: "456 Test St",
          localisation: [1, 1],
        },
      ]);
  
      const res = await chai.request(app).get("/contact");
  
      console.log("Response body:", res.body);
  
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("array");
      expect(res.body).to.have.lengthOf.at.least(1); // Ensure there's at least one contact returned
    } catch (error) {
      console.error("Error:", error);
    }
  });
  
  it("should update a contact", async () => {
 
    const newContact = await Contact.create({
      phone: "1234567890",
      email: "test@example.com",
      adresse: "123 Test St",
      localisation: [0, 0],
    });

    const updatedData = {
      phone: "0987654321",
      email: "updated@example.com",
      adresse: "456 Updated St",
      localisation: [1, 1],
    };

   
    const res = await chai
      .request(`${process.env.BACKEND_URL_TEST}`)
      .put(`/contact/${newContact._id}`)
      .send(updatedData);

   
    expect(res).to.have.status(200);
    expect(res.body).to.be.an("object");
    expect(res.body.phone).to.equal(updatedData.phone);
    expect(res.body.email).to.equal(updatedData.email);
    expect(res.body.adresse).to.equal(updatedData.adresse);
    expect(res.body.localisation).to.deep.equal(updatedData.localisation);
  });

});
