const jwt_decode = require("jwt-decode");
const twilio = require('twilio');
const RandomString = require("randomstring");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require('multer');
const nodemailer = require("nodemailer");
const fs = require('fs'); 
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Employee = require('../models/employee.model');
const sendCredentialss = require('../utils/config/EmailSendCredentials superAdmin');
const Restaurant = require('../models/restaurant.model');
const subdivisions = require('../utils/subdivisions.json');
const countries = require('../utils/countries.json');
const Privilege = require('../models/sprint3/privilege.model')
const sendCredentials = require('../utils/config/EmailSendCredentials');
const UserArchive = require('../models/userarchive.model');
// --------------- Email send -------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: `${process.env.EMAIL}`,
    pass: `${process.env.PASSWORD}`,
  },
});

// ----------- Multer image ----------------------------
const MIME_TYPES = { 
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg',
  'image/png': 'png'
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './uploads/user/');
  },
  filename: (req, file, callback) => {
    const originalName = file.originalname;
    const extension = MIME_TYPES[file.mimetype];
    callback(null, originalName);
  }
});
const upload = multer({ storage: storage }).single("image");

// ----------- Twilio SMS ---------------------
const accountSid = `${process.env.ACCOUNT_SID}`
const authToken = `${process.env.AUTH_TOKEN}`;
const accountSidMobile = `${process.env.ACCOUNT_SID_MOBILE}`
const authTokenMobile = `${process.env.AUTH_TOKEN_MOBILE}`;
const client = twilio(accountSid, authToken);
const clientMobile = twilio(accountSidMobile, authTokenMobile);

const sendSMS = async (to, message) => {
  try {
    await client.messages.create({
      body: message,
      from: '+17173125011', // Votre numéro Twilio
      to: '+21650427750', // Numéro de téléphone du destinataire
    });
    console.log(`SMS sent to ${to}: ${message}`);
  } catch (error) {
    console.error(error);
    throw new Error('Failed to send SMS');
  }
};


