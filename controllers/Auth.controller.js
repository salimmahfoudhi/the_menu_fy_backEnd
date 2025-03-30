const jwt_decode = require("jwt-decode");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const RandomString = require("randomstring");
const FacebookStrategy = require('passport-facebook').Strategy;
const passport = require('passport');
const User = require('../models/user.model');
const send = require('../utils/config/EmailInscription')
const sendF = require('../utils/config/ForgotPwdConfig');
const rsendF = require('../utils/config/ResendPwdCode');

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URI,
      profileFields: ["email", "name"]
    },
    async (accessToken, refreshToken, profile, res) => {
      const userData = {
        email: profile.email,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
      };
      new User(userData).save();
      console.log({ profile: profile });
    }
  )
);

// --------------- Email send -------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  port: 587,
  auth: {
    user: `${process.env.EMAIL}`,
    pass: `${process.env.PASSWORD}`,
  },
  tls: {
    rejectUnauthorized: false
},
});

const AuthController = {

  registerClient: async (req, res) => {
    try {
      const content = 'Thank you for joining us! Please copy the code below to validate your email address and start exploring our application.';
      const { firstName, lastName, email, password, passwordVerify } = req.body;
  
      // Check for required fields
      if (!firstName || !lastName || !email || !password || !passwordVerify) {
        return res.status(400).json({ message: "Not all fields have been entered." });
      }
  
      // Check for password mismatch before querying the database
      if (password !== passwordVerify) {
        return res.status(400).json({ message: "Passwords do not match." });
      }
      const validEmailEndings = /\.com$|\.fr$|\.tn$/i; // Regex to check for .com, .fr, or .tn endings
      if (!validEmailEndings.test(email)) {
        return res.status(400).json({ message: "Email must end with .com, .fr, or .tn." });
      }
  
      // Check if the email is already taken
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: "Email is already taken." });
      }
  
      // Proceed with registration
      const activationCode = RandomString.generate({ length: 4, charset: "numeric" });

      const token = jwt.sign(
        { firstName, lastName, email, password, activationCode },
        process.env.JWT_ACC_ACTIVATE,
        { expiresIn: "10m" }
      );
  
      // Prepare email content
      const email_content = { email, content, activationCode };
  
      // Set cookie
      res.cookie("token", token, { maxAge: 600000, httpOnly: true });
  
      // Send activation email
      send.sendMailInscription(email_content, res);
    } catch (err) {
      console.error(err); 
      return res.status(500).json({ message: "Registration failed: " + err.message });
    }
  },
  

  activateAccount: async (req, res) => {
    try {
      const token = req.cookies.token;
      if (token) {
        jwt.verify(
          token,
          `${process.env.JWT_ACC_ACTIVATE}`,
          function (err, decodedToken) {
            if (err) {
              return res
                .status(400)
                .json({ error: "Incorrect or Expired code." });
            }
            const { firstName, lastName, email, password, activationCode } = decodedToken;
            User.findOne({ email }).then(async (err, user) => {
              if (user) {
                return res
                  .status(400)
                  .json({ error: "User with this email already exists." });
              }
              const salt = await bcrypt.genSalt();
              const passwordHash = await bcrypt.hash(password, salt);
              const code = req.body.activationCode;

              if (code !== activationCode) {
                return res.status(400).json({ error: "Mismatch code" });
              }

              const newUser = new User({
                firstName,
                lastName,
                image: 'client.png',
                phone: "+1 11111111",
                address: "Montreal, Canada",
                birthday: "01/01/2023",
                email,
                password: passwordHash,
                role: 'client',
                activate: 1

              });
              newUser.save()
                .then(savedUser => {
                  res.status(200).json({ message: "successfully registered"  })
                })
                .catch(err => {
                  console.error('Erreur lors de l\'enregistrement de l\'utilisateur :', err);
                });
            });
          }
        );
      } else { return res.json({ error: "Something went wrong." }); }
    } catch (err) { return res.status(500).json({ message: "Register failed" + "" + err.message }); }
  },

  login: async (req, res) => {
    try {
      const { email, password, rememberMe } = req.body;
      if (!email || !password) {
        console.log("Missing fields");
        return res.status(400).json({ message: "Not all fields have been entered" });
      }
  
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        console.log("Invalid email format");
        return res.status(400).json({ message: "Invalid email format" });
      }
  
      const user = await User.findOne({ email });
      if (!user) {
        console.log("No account found with this email");
        return res.status(400).json({ message: "No account with this email has been found" });
      }
  
      const activation = user.activate;
      if (!activation) {
        console.log("User deactivated");
        return res.status(403).json({ message: "User deactivated" });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      console.log("Password match:", isMatch); 
      if (!isMatch) {
        console.log("Invalid credentials");
        return res.status(400).json({ message: "Invalid credentials" });
      }
  
      if (!user.firstLogin) {
        await User.updateOne({ email: email }, { $set: { firstLogin: true } });
        console.log("First login updated");
      }
  
      const tokenExpiration = rememberMe ? '7d' : '1h';
      const tokenLogin = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: tokenExpiration });
  
      res.cookie("tokenLogin", tokenLogin, { httpOnly: true, maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000 });
  
      return res.json({
        tokenLogin,
        user: {
          id: user._id,
          role: user.role,
          firstLogin: user.firstLogin,
          phoneVerified: user.phoneVerified,
        },
      });
    } catch (err) {
      console.error("Error in login function:", err);
      return res.status(500).json({ message: err.message });
    }
  },
  

  forgotPasswordWithCode: async (req, res) => {
    try {
      const content = 'Just copy the code below in your interface to validate your email address...';
      const { email } = req.body;
      if (email=='') {
        return res.status(400).json({ message: "Email field is empty" });
      }
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
  
      const user = await User.findOne({ email: email });
      if (!user) {
        return res.status(400).json({ message: "User does not exist" });
      }
  
      const activationCodeForgotPass = RandomString.generate({
        length: 4,
        charset: "numeric",
      });
      const tokenForgotPass = jwt.sign(
        { email, activationCodeForgotPass },
        process.env.JWT_ACC_ACTIVATE,
        { expiresIn: '2m' }
      );

  
      res.cookie("tokenForgotPass", tokenForgotPass, { maxAge: 120000, httpOnly: true }); 
  
      const forgotten_content = {email, content, activationCodeForgotPass };
      console.log(activationCodeForgotPass)
      
      sendF.sendMailForgot(forgotten_content, res);
  
    } catch (err) {
      return res.status(500).json({ message: "Something went wrong: " + err.message });
    }
  },
  

  resendForgotCode: async (req, res) => {
    const tokenForgotPass = req.cookies.tokenForgotPass;
    const decodedToken = jwt.verify(tokenForgotPass, process.env.JWT_ACC_ACTIVATE);
    const emailR = decodedToken.email;

    const content = 'Just copy the code below in your interface to validate your email address..';

    const activationResendCode = RandomString.generate({
      length: 4,
      charset: "numeric",
    });
    const tokenResendCode = jwt.sign(
      { emailR, activationResendCode },
      `${process.env.JWT_ACC_ACTIVATE}`,
      { expiresIn: "2m" }
    );

    const resendForgotten_content = {email:emailR , content:content, activationResendCode : activationResendCode};
    rsendF.sendMailResendForgot(resendForgotten_content,res);

    res.cookie("tokenResendCode", tokenResendCode, { expiresIn: "2m" , overwrite: true });
  },

  verifCodeForgotPassword: async (req, res) => {
    try {
      const code = req.body.activationCodeForgotPass;

      // ---------- tokenForgot ---------------------------
      const tokenForgotPass =  req.cookies.tokenResendCode  ||  req.cookies.tokenForgotPass
      const decodedTokenForgotPass = jwt.verify(tokenForgotPass, process.env.JWT_ACC_ACTIVATE)
      const codeForgot =  decodedTokenForgotPass.activationResendCode || decodedTokenForgotPass.activationCodeForgotPass;
      const email = decodedTokenForgotPass.emailR || decodedTokenForgotPass.email;
   
      console.log('code ',codeForgot);
      if (tokenForgotPass && code === codeForgot) {

        User.findOne({ email }).then(async (user) => {
          if (!user) {
            return res
              .status(400)
              .json({ error: "User does not exist" });
          }
        else{
          res.cookie("tokenForgotPass", tokenForgotPass, { overwrite: true});

            res.status(201).json({ message: 'Code verification verified' });
          }
        });

      }
      else {
        return res
              .status(400)
              .json({ error: "invalid code" });
      
     }
   } catch (err) {
      return res.status(500).json({ message: "error " + err.message });
    }
  },


  resetPassword: async (req, res) => {
    try {
      const tokenForgotPass = req.cookies.tokenForgotPass;
      let decodeTokenLogin = jwt_decode(tokenForgotPass);
      let emailUser = decodeTokenLogin.emailR || decodeTokenLogin.email;

      const confirmPassword = req.body.confirmPassword;
      const password = req.body.password;

      if (!password || !confirmPassword) {
        return res
          .status(400)
          .json({ message: "Not all fields have been entered" });
      }
      if (password != confirmPassword) {
        return res.status(400).json({ error: "Mismatch password" });
      }

      let salt = bcrypt.genSaltSync(10);
      User.updateOne(
        { "email": emailUser },
        { $set: { "password": bcrypt.hashSync(password, salt) } }
      )
        .then(() => {
          res.json({ message: "Password updated" })
        })
        .catch((err) => { throw (err); })
    } catch (err) {
      return res.status(500).json({ message: "Password updating error" + err.message });
    }
  },
  logout: async (req, res) => { 

    try {
      res.cookie("tokenLogin", null , {
        httpOnly: true,
        overwrite : true
      });
      res.json({ message: "Logged out" });
    } catch (err) {
      return res.status(500).json({ message: "Logout failed" + err.message });
    }
  },

