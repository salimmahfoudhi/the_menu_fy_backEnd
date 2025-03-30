const jwt_decode = require("jwt-decode");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { Decimation } = require("chart.js");
const RandomString = require("randomstring");

const User = require('../models/user.model');
const RequestJoin = require('../models/requestJoin.model');
const Restaurant = require('../models/restaurant.model');

// --------------- Email send -------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: `${process.env.EMAIL}`,
    pass: `${process.env.PASSWORD}`,
  },
});

const requestController = {

  requestJoin: async (req, res) => {
    try {
      const { firstName, lastName, email, phone, proof, name, cuisineType, address, taxe } = req.body;
      if (!firstName || !lastName || !email || !name || !address || !cuisineType || !proof || !phone) {
        return res
          .status(400)
          .json({ message: "Not all fields have been entered" });
      }
      RequestJoin.findOne({ email }).then((user) => {
        if (user) {
          res.status(400).json({ message: "Email is already taken" });
        } else {
          const newRestaurant = new RequestJoin({
            firstName,
            lastName,
            phone,
            email,
            proof,
            name,
            cuisineType,
            address,
            taxe,
            role: 'responsable',
            status: 'in progress',
          });
          newRestaurant.save();
          return res.status(400).json({ message: "Request sent" })
        }
      });
    } catch (err) { return res.status(500).json({ message: "Register failed" + "" + err.message }); }
  },
  getRequest: async (req, res) => {
    try {
      const tokenLogin = req.cookies.tokenLogin;
      const decodeTokenLogin = jwt.verify(tokenLogin, process.env.JWT_SECRET);
      const idUser = decodeTokenLogin.id;
      const role = decodeTokenLogin.role;

      if (idUser && role == 'superAdmin') {
        const registrationRequests = await RequestJoin.find();
        return res.status(200).json({ requests: registrationRequests })
      } else {
        res.json('Vous n etes pas autorisé de faire cette opération')
      }

    } catch (err) {
      return res.status(500).json({ message: "Something wrong" + "" + err.message });
    }

  },
  refuseRequest: async (req, res) => {
    try {
      const tokenLogin = req.cookies.tokenLogin;
      const decodeTokenLogin = jwt.verify(tokenLogin, process.env.JWT_SECRET);
      const idUser = decodeTokenLogin.id;
      const role = decodeTokenLogin.role;

      if (idUser && role == 'superAdmin') {

        const registrationRequests = await RequestJoin.findOne();
        RequestJoin.updateOne(
          { "email": registrationRequests.email },
          { $set: { "status": "refused" } }

        ).then(() => {
          res.json({ message: "updated" });

          const reason = req.body.reason;
          const options = {
            from: process.env.EMAIL,
            to: registrationRequests.email,
            subject: "Request denied",
            html: `
              <div style = "max-width: 700px;
                    margin: 0 auto;
                    background-color: #fff;
                    box-shadow: 0px 0px 10px rgba(0,0,0,0.1);
                    border-radius: 5px;
                    border: 5px solid #ddd;padding: 50px 20px; font-size: 110%;"
              >
              <h2 style="font-size: 18px; margin-bottom: 20px; text-align: center; text-align: center; color: #FA8072"> Join request denied</h1>
              <p style="margin-top: 0; margin-bottom: 15;">We regret that we are unable to accept your request due to ${reason}</p>
              <p>Team Ordear</p>
              </div>

               `,
          };

          transporter.sendMail(options, function (err, info) {
            if (err) {
              return res.status(400).json({ error: "Error activating account" + err });
            } else { return res.status(200).json({ message: "An email has been sent" }); }
          });

        })
          .catch(() => {
            res.json({ message: "not updated" });
          });


      } else {
        res.json('Vous n etes pas autorisé de faire cette opération')
      }

    } catch (err) {
      return res.status(500).json({ message: "Something wrong" + "" + err.message });
    }
  },
};




module.exports = requestController;