const userController = {

  //---------------- Responsable operations ---------------------------
  addUser: async (req, res) => {
    try {
      const tokenViewProfile = req.cookies.tokenLogin || req.headers;
      let decodeTokenLogin = jwt_decode(tokenViewProfile);
      let idUser = decodeTokenLogin.id;
      let role = decodeTokenLogin.role;

      if (idUser) {
        if (role == "superAdmin" || role == "responsable") {
          const { userName, email, phone, address, restaurantFK } = req.body;

          const { table_management, print_qr, consulter_historique, traiter_cmd, update_delay_waiting, livrer_cmd,
            paid_cash, consulter_comments, traiter_comments, consulter_help_request, traiter_help_request,
            consulter_historique_help_request, user_management } = req.body

          if (!userName || !email || !phone || !address) {
            return res
              .status(400)
              .json({ message: "Not all fields have been entered" });
          }
          const existingUser = await User.findOne({ email });

          if (existingUser) {
            return res.status(400).json({ error: "Email is already taken" });
          }
          const pwdRandom = RandomString.generate({ length: 8, charset: "string", });
          const salt = await bcrypt.genSalt();
          const passwordHash = await bcrypt.hash(pwdRandom, salt);

          const credentials = {email : email , password : pwdRandom}
          sendCredentials.sendCredentials(credentials, res)
          const newUser = new User({
            userName,
            email,
            password: passwordHash,
            image:'employee.png',
            phone,
            address,
            role: 'employee',
            activate: 1,
            firstLogin: 0,
            statusarchieve:0,
            restaurantFK: restaurantFK
          });

          const newPrivilege = new Privilege({
            user_management: 0 ,
            table_management,
            print_qr,
            consulter_historique,
            traiter_cmd,
            update_delay_waiting,
            livrer_cmd,
            paid_cash,
            consulter_comments,
            traiter_comments,
            consulter_help_request,
            consulter_historique_help_request,
            traiter_help_request,
            user: newUser
          })
          const savedUser = await newUser.save();
          const savedPrivilege = await newPrivilege.save();
          return res.status(200).json({ success: true, message: "User added successfully" });

        }
      }
    }
    catch (error) {
      console.log(error);
    }
  },
  ///////////////-------------------allergieweb---------------------------////////
  AddAllergyweb: async (req, res) => {
    try {
      const userId = req.params.userId;  // Getting the userId from the URL parameters
      const { allergies } = req.body; // This could be an array or a single string
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Ensure allergies is always treated as an array
      const newAllergies = Array.isArray(allergies) ? allergies : [allergies];
  
      // Filter out any allergies that already exist in the user's list
      const uniqueAllergies = newAllergies.filter(allergy => !user.allergies.includes(allergy));
  
      if (uniqueAllergies.length === 0) {
        return res.status(400).json({ message: "Allergy already exists" });
      }
  
      // Add the unique allergies to the user's list
      user.allergies.push(...uniqueAllergies);
      await user.save();
  
      return res.status(200).json({
        message: "Allergy added successfully",
        allergies: user.allergies,
      });
    } catch (error) {
      console.error('Error adding allergy:', error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
  getAllergiesweb: async (req, res) => {
    try {
      const userId = req.params.userId;  // Getting the userId from the URL parameters
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      return res.status(200).json(user.allergies);
    } catch (error) {
      console.error('Error retrieving allergies:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  
///---------update allergies--------------------///////////
  updateUserAllergies : async (req, res) => {
    try {
      const { allergies } = req.body;
      const userId = req.user.id;
  
      await User.findByIdAndUpdate(userId, { allergies: allergies });
  
      res.status(200).json({ success: true, message: "Allergies mises à jour avec succès." });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des allergies de l\'utilisateur:', error);
      res.status(500).json({ success: false, message: 'Une erreur s\'est produite lors de la mise à jour des allergies de l\'utilisateur.' });
    }
  },

  AddAllergy: async (req,res) => {
    try {
      const tokenLogin = req.cookies.tokenLogin;
      let decodeTokenLogin = jwt_decode(tokenLogin);
      let idUser = decodeTokenLogin.id;
      const { allergies } = req.body;

      const user = await User.findById(idUser);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      if (user.allergies != undefined && user.allergies.includes(allergies)) {
        return res.status(400).json({ message: "Allergy already exists" });
      }
  
      user.allergies.push(allergies);
      await user.save();
  
      return res.status(200).json({
        message: "Allergy added successfully",
        allergies: user.allergies,
      });
    } catch (error) {
      console.error('Error adding allergy:', error);
      return res.status(500).json({ message: "Internal server error" });
    }


  },
   getAllergies: async (req, res) => {
    try {
      
      const tokenLogin = req.cookies.tokenLogin;
      let decodeTokenLogin = jwt_decode(tokenLogin);
      let idUser = decodeTokenLogin.id;
      
        const user = await User.findById(idUser);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
       
        return res.status(200).send(user.allergies); 
      
    } catch (error) {
        console.error('Error retrieving allergies:', error);
        res.status(500).send({ message: "Internal server error" });
    }
},

deleteAllergy: async (req, res) => {
  try {
    const tokenLogin = req.cookies.tokenLogin; 
    let decodeTokenLogin = jwt_decode(tokenLogin);
    let idUser = decodeTokenLogin.id;

    const { allergy } = req.body; 

    const user = await User.findById(idUser);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await User.findByIdAndUpdate(idUser, {
      $pull: { allergies: allergy }
    }, { new: true }); 
    if (!updatedUser) {
      return res.status(404).json({ message: "Allergy not found or could not be deleted" });
    }

    return res.status(200).json({
      message: "Allergy deleted successfully",
      allergies: updatedUser.allergies
    });
  } catch (error) {
    console.error('Error deleting allergy:', error);
    res.status(500).json({ message: "Internal server error" });
  }
},


  getAllEmployee: async (req, res) => {
    try {
      await User.find({ role: 'employee'})
        .then((data) => {
          res.json(data);
        })
        .catch((error) => {
          res.status(400).json({ message: error });
        });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  },

   getAllResponsable: async (req, res) => {
    try {
      const responsables = await User.find({ role: 'responsable' }).populate('restaurantFK');
      res.json(responsables);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getEmployeeById: async (req, res) => {
    try {
      await User.findById(req.params.id)
        .then((docs) => {
          res.send(docs)
        })
        .catch((err) => {
          res
            .status(400)
            .json({ message: "Employee not found" + "" + err });
        });
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  },
getResponsableById: async (req, res) => {
    try {
      await User.findById(req.params.id)
        .populate('restaurantFK') // Utilisez 'restaurantFK' (le nom du champ défini dans le schéma) pour la méthode .populate()
        .then(async (user) => {
          if (!user) {
            return res.status(404).json({ message: "Responsable not found" });
          }

          // Fetch the associated restaurant's data
          const restaurant = await Restaurant.findById(user.restaurantFK);
          if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found for the employee" });
          }

          // Combine user and restaurant data
          const employeeData = {
            user: user,
            restaurant: restaurant,
          };

          res.send(employeeData);
        })
        .catch((err) => {
          res.status(500).json({ message: "Error fetching Responsable data: " + err });
        });
    } catch (error) {
      res.status(500).json({ message: "Internal server error: " + error });
    }
  },
  getPrivilegeByEmployee: async (req, res) => {
    try {
      const privilege = await Privilege.findOne({ user: req.params.idEmployee });
      if (!privilege) {
        return res.status(404).json({ message: "Employee privilege not found" });
      }

      const truePrivileges = {};
      Object.entries(privilege._doc).forEach(([key, value]) => {
        if (value === true) {
          truePrivileges[key] = value;
        }
      });

      res.send(truePrivileges);
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  },

  updateEmployeeById: async (req, res) => {
    try {
      const idEmployee = req.params.id;
      const { userName, address, phone } = req.body;
      const employee = await User.findById(idEmployee);

      employee.userName = userName || employee.userName;
      employee.address = address || employee.address;
      employee.phone = phone || employee.phone;
      await employee.save();

      return res.status(200).json({ message: "Employee updated" });

    } catch (error) {
      return res.status(500).json({ message: "failed" + "" + error });
    }

  },

  updatePrivilegeEmployeeById: async (req, res) => {
    try {
      const idEmployee = req.params.id;
      const { table_management, print_qr, consulter_historique, traiter_cmd, update_delay_waiting, livrer_cmd,
        paid_cash, consulter_comments, traiter_comments, consulter_help_request, traiter_help_request,
        consulter_historique_help_request, user_management } = req.body;

      const privilege = await Privilege.findOne({ user: idEmployee });
      privilege.table_management = table_management;
      privilege.print_qr = print_qr;
      privilege.consulter_historique = consulter_historique;
      privilege.traiter_cmd = traiter_cmd;
      privilege.update_delay_waiting = update_delay_waiting;
      privilege.livrer_cmd = livrer_cmd;
      privilege.paid_cash = paid_cash;
      privilege.consulter_comments = consulter_comments;
      privilege.consulter_help_request = consulter_help_request;
      privilege.traiter_help_request = traiter_help_request;
      privilege.traiter_comments = traiter_comments;
      privilege.consulter_historique_help_request = consulter_historique_help_request;
      privilege.user_management = user_management;

      await privilege.save();
      return res.status(200).json({ message: "Privilege updated" });

    } catch (error) {
      return res.status(500).json({ message: "failed" + "" + error });
    }

  },

  enableEmployeeAccount: async (req, res) => {
    try {
      const employee = await User.findById(req.params.id);
      employee.activate = 1;
      await employee.save();
      return res.status(200).json({ message: "Employee account enabled" });

    } catch (error) {
      return res.status(500).json({ message: "failed " + error });
    }
  },

  disableEmployeeAccount: async (req, res) => {
    try {
      const employee = await User.findById(req.params.id);
      employee.activate = 0;
      await employee.save();
      return res.status(200).json({ message: "Employee account disabled" });

    } catch (error) {
      return res.status(500).json({ message: "failed " + error });
    }
  },

  deleteById: async (req, res) => {
    try {
      const idEmployee = req.params.id;
      const employee = await User.findByIdAndDelete(idEmployee);
      const privilege = await Privilege.findOne({ user: idEmployee });
      privilege.deleteOne();

      res.status(200).json({ message: "Employee account deleted", data: employee });
    } catch (error) {
      res.status(500).json({ message: "An error occurred", error: error.message });
    }
  },
   consulterReDesenable: async (req, res) => {
    try {
   
      const inactiveResponsibles = await User.find({ activate: false, role: 'responsable' });
     
      res.json(inactiveResponsibles);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
    consulterResenable: async (req, res) => {
    try {
   
      const inactiveResponsibles = await User.find({ activate: true, role: 'responsable' });
     
      res.json(inactiveResponsibles);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
   modifyRestaurant : async (req, res) => {
    try {
      const tokenLogin = req.cookies.tokenLogin;
      let decodeTokenLogin = jwt_decode(tokenLogin);
      let idUser = decodeTokenLogin.id;
      let role = decodeTokenLogin.role;
  
      if (idUser) {
        if (role === "superAdmin") {
          // Extract necessary data from the request
          const { userName, phone, email, nameRes, address, cuisineType, taxeTPS, taxeTUQ, payCashMethod } = req.body;
          const { restaurantId, userId } = req.params; // Assuming you pass restaurantId and userId as parameters
  
          // Implement the modification logic here
  
          // Example of updating the restaurant and user data
          const updatedRestaurant = await Restaurant.findByIdAndUpdate(
            restaurantId,
            {
              nameRes,
              address,
              cuisineType,
              taxeTPS,
              taxeTUQ,
            },
            { new: true } // To get the updated document in the response
          );
  
          const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
              userName,
              phone,
              email,
              payCashMethod,
            },
            { new: true } // To get the updated document in the response
          );
  
          // Return the updated restaurant and user data in the response
          return res.status(200).json({ message: 'Restaurant and User data updated successfully', restaurant: updatedRestaurant, user: updatedUser });
        } else {
          res.status(400).json({ message: "you are not authorized to modify the restaurant and user data" });
        }
      }
    } catch (error) {
      return res.status(500).json({ message: "Failed to update restaurant and user data: " + error.message });
    }
  },
  archieveEmployee : async (req, res) => {
    try {
      const idEmployee = req.params.idEmployee
      const employee = await User.findById(idEmployee);
      employee.statusarchieve = 1;
      employee.activate = 0;
      await employee.save();
      res.status(200).json(employee);

    } catch (error) {
      res.status(500).json({ message: "An error occurred", error: error.message });
    }
  },

  unarchiveEmployee : async (req, res) => {
    try {
      const idEmployee = req.params.idEmployee
      const employee = await User.findById(idEmployee);
      employee.statusarchieve = 0;
      employee.activate = 1;
      await employee.save();
      res.status(200).json(employee);

    } catch (error) {
      res.status(500).json({ message: "An error occurred", error: error.message });
    }
  },

  getEmployeeArhcieved : async (req, res) => {
    try {
      await User.find({ role: 'employee' , statusarchieve: true})
        .then((data) => {
          res.json(data);
        })
        .catch((error) => {
          res.status(400).json({ message: error });
        });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  },
  getEmployee_NotArhcieved : async (req, res) => {
    try {
      await User.find({ role: 'employee' , statusarchieve: false})
        .then((data) => {
          res.json(data);
        })
        .catch((error) => {
          res.status(400).json({ message: error });
        });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  },

  //---------------- superAdmin operations ---------------------------
    addRestaurantsuper: async (req, res) => {
    try {
      const tokenLogin = req.cookies.tokenLogin;
      let decodeTokenLogin = jwt_decode(tokenLogin);
      let idUser = decodeTokenLogin.id;
      let role = decodeTokenLogin.role;

      const pwdRandom = RandomString.generate({ length: 8, charset: "string", });
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(pwdRandom, salt);

      if (idUser) {
        if (role === "superAdmin") {
          const {  userName, phone, email, nameRes, address, cuisineType, taxeTPS, taxeTUQ, payCashMethod } = req.body;

          if (!userName ||  !email || !phone || !nameRes || !address || !cuisineType || !taxeTPS || !taxeTUQ) {
            return res
              .status(400)
              .json({ message: "Not all fields have been entered" });
          }
          User.findOne({ email }).then(async (user) => {
            if (user) {
              return res.status(400).json({ error: "Email is already taken" });
            }
            else {
            
               const credentials = {email : email , password : pwdRandom}
              sendCredentialss.sendCredentials(credentials, res)

              // Créer un nouvel utilisateur
              const newUser = new User({
              
                userName,
                phone,
                email,
                password: passwordHash,
                role: 'responsable',
                activate: 1,
                firstLogin: 0,
                payCashMethod: payCashMethod,
                restaurantFK: null,
                
               
              });

              const newRestaurant = new Restaurant({
                owner: newUser.id,
                nameRes,
                address,
                cuisineType,
                taxeTPS,
                taxeTUQ,
                color: '',
                logo: '',
                promotion: '',
                images: '',
              })
              const newPrivilege = new Privilege({
                user_management :'true',
                table_management :'true',
                print_qr :'true',
                consulter_historique :'true',
                traiter_cmd :'true',
                update_delay_waiting:'true',
                livrer_cmd:'true',
                paid_cash:'true',
                consulter_comments:'true',
                traiter_comments:'true',
                consulter_help_request:'true',
                consulter_historique_help_request:'true',
                traiter_help_request:'true',
                user: newUser
              })
              newUser.restaurantFK = newRestaurant._id;
              // Enregistrer le compte dans la base de données
              await newUser.save();
              await  newRestaurant.save();
              await  newPrivilege.save();
              console.log('Restaurant account created');

              // Maintenant, peuplez le document utilisateur avec les données du restaurant
const utilisateurPeuple = await User.findOne({ _id: newUser._id }).populate('restaurantFK');

// Retournez l'objet utilisateur peuplé dans la réponse
return res.status(200).json({ message: 'Un e-mail a été envoyé', user: utilisateurPeuple });
              
            }
            

          });


        }
        else {
          res.status(400)
            .json({ message: "you are not authorized to add a new account" })
        }
      }

    }
    
    catch (error) {
      return res.status(500).json({ message: "Register failed" + "" + error.message });
    }
  },
  addRestaurant: async (req, res) => {
    try {
      const tokenLogin = req.cookies.tokenLogin;
      let decodeTokenLogin = jwt_decode(tokenLogin);
      let idUser = decodeTokenLogin.id;
      let role = decodeTokenLogin.role;

      const pwdRandom = RandomString.generate({ length: 8, charset: "string", });
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(pwdRandom, salt);

      if (idUser) {
        if (role === "superAdmin") {
          const { firstName, lastName, phone, email, nameRes, address, cuisineType, taxeTPS, taxeTUQ, payCashMethod } = req.body;

          if (!firstName || !lastName || !email || !phone || !nameRes || !address || !cuisineType || !taxeTPS || !taxeTUQ) {
            return res
              .status(400)
              .json({ message: "Not all fields have been entered" });
          }
          User.findOne({ email }).then((user) => {
            if (user) {
              return res.status(400).json({ error: "Email is already taken" });
            }
            else {
              const options = {
                from: "menu.comapp@gmail.com",
                to: email,
                subject: "Account credientials",
                html: `
                 <div style = "max-width: 700px;
                       margin: 0 auto;
                       background-color: #fff;
                       box-shadow: 0px 0px 10px rgba(0,0,0,0.1);
                       border-radius: 5px;
                       border: 5px solid #ddd;padding: 50px 20px; font-size: 110%;"
                 >
                 
                 <h2 style="font-size: 18px; margin-bottom: 20px; text-align: center; text-align: center; color: #FA8072"> Welcome to Menu</h1>
                 
                 <p style="margin-top: 0; margin-bottom: 15;">This is your work account credentials to signIn in Menu application</p>
                 <a> Your email : ${email}</a>
                 <br>
                 <a> Your tomporary password : ${pwdRandom}</a>
                 <p>Ordear Team</p>
                 </div>
                  
                  `,
              };
              transporter.sendMail(options, function (err, info) {
                if (err) {
                  return res.status(400).json({ error: "Error activating account" + err });
                } else { return res.status(200).json({ message: "An email has been sent" }); }
              });

              const newUser = new User({
                userName,
                phone,
                email,
                password: passwordHash,
                role: 'responsable',
                activate: 1,
                firstLogin: 0,
                payCashMethod: payCashMethod,
              });

              const newRestaurant = new Restaurant({
                owner: newUser.id,
                nameRes,
                address,
                cuisineType,
                taxeTPS,
                color: '',
                logo: '',
                promotion: '',
                images: '',
                taxeTVQ,
              })

              newUser.save();
              newRestaurant.save();
            }

          });


        }
        else {
          res.status(400)
            .json({ message: "you are not authorized to add a new account" })
        }
      }

    }
    catch (error) {
      return res.status(500).json({ message: "Register failed" + "" + error.message });
    }
  },

  getListRestaurant: async (req, res) => {
    try {
      const tokenLogin = req.cookies.tokenLogin;
      let decodeTokenLogin = jwt_decode(tokenLogin);
      let role = decodeTokenLogin.role;

      if (role === "superAdmin" ) {
        Restaurant.find()
          .then((docs) => {
            res.send(docs)
          })
          .catch((err) => {
            res
              .status(400)
              .json({ message: "Invalid" + "" + err });
          });
      }
    } catch (err) {
      return res.status(500).json({ message: "Something wrong" + "" + err.message });
    }
  },

  // --------------- Responsable operations ----------------------
  getRestaurant: async (req, res) => {
    try {
      const tokenLogin = req.cookies.tokenLogin;
      let decodeTokenLogin = jwt_decode(tokenLogin);
      let idUser = decodeTokenLogin.id;
      let role = decodeTokenLogin.role;

      if (role === "responsable") {
        const ObjectId = mongoose.Types.ObjectId;
        const ownerId = new ObjectId(idUser);

        Restaurant.findOne({ owner: ownerId })
          .then((restaurant) => {
            if (restaurant) {
              res.send(restaurant);
            } else {
              res.status(404).json({ message: 'Restaurant not found' });
            }
          })
          .catch((err) => {
            res.status(500).json({ message: "Something went wrong" });
          });
      } else {
        res.status(401).json({ message: 'Unauthorized' });
      }
    } catch (err) {
      res.status(500).json({ message: "Something went wrong" });
    }
  },

  updateRestaurant: async (req, res) => {
    try {
      const tokenLogin = req.cookies.tokenLogin;
      let decodeTokenLogin = jwt_decode(tokenLogin);
      let idUser = decodeTokenLogin.id;
      let role = decodeTokenLogin.role;

      if (role === "responsable") {
        const ObjectId = mongoose.Types.ObjectId;
        const ownerId = new ObjectId(idUser);

        Restaurant.updateOne(
          { owner: ownerId },
          {
            $set: {
              "nameRes": req.body.nameRes, "address": req.body.address, "cuisineType": req.body.cuisineType,
              "taxeTPS": req.body.taxeTPS, 'taxeTUQ': req.body.taxeTUQ, 'color': req.body.color,
              "promotion": req.body.promotion
            }
          }
        )
          .then((restaurant) => {
            if (restaurant) {
              User.updateOne(
                { "_id": ownerId },
                {
                  $set: {
                    "firstName": req.body.firstName,
                    "lastName": req.body.lastName,
                    "phone": req.body.phone,
                  }
                }
              ).then(() => {
                res.status(201).json({ message: 'Restaurant and User updated' })
              }).catch(() => {
                res.status(500).json({ message: "User not updated" });
              });
            } else {
              res.status(404).json({ message: 'Restaurant not found' });
            }
          })
          .catch((err) => {
            res.status(500).json({ message: "Something went wrong" });
          });


      } else {
        res.status(401).json({ message: 'Unauthorized to do this operation' });
      }
    } catch (err) {
      res.status(500).json({ message: "Something went wrong" });
    }
  },

  // -------------- other users operations (MOBILE)-----------------------
  getUser: async (req, res) => {
    try {
     
      const tokenLogin = req.cookies.tokenLogin;
      let decodeTokenLogin = jwt_decode(tokenLogin);
      let idUser = decodeTokenLogin.id;
      if (!idUser) {
        return res.status(400).json({ message: "Invalid token" });
      }
  
      User.find({ "_id": idUser })
        .then((docs) => {
          res.send(docs);
        })
        .catch((err) => {
          res.status(400).json({ message: "Error finding user: " + err });
        });
    } catch (err) {
      return res.status(500).json({ message: "Something went wrong: " + err.message });
    }
  },



  updateUserRES: async (req, res) => {
    try {
      const userId = req.params.userId;
  
      // Update user information
      const userUpdate = {
        "userName": req.body.userName,
        "email": req.body.email,
        "address": req.body.address,
        "phone": req.body.phone
      };
  
      if (req.file) {
        // Update the image if a new image is uploaded
        userUpdate.image = req.file.filename;
      }
  
      await User.updateOne(
        { "_id": userId },
        { $set: userUpdate }
      );
  
      // Update restaurant information
      await Restaurant.updateOne(
        { "owner": userId },
        {
          $set: {
            "nameRes": req.body.nameRes,
            "address": req.body.address,
            "cuisineType": req.body.cuisineType,
            "taxeTPS": req.body.taxeTPS,
            "taxeTVQ": req.body.taxeTVQ
          }
        }
      );
  
      res.json({ message: "Updated user and restaurant information." });
    } catch (err) {
      return res.status(500).json({ message: "Something went wrong: " + err.message });
    }
  },
  
  updateUser: async (req, res) => {
    try {
      const tokenProfile = req.cookies.tokenLogin;
      let decodeTokenLogin = jwt_decode(tokenProfile);
      let idUser = decodeTokenLogin.id;

      User.updateOne(
        { "_id": idUser },
        { $set: { "firstName": req.body.firstName, "lastName": req.body.lastName, "address": req.body.address, "birthday": req.body.birthday, "phone": req.body.phone, 'activate': req.body.activate } }

      ).then(() => {
        res.json({ message: "updated" });
      })
        .catch(() => {
          res.json({ message: "not updated" });
        });

    } catch (err) {
      return res.status(500).json({ message: "Something wrong" + "" + err.message });
    }

  },




   updatePasswordweb: async (req, res) => {
    try {
      const idUser = req.params.id; // Get user ID from URL parameters
  
      const { oldPassword, password, confirmPassword } = req.body;
  
      if (!oldPassword || !password || !confirmPassword) {
        return res.status(400).json({ message: "Password fields are empty" });
      }
  
      const user = await User.findById(idUser);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const isPasswordMatched = bcrypt.compareSync(oldPassword, user.password);
      if (!isPasswordMatched) {
        return res.status(400).json({ error: "Old password is incorrect" });
      }
  
      if (password !== confirmPassword) {
        return res.status(400).json({ error: "Mismatch password" });
      }
  
      const isSamePassword = bcrypt.compareSync(password, user.password);
      if (isSamePassword) {
        return res.status(400).json({ message: "New password must be different than the current one" });
      }
  
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);
  
      await User.findByIdAndUpdate(idUser, { password: hashedPassword });
      return res.status(200).json({ message: 'Password updated' });
    } catch (err) {
      console.error("Error updating password:", err);
      return res.status(500).json({ message: "Password has not been updated" });
    }
  },
   updateUserweb : async (req, res) => {
    try {
      const idUser = req.params.id; // Get user ID from URL parameters
  
      User.updateOne(
        { "_id": idUser },
        { $set: { "firstName": req.body.firstName, "lastName": req.body.lastName, "address": req.body.address, "birthday": req.body.birthday, "phone": req.body.phone, 'activate': req.body.activate } }
      )
      .then(() => {
        res.json({ message: "updated" });
      })
      .catch(() => {
        res.json({ message: "not updated" });
      });
    } catch (err) {
      return res.status(500).json({ message: "Something wrong" + "" + err.message });
    }
  },
  
  updateUserAdmin: async (req, res) => {
    try {
      const userId = req.params.userId;
  
      // Update user information
      const userUpdate = {
        "userName": req.body.userName,
        "email": req.body.email,
        "address": req.body.address,
        "phone": req.body.phone
      };
  
      if (req.file) {
        // Update the image if a new image is uploaded
        userUpdate.image = req.file.filename;
      }
  
      await User.updateOne(
        { "_id": userId },
        { $set: userUpdate }
      );
  
   
  
      res.json({ message: "Updated user ADMIN." });
    } catch (err) {
      return res.status(500).json({ message: "Something went wrong: " + err.message });
    }
  },
  // updatePassword: async (req, res) => {
  //   try {
  //     const tokenProfile = req.cookies.tokenLogin;
  //     let decodeTokenLogin = jwt_decode(tokenProfile);
  //     let idUser = decodeTokenLogin.id;

  //     const confirmPwd = req.body.confirmPassword;
  //     const newPass = req.body.password;

  //     if (!newPass || !confirmPwd) {
  //       return res
  //         .status(400)
  //         .json({ message: "Password field is empty" });
  //     }
  //     if (newPass != confirmPwd) {
  //       return res.status(400).json({ error: "Mismatch password" });
  //     }
  //     const user = await User.findById(idUser);
  //     const isPasswordMatched = bcrypt.compareSync(newPass, user.password);

  //     if (isPasswordMatched) {
  //       return res.status(400).json({ message: "New password must be different than the current one" });
  //     }
  //     let salt = bcrypt.genSaltSync(10);
  //     User.updateOne(
  //       { "_id": idUser },
  //       { $set: { "password": bcrypt.hashSync(newPass, salt) }, }
  //     )
  //       .then((obj) => {
  //         return res
  //           .status(200)
  //           .json({ message: 'Password updated' });
  //       })
  //       .catch((err) => {
  //         res.json({ message: "Password has not been updated" } + "" + err)
  //       })
  //   } catch (err) {
  //     return res.status(500).json({ message: "Password has not been updated" + err.message });
  //   }
  // },


  updatePassword: async (req, res) => {
    try {
     
      const tokenProfile = req.cookies.tokenLogin;
      const decodeTokenLogin = jwt_decode(tokenProfile);
      const idUser = decodeTokenLogin.id;
  
    
      const { oldPassword, password, confirmPassword } = req.body;
  
      
      if (!oldPassword || !password || !confirmPassword) {
        return res.status(400).json({ message: "Password fields are empty" });
      }
  
      
      const user = await User.findById(idUser);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
     
      const isPasswordMatched = bcrypt.compareSync(oldPassword, user.password);
      if (!isPasswordMatched) {
        return res.status(400).json({ error: "Old password is incorrect" });
      }
  
     
      if (password !== confirmPassword) {
        return res.status(400).json({ error: "Mismatch password" });
      }
  
      
      const isSamePassword = bcrypt.compareSync(password, user.password);
      if (isSamePassword) {
        return res.status(400).json({ message: "New password must be different than the current one" });
      }
  
      
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);
  
      
      await User.findByIdAndUpdate(idUser, { password: hashedPassword });
      return res.status(200).json({ message: 'Password updated' });
    } catch (err) {
      console.error("Error updating password:", err);
      return res.status(500).json({ message: "Password has not been updated" });
    }
},

// Update password and activate account if necessary
updatePasswordfr: async (req, res) => {
  try {
      const tokenProfile = req.cookies.tokenLogin;
      const decodeTokenLogin = jwt_decode(tokenProfile);
      const idUser = decodeTokenLogin.id;

      const { oldPassword, password, confirmPassword } = req.body;

      if (!oldPassword || !password || !confirmPassword) {
          return res.status(400).json({ message: "Password fields are empty" });
      }

      const user = await User.findById(idUser);
      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      const isPasswordMatched = bcrypt.compareSync(oldPassword, user.password);
      if (!isPasswordMatched) {
          return res.status(400).json({ error: "Old password is incorrect" });
      }

      if (password !== confirmPassword) {
          return res.status(400).json({ error: "Mismatch password" });
      }

      const isSamePassword = bcrypt.compareSync(password, user.password);
      if (isSamePassword) {
          return res.status(400).json({ message: "New password must be different than the current one" });
      }

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

      // Check if account needs activation
      let firstlogin = user.firstLogin; // Get current activation status
      if (firstlogin) {
          // If account is not activated, set activate to true
          firstlogin = false;
      }

      // Update password and activation status
      await User.findByIdAndUpdate(idUser, { password: hashedPassword, firstLogin: false });

      return res.status(200).json({ message: 'Password updated' });
  } catch (err) {
      console.error("Error updating password:", err);
      return res.status(500).json({ message: "Password has not been updated" });
  }
},
updatePasswordRe: async (req, res) => {
  try {
      const tokenProfile = req.cookies.tokenLogin;
      const decodeTokenLogin = jwt_decode(tokenProfile);
      const idUser = decodeTokenLogin.id;

      const { oldPassword, password, confirmPassword } = req.body;

      if (!oldPassword || !password || !confirmPassword) {
          return res.status(400).json({ message: "Password fields are empty" });
      }

      const user = await User.findById(idUser);
      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      const isPasswordMatched = bcrypt.compareSync(oldPassword, user.password);
      if (!isPasswordMatched) {
          return res.status(400).json({ error: "Old password is incorrect" });
      }

      if (password !== confirmPassword) {
          return res.status(400).json({ error: "Mismatch password" });
      }

      const isSamePassword = bcrypt.compareSync(password, user.password);
      if (isSamePassword) {
          return res.status(400).json({ message: "New password must be different than the current one" });
      }

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

      // Check if account needs activation
      let firstlogin = user.firstLogin; // Get current activation status
      if (firstlogin) {
          // If account is not activated, set activate to true
          firstlogin = false;
      }

      // Update password and activation status
      await User.findByIdAndUpdate(idUser, { password: hashedPassword, firstLogin: false });

      return res.status(200).json({ message: 'Password updated' });
  } catch (err) {
      console.error("Error updating password:", err);
      return res.status(500).json({ message: "Password has not been updated" });
  }
},
  checkOldPassword : async (req, res) => {
    try {
      const tokenLogin = req.cookies.tokenLogin; // Get the token from cookies (make sure you have the necessary middleware to parse cookies)
      const { oldPassword } = req.body; // Get the old password from the request body
  
      let decodeTokenLogin = jwt_decode(tokenLogin);
      let idUser = decodeTokenLogin.id;
  
      
      const user = await User.findById(idUser);
  
      
      const isPasswordMatched = await bcrypt.compare(oldPassword, user.password);
 
      if (isPasswordMatched) {
        return res.json({ success: true, message: 'Old password is correct.' });
      } else {
        return res.json({ success: false, message: 'Old password is incorrect.' });
      }
    } catch (error) {
      console.error('Error checking old password:', error);
      return res.status(500).json({ success: false, message: 'An error occurred while checking the old password.' });
    }
  },

  sendSMS: async (req, res) => {

    const tokenLogin = req.cookies.tokenLogin;
    let decodeTokenLogin = jwt_decode(tokenLogin);
    let idUser = decodeTokenLogin.id;

    const phoneNumber = req.body.phoneNumber;

    const activationCode = RandomString.generate({
      length: 4,
      charset: "numeric",
    });
    if (idUser) {

      function sendSMS(to, message) {

        clientMobile.messages
          .create({
            body: message,
            from: '+14242964999',
            to: phoneNumber,
          })
      }
      sendSMS('+14242964999', 'This is your code verification : ' + activationCode);

    }
    const tokenSend = jwt.sign(
      { idUser, phoneNumber, activationCode },
      `${process.env.JWT_ACC_ACTIVATE}`,
      { expiresIn: "3m" }
    );

    res.cookie("tokenSend", tokenSend, { expiresIn: "3m" , overwrite : true});
    res.json(tokenSend);

  },

  resend: async (req, res) => {
    const tokenSend = req.cookies.tokenSend;
    const decodedToken = jwt.verify(tokenSend, process.env.JWT_ACC_ACTIVATE)
    let phoneNb = decodedToken.phoneNumber;
    let id = decodedToken.idUser;

    const activationCodeResend = RandomString.generate({
      length: 4,
      charset: "numeric",
    });

    function sendSMS(to, message) {

      clientMobile.messages
        .create({
          body: message,
          from: '+14242964999',
          to: phoneNb,
        })
    }
    sendSMS('+14242964999', 'This is your code verification : ' + activationCodeResend);

    const tokenResend = jwt.sign(
      { id, phoneNb, activationCodeResend },
      `${process.env.JWT_ACC_ACTIVATE}`,
      { expiresIn: "3m" }
    );

    res.cookie("tokenResend", tokenResend, { expiresIn: "3m" , overwrite : true });
    res.json(tokenResend);

  },

  updatePhone: async (req, res) => {
    try {
      const codeActivation = req.body.code;
 
      const tokenSend = req.cookies.tokenSend;
      const tokenResend = req.cookies.tokenResend;
 
      if (!codeActivation) {
        return res.status(400).json({ message: 'Activation code must be provided' });
      }
 
      if (!tokenSend && !tokenResend) {
        return res.status(400).json({ message: 'JWT token must be provided' });
      }
 
      let decodedToken;
      if (tokenSend) {
        decodedToken = jwt.verify(tokenSend, process.env.JWT_ACC_ACTIVATE);
      } else {
        decodedToken = jwt.verify(tokenResend, process.env.JWT_ACC_ACTIVATE);
      }
 
      const { activationCode, phoneNumber, idUser, phoneNb, id } = decodedToken;
 
      if (codeActivation !== activationCode) {
        return res.status(400).json({ message: 'Invalid activation code' });
      }
 
      if (idUser) {
        await User.updateOne({ "_id": idUser }, { $set: { "phone": phoneNumber, "phoneVerified":true } });
      } else {
        await User.updateOne({ "_id": id }, { $set: { "phone": phoneNb } });
        res.clearCookie('tokenSend');
      }
 
      return res.status(200).json({ message: 'Phone number updated' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to update phone number' });
    }
  },
  updateImage: async (req, res) => {
    try {
      const tokenLogin = req.cookies.tokenLogin;
      let decodeTokenLogin = jwt_decode(tokenLogin);
      let idUser = decodeTokenLogin.id;
      
      const img = req?.file?.filename ;
      console.dir(img)

      if (idUser) {
        User.updateOne(
          { "_id": idUser },
          { $set: { "image": img || "hello" } }

        ).then(() => {
          res.json({ message: "Image updated" });
        })
          .catch(() => {
            res.json({ message: "Image not updated" });
          });
      }
    } catch (err) {
      return res.status(500).json({ message: "Something wrong " + err.message });
    }
  },
  updateImageweb: async (req, res) => {
    try {
        const userId = req.params.userId;
        const img = req.file ? req.file.filename : null;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        if (!img) {
            return res.status(400).json({ message: "Image file is required" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.image = img;
        await user.save();

        res.json({ message: "Image updated", imageUrl: `/uploads/user/${img}` });
    } catch (err) {
        return res.status(500).json({ message: "Something went wrong: " + err.message });
    }
},
  getImageByUserId: async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const user = await User.findById(userId);

        if (!user || !user.image) {
            return res.status(404).json({ message: "Image not found" });
        }

        const imagePath = path.join(__dirname, '..', 'uploads', 'user', user.image);
        res.sendFile(imagePath);
    } catch (err) {
        return res.status(500).json({ message: "Something went wrong: " + err.message });
    }
},
  

  getImage: async (req, res) => {
    try {
      const tokenLogin = req.cookies.tokenLogin;
      let decodeTokenLogin = jwt.verify(tokenLogin, process.env.JWT_SECRET);
      let idUser = decodeTokenLogin.id;

      const user = await User.findById(idUser);

      if (!user || !user.image) {
        return res.status(404).json({ message: "Image not found" });
      }
      const imagePath = path.join(__dirname, '..', 'uploads', 'user', user.image);
    
       res.sendFile(imagePath)
    } catch (err) {
      return res.status(500).json({ message: "Something wrong " + err.message });
    }


  },
  desactivateUser: async (req, res) => {
    const tokenLogin = req.cookies.tokenLogin;
    let decodeTokenLogin = jwt_decode(tokenLogin);
    let role = decodeTokenLogin.role;

    if (role == "superAdmin" || role == "responsable") {
      User.findOne({ 'role': 'employee' }).then((user) => { 
        if (!user) {
          return res.status(400).json({ error: "No accounts under the role that you are applying for" });
        }
        else {
          User.updateOne(
            { "_id": user._id },
            { $set: { "activate": 0 } }
          )
            .then(() => {
              return res
                .status(200)
                .json({ message: 'User desactivated' });
            })
            .catch((err) => {
              return res
                .status(400)
                .json({ message: 'Error' + ' ' + err });
            })
        }
      });
    }


  },

  getCitiesByCountry: async (req, res) => {
    const citiesByCountry = {};
    for (let i = 0; i < countries.length; i++) {

      const country = countries[i];
      const countryName = country.en;
      citiesByCountry[countryName] = [];

      for (let j = 0; j < subdivisions.length; j++) {
        const subdivision = subdivisions[j];

        if (country.alpha2.toLowerCase() === subdivision.country.toLowerCase()) {
          citiesByCountry[countryName].push({ "city": subdivision.name });

        }

      }
    }
    res.json(citiesByCountry);
  },
  
  findAll: async (req, res, next) => {
    User.find()
      .then(users => {
        res.setHeader('Cache-Control', 'no-cache, no-store');
        res.setHeader('Expires', '0');
        res.status(200).send(users);
      })
      .catch(err => res.status(500).send({ message: 'Error retrieving users' }));
  },
   
  

//super admin :
findAllUsers: async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
},


editUser: async (req, res) => {
  try {
    const { id } = req.params; // User id passed in URL
    const updates = req.body; // The updated user data

    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
},

archiveUser: async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const archivedUser = new UserArchive({
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      image: user.image,
      address: user.address,
      phone: user.phone,
      email: user.email,
      role: user.role,
    });

    await archivedUser.save();

    // Remove the user from the User collection
    await User.findByIdAndDelete(id);

    res.json({ message: 'User archived successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
},
unarchiveUser: async (req, res) => {
  try {
    const { id } = req.params;

    const archivedUser = await UserArchive.findById(id);

    if (!archivedUser) {
      return res.status(404).json({ message: 'Archived user not found' });
    }

    const newUser = new User({
      firstName: archivedUser.firstName,
      lastName: archivedUser.lastName,
      userName: archivedUser.userName,
      image: archivedUser.image,
      address: archivedUser.address,
      phone: archivedUser.phone,
      email: archivedUser.email,
      role: archivedUser.role,
    });

    await newUser.save();

 
    await UserArchive.findByIdAndDelete(id);

    res.json({ message: 'User unarchived successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
},
changeActiveStatus : async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.activate = !user.activate;
    await user.save();

    res.json({ message: 'Archive status changed successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
},
getArchivedUsers: async (req, res) => {
  try {
    const archivedUsers = await UserArchive.find({});
    res.json(archivedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
},





//---------------- Responsable operations ---------------------------
addEmployee: async (req, res) => {
  try {

  const tokenLogin = req.get('Authorization').split(' ')[1];
  let decodeTokenLogin = jwt_decode(tokenLogin);
  let idUser = decodeTokenLogin.id;
  let role = decodeTokenLogin.role;


    if (idUser) {
      if (role == "superAdmin" || role == "responsable") {
        const { userName, email, phone, address, restaurantFK } = req.body;

        const { table_management, print_qr, consulter_historique, traiter_cmd, update_delay_waiting, livrer_cmd,
          paid_cash, consulter_comments, traiter_comments, consulter_help_request, traiter_help_request,
          consulter_historique_help_request, user_management } = req.body

        if (!userName || !email || !phone || !address) {
          return res
            .status(400)
            .json({ message: "Not all fields have been entered" });
        }
        const existingUser = await Employee.findOne({ email });

        if (existingUser) {
          return res.status(400).json({ error: "Email is already taken" });
        }
        const pwdRandom = RandomString.generate({ length: 8, charset: "string", });
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(pwdRandom, salt);

        const credentials = {email : email , password : pwdRandom}
        sendCredentials.sendCredentials(credentials, res)
        const newEmployee = new Employee({
          userName,
          email,
          password: passwordHash,
          image:'https://cdn-icons-png.flaticon.com/128/219/219970.png',
          phone,
          address,
          role: 'employee',
          activate: 1,
          firstLogin: 0,
          statusarchieve:0,
       //   restaurantFK: restaurantFK,
          owner:idUser
        });

        const newPrivilege = new Privilege({
          user_management: 0 ,
          table_management,
          print_qr,
          consulter_historique,
          traiter_cmd,
          update_delay_waiting,
          livrer_cmd,
          paid_cash,
          consulter_comments,
          traiter_comments,
          consulter_help_request,
          consulter_historique_help_request,
          traiter_help_request,
          user: newEmployee
        })
        const savedEmplyee = await newEmployee.save();
        const savedPrivilege = await newPrivilege.save();
        return res.status(200).json({ success: true, message: "Employee added successfully" });

      }
    }
  }
  catch (error) {
    console.log(error);
  }
},
getEmployeePagination : async (req, res, next) => {
  try {

    const tokenLogin = req.get('Authorization').split(' ')[1];
    let decodeTokenLogin = jwt_decode(tokenLogin);
    let idUser = decodeTokenLogin.id;

    
    const page = parseInt(req.query.page) || 1;
    const limit = 6; 
    const skip = (page - 1) * limit;
    const searchQuery = req.query.search || ''; 

    let query = { statusarchieve: false }; 
    query.owner = idUser; 
    if (searchQuery) {
      query.userName = { $regex: new RegExp(searchQuery, 'i') };
    }

    const employees = await Employee.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Employee.countDocuments(query);

    res.json({ employees, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
},


getEmployeeArchiverPagination: async (req, res, next) => {
  try {
    const tokenLogin = req.get('Authorization').split(' ')[1];
    let decodeTokenLogin = jwt_decode(tokenLogin);
    let idUser = decodeTokenLogin.id;

    const page = parseInt(req.query.page) || 1;
    const limit = 6; 
    const skip = (page - 1) * limit;
    const searchQuery = req.query.search || ''; 

    let query = { statusarchieve: true }; 
    query.owner = idUser; 
    if (searchQuery) {
      query.userName = { $regex: new RegExp(searchQuery, 'i') };
    }

    const employees = await Employee.find(query).skip(skip).limit(limit);
    const total = await Employee.countDocuments(query);

    res.json({ employees, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
},



archiveEmployeById: async (req, res) => {
  try {
    const idEmployee = req.params.id;
    const employee = await User.findById(idEmployee);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    employee.statusarchieve = !employee.statusarchieve;
    await employee.save();

    const message = employee.statusarchieve
      ? "Employee account archived"
      : "Employee account unarchived";

    res.status(200).json({ message, data: employee });
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error: error.message });
  }
},
updateUserR: async (req, res) => {
  try {
    const tokenLogin = req.get('Authorization').split(' ')[1];
    let decodeTokenLogin = jwt_decode(tokenLogin);
    let idUser = decodeTokenLogin.id;

    User.updateOne(
      { "_id": idUser },
      { $set: { "firstName": req.body.firstName, "lastName": req.body.lastName, "address": req.body.address, "birthday": req.body.birthday, "phone": req.body.phone, 'activate': req.body.activate } }

    ).then(() => {
      res.json({ message: "updated" });
    })
      .catch(() => {
        res.json({ message: "not updated" });
      });

  } catch (err) {
    return res.status(500).json({ message: "Something wrong" + "" + err.message });
  }

},
 sendSMSWeb : async (req, res) => {
  try {
    const { userId } = req.params;  // Extraction de l'ID utilisateur depuis les paramètres de l'URL
    const { phoneNumber } = req.body;  // Extraction du numéro de téléphone depuis le corps de la requête

    // Validation de l'entrée du numéro de téléphone
    if (!phoneNumber) {
      return res.status(400).json({ message: 'Numéro de téléphone manquant.' });
    }

    // Recherche de l'utilisateur par ID pour s'assurer qu'il existe avant d'envoyer un SMS
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    // Génération d'un code d'activation numérique aléatoire
    const activationCode = RandomString.generate({
      length: 4,
      charset: "numeric",
    });

    // Mise à jour du code de vérification dans la base de données de l'utilisateur
    user.verificationCode = activationCode;
    await user.save();

    try {
      // Tentative d'envoi du SMS
      await sendSMS(phoneNumber, `This is your verification code: ${activationCode}`);
      res.json({ message: 'SMS sent successfully with activation code.', code: activationCode });  // Optionally return the code in response for testing
    } catch (smsError) {
      console.error('Error sending SMS:', smsError);
      return res.status(500).json({ message: 'Failed to send SMS.' });
    }
  } catch (error) {
    console.error('Error in sendSMSWeb:', error);
    res.status(500).json({ message: 'Failed to process request.' });
  }
},


resendWeb: async (req, res) => {
  const tokenSend = req.cookies.tokenSend;
  const decodedToken = jwt.verify(tokenSend, process.env.JWT_ACC_ACTIVATE)
  let phoneNb = decodedToken.phoneNumber;
  let id = decodedToken.idUser;

  const activationCodeResend = RandomString.generate({
    length: 4,
    charset: "numeric",
  });

  function sendSMS(to, message) {

    client.messages
      .create({
        body: message,
        from: '+12517584922',
        to: phoneNb,
      })
  }
  sendSMS('+12517584922', 'This is your code verification : ' + activationCodeResend);

  const tokenResend = jwt.sign(
    { id, phoneNb, activationCodeResend },
    `${process.env.JWT_ACC_ACTIVATE}`,
    { expiresIn: "3m" }
  );

  res.cookie("tokenResend", tokenResend, { expiresIn: "3m" , overwrite : true });
  res.json(tokenResend);

},
// Fonction pour vérifier le code de vérification
verifyCodeWeb: async (req, res) => {
  try {
    const { verificationCode } = req.body; // Récupération du code de vérification du corps de la requête
    const { userId } = req.params; // Récupération de l'ID utilisateur depuis les paramètres de l'URL

    // Assurez-vous que l'ID utilisateur et le code de vérification sont fournis
    if (!userId || !verificationCode) {
      return res.status(400).json({ error: "L'ID utilisateur et le code de vérification sont requis." });
    }

    console.log(`Tentative de vérification pour l'utilisateur ${userId} avec le code ${verificationCode}`);

    // Recherche de l'utilisateur dans la base de données
    const user = await User.findById(userId);
    if (!user) {
      console.log('Utilisateur non trouvé dans la base de données');
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    console.log(`Code attendu: ${user.verificationCode}, Code reçu: ${verificationCode}`);

    // Comparaison du code de vérification reçu avec celui enregistré
    if (user.verificationCode && user.verificationCode === verificationCode) {
      user.isVerified = true; // Mise à jour du statut de vérification
      await user.save(); // Sauvegarde des modifications dans la base de données
      console.log('Vérification réussie');
      return res.status(200).json({ message: "Votre numéro de téléphone a été mis à jour avec succès !" });
    } else {
      console.log('Échec de la vérification');
      return res.status(400).json({ error: "Code de vérification invalide." });
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du code:', error);
    return res.status(500).json({ message: "Une erreur s'est produite lors de la vérification du code de vérification." });
  }
},

updatePhoneWeb: async (req, res) => {
  try {
    const { userId } = req.params; // Retrieval of the user ID from the URL parameters
    const { codeActivation, phoneNumber } = req.body; // Retrieve activation code and phone number from the request body

    if (!codeActivation) {
      return res.status(400).json({ message: 'Activation code must be provided' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (codeActivation !== user.verificationCode) {
      return res.status(400).json({ message: 'Invalid activation code' });
    }

    user.phone = phoneNumber;
    await user.save();

    return res.status(200).json({ message: 'Phone number updated successfully' });
  } catch (error) {
    console.error('Error in updatePhoneWeb:', error);
    return res.status(500).json({ message: 'Failed to update phone number' });
  }
},


updatePasswordWeb: async (req, res) => {
  try {
    const { userId } = req.params;  // Récupération de l'ID de l'utilisateur depuis l'URL
    const { oldPassword, password, confirmPassword } = req.body;

    if (!oldPassword || !password || !confirmPassword) {
      return res.status(400).json({ message: "Les champs de mot de passe sont vides" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const isPasswordMatched = bcrypt.compareSync(oldPassword, user.password);
    if (!isPasswordMatched) {
      return res.status(400).json({ error: "L'ancien mot de passe est incorrect" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Les mots de passe ne correspondent pas" });
    }

    const isSamePassword = bcrypt.compareSync(password, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: "Le nouveau mot de passe doit être différent de l'actuel" });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    await User.findByIdAndUpdate(userId, { password: hashedPassword });
    return res.status(200).json({ message: 'Mot de passe mis à jour' });
  } catch (err) {
    console.error("Erreur lors de la mise à jour du mot de passe:", err);
    return res.status(500).json({ message: "Le mot de passe n'a pas été mis à jour" });
  }
},
getUserById: async (req, res) => {
  try {
    await User.findById(req.params.id)
      .then((docs) => {
        res.send(docs)
      })
      .catch((err) => {
        res
          .status(400)
          .json({ message: "user not found" + "" + err });
      });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
},

};


module.exports = userController;