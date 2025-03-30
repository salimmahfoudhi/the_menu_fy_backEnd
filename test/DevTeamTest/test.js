require("dotenv").config();
const chai = require("chai");
let chaiHttp = require("chai-http");
chai.use(chaiHttp);


describe(" -------------------- Test updateUser Function - Success Test -------------------- ", () => {
    it("Update user details", function (done) {
      this.timeout(20000);
      chai
        .request(`${process.env.BACKEND_URL_TEST}`)
        .put("/user/updateUser")
        .set('Content-Type', 'application/json')
        .set('Cookie', `tokenLogin=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZjE5ODUxYzliYjA2NzM4MzYyZjUyZSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3MTE1NTMzODksImV4cCI6MTcxMjE1ODE4OX0.gtYOzEPRetDvTn6cEslX9DYtHAWYlx1CktRCsvsTkeg`)
        .send({
            firstName: "sarra",
            lastName: "Abk",
            address: "sarraabdelkrim88@gmail.com",
            birthday: "1990-05-15", 
            phone: "+1234567890", 
            activate: true
          })
          
        .end(function (err, res) {
          if (err) {
            console.error("Error:", err);
            done(err); // Passer l'erreur au gestionnaire de test
          } else {
            console.log("Response:", res.body);
            console.log("User details updated");
            done(); // Signaler que le test est terminé
          }
        });
    });
  });
  describe(" -------------------- Test updatePassword Function - Success Test -------------------- ", () => {
    it("Update password", function (done) {
      this.timeout(20000);
      chai
        .request(`${process.env.BACKEND_URL_TEST}`)
        .put("/user/updatePasswordWeb")
        .set('Content-Type', 'application/json')
        .set('Cookie', `tokenLogin=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZjE5ODUxYzliYjA2NzM4MzYyZjUyZSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3MTE1NTMzODksImV4cCI6MTcxMjE1ODE4OX0.gtYOzEPRetDvTn6cEslX9DYtHAWYlx1CktRCsvsTkeg`)
        .send({
            oldPassword: " Sarra*123456789",
            password: " Sarra*@123456789",
            confirmPassword: "Sarra*123456789"
        })
        .end(function (err, res) {
          if (err) {
            console.error("Error:", err);
            done(err); // Passer l'erreur au gestionnaire de test
          } else {
            console.log("Response:", res.body);4
            console.log("Password updated");
            done(); // Signaler que le test est terminé
          }
        });
    });
});
describe("Test de resetPassword Function", () => {
  it("Devrait réinitialiser le mot de passe avec succès", (done) => {
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZjE5ODUxYzliYjA2NzM4MzYyZjUyZSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3MTE1NTMzODksImV4cCI6MTcxMjE1ODE4OX0.gtYOzEPRetDvTn6cEslX9DYtHAWYlx1CktRCsvsTkeg";
      
      // Mocking request body
      const requestBody = {
          password: "Sarra*@123456789",
          confirmPassword: "Sarra*@123456789"
      };

      chai.request(`${process.env.BACKEND_URL_TEST}`)
          .put("/auth/resetPwd")
          .set('Content-Type', 'application/json')
          .set('Cookie', `tokenForgotPass=${token}`)
          .send(requestBody)
          .end((err, res) => {
              if (err) {
                  console.error("Error:", err);
                  done(err); // Passer l'erreur au gestionnaire de test
              } else {
                  console.log("Response:", res.body);
                  console.log("Password updated");
                  done(); // Signaler que le test est terminé
              }
          });
  });
});
describe("Test de forgotPasswordWithCode Function", () => {
  it("Devrait envoyer un email de réinitialisation de mot de passe avec succès", (done) => {
      // Mocking request body
      const requestBody = {
          email: "sarraabdelkrim88@gmail.com"
      };

      chai.request(`${process.env.BACKEND_URL_TEST}`)
          .post("/auth/forgotPasswordWithCode")
          .set('Content-Type', 'application/json')
          .send(requestBody)
          .end((err, res) => {
              if (err) {
                  console.error("Error:", err);
                  done(err); // Passer l'erreur au gestionnaire de test
              } else {
                  console.log("Response:", res.body);
                  console.log("Email sent for password reset");
                  done(); // Signaler que le test est terminé
              }
          });
  });
});

describe("Test getImage Function", () => {
  it("Should return image file for authenticated user", (done) => {
      const tokenLogin = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZjE5ODUxYzliYjA2NzM4MzYyZjUyZSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3MTE1NTMzODksImV4cCI6MTcxMjE1ODE4OX0.gtYOzEPRetDvTn6cEslX9DYtHAWYlx1CktRCsvsTkeg";
      
      chai.request(`${process.env.BACKEND_URL_TEST}`)
          .get("/user/getImage")
          .set('Cookie', `tokenLogin=${tokenLogin}`)
          .end((err, res) => {
              if (err) {
                  console.error("Error:", err);
                  done(err);
              } else {
                  console.log("Response:", res.body);
                  console.log("Image file returned successfully");
                  done();


              }
          });
  });
});