//////////////////client////////////
registerClientWeb: async (req, res) => {
  try {
    const content = 'Thank you for joining us! Please copy the code below to validate your email address and start exploring our application.';
    const { firstName, lastName, email, password, passwordVerify } = req.body;

    // Check for required fields
    if (!firstName || !lastName || !email || !password || !passwordVerify) {
      return res.status(400).json({ message: "Not all fields have been entered." });
    }

    // Check for password mismatch before querying the database
    if (password !== passwordVerify) {
      return res.status(400).json({ message: "Passwords do not match." });
    }
    const validEmailEndings = /\.com$|\.fr$|\.tn$/i; // Regex to check for .com, .fr, or .tn endings
    if (!validEmailEndings.test(email)) {
      return res.status(400).json({ message: "Email must end with .com, .fr, or .tn." });
    }

    // Check if the email is already taken
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email is already taken." });
    }

    // Proceed with registration
    const activationCode = RandomString.generate({ length: 4, charset: "numeric" });

    const token = jwt.sign(
      { firstName, lastName, email, password, activationCode },
      process.env.JWT_ACC_ACTIVATE,
      { expiresIn: "10m" }
    );

    // Prepare email content
    const email_content = { email, content, activationCode };

    // Set cookie
    res.cookie("token", token, { maxAge: 600000, httpOnly: true });

    // Send activation email
    send.sendMailInscription(email_content, res);
  } catch (err) {
    console.error(err); 
    return res.status(500).json({ message: "Registration failed: " + err.message });
  }
},



activateAccountWeb: async (req, res) => {
  try {
    const token = req.cookies.token;
    if (token) {
      jwt.verify(
        token,
        `${process.env.JWT_ACC_ACTIVATE}`,
        function (err, decodedToken) {
          if (err) {
            return res
              .status(400)
              .json({ error: "Incorrect or Expired code." });
          }
          const { firstName, lastName, email, password, activationCode } = decodedToken;
          User.findOne({ email }).then(async (err, user) => {
            if (user) {
              return res
                .status(400)
                .json({ error: "User with this email already exists." });
            }
            const salt = await bcrypt.genSalt();
            const passwordHash = await bcrypt.hash(password, salt);
            const code = req.body.activationCode;

            if (code !== activationCode) {
              return res.status(400).json({ error: "Mismatch code" });
            }

            const newUser = new User({
              firstName,
              lastName,
              image: 'client.png',
              phone: "+1 11111111",
              address: "Montreal, Canada",
              birthday: "01/01/2023",
              email,
              password: passwordHash,
              role: 'client',
              activate: 1

            });
            newUser.save()
              .then(savedUser => {
                res.status(200).json({ message: "successfully registered"  })
              })
              .catch(err => {
                console.error('Erreur lors de l\'enregistrement de l\'utilisateur :', err);
              });
          });
        }
      );
    } else { return res.json({ error: "Something went wrong." }); }
  } catch (err) { return res.status(500).json({ message: "Register failed" + "" + err.message }); }
},
loginFr: async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Not all fields have been entered" });
    }
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email }); 
    if (!user) {
      return res.status(400).json({ message: "No account with this email has been found" });
    }

    const activation = user.activate;
    if (!activation) {
      return res.status(403).json({ message: "User deactivated" });
    }
    

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch); 
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

 
    const tokenExpiration = rememberMe ? '7d' : '1h';
    const tokenLogin = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: tokenExpiration });

    res.cookie("tokenLogin", tokenLogin, { httpOnly: true, secure: true });


    return res.json({
      tokenLogin,
      user: {
        id : user._id,
        role: user.role,
        firstLogin: user.firstLogin,
        activate:user.activate,
        franchiseFK:user.franchiseFK,
        statusarchieve:user.statusarchieve
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
},
loginWeb: async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Not all fields have been entered" });
    }
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email }); 
    if (!user) {
      return res.status(400).json({ message: "No account with this email has been found" });
    }

    const activation = user.activate;
    if (!activation) {
      return res.status(403).json({ message: "User deactivated" });
    }
    

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.firstLogin) {
      await User.updateOne({ email: email }, { $set: { firstLogin: true } });
      console.log("updated");
    }

    const tokenExpiration = rememberMe ? '7d' : '1h';
    const tokenLogin = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: tokenExpiration });

    res.cookie("tokenLogin", tokenLogin, { httpOnly: true, secure: true });


    return res.json({
      tokenLogin,
      user: {
        id : user._id,
        role: user.role,
        firstLogin: user.firstLogin,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
},
loginFr: async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Not all fields have been entered" });
    }
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email }); 
    if (!user) {
      return res.status(400).json({ message: "No account with this email has been found" });
    }

    const activation = user.activate;
    if (!activation) {
      return res.status(403).json({ message: "User deactivated" });
    }
    

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch); 
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

 
    const tokenExpiration = rememberMe ? '7d' : '1h';
    const tokenLogin = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: tokenExpiration });

    res.cookie("tokenLogin", tokenLogin, { httpOnly: true, secure: true });


    return res.json({
      tokenLogin,
      user: {
        id : user._id,
        role: user.role,
        firstLogin: user.firstLogin,
        activate:user.activate,
        franchiseFK:user.franchiseFK,
        statusarchieve:user.statusarchieve
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
},
}


module.exports = AuthController;
