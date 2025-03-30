const Franchise = require('../models/franchise.model');
const User = require('../models/user.model');
const bcrypt = require("bcryptjs");
const nodemailer = require('nodemailer');
const Restaurant = require('../models/restaurant.model');
const Menu = require('../models/menu.model');
const path = require('path');
const DEFAULT_LOGO_URL = "backend.themenufy.com/uploads/resto/8.png";


exports.createFranchise = async (req, res) => {
    try {
      const { nameFr, address, email, phone,nbrF } = req.body;
      const existingFranchise = await Franchise.findOne({ $or: [{ nameFr }, { email }] });
      if (existingFranchise) {
        return res.status(400).json({ error: 'Name or email is already taken' });
      }
      const newFranchise = await Franchise.create({ nameFr, address , email , phone , logo: '',nbrF: nbrF  });
  
      const password = Math.random().toString(36).slice(-8);
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const resFranchiseUser = await User.create({
        email,
        phone,
        password: hashedPassword,
        role: 'resFranchise',
        franchiseFK: newFranchise._id, 
        firstLogin: true,
        activate:true,
      });
      const newMenu = await Menu.create({
        name: `${nameFr} Menu`, // Adjust this name as necessary
        franchiseFK: newFranchise._id,
      });
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD
        }
      });
  
      if (!newFranchise.responsablefr) {
        newFranchise.responsablefr = resFranchiseUser._id;
    newFranchise.menu = newMenu._id;
    await newFranchise.save();
      }
  
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Welcome to the franchise!',
        html: `
        <!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
        <head>
        <!--[if gte mso 9]>
        <xml>
          <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
        <![endif]-->
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="x-apple-disable-message-reformatting">
          <!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]-->
          <title></title>
          
            <style type="text/css">
              @media only screen and (min-width: 620px) {
          .u-row {
            width: 600px !important;
          }
          .u-row .u-col {
            vertical-align: top;
          }
        
          .u-row .u-col-100 {
            width: 600px !important;
          }
        
        }
        
        @media (max-width: 620px) {
          .u-row-container {
            max-width: 100% !important;
            padding-left: 0px !important;
            padding-right: 0px !important;
          }
          .u-row .u-col {
            min-width: 320px !important;
            max-width: 100% !important;
            display: block !important;
          }
          .u-row {
            width: 100% !important;
          }
          .u-col {
            width: 100% !important;
          }
          .u-col > div {
            margin: 0 auto;
          }
        }
        body {
          margin: 0;
          padding: 0;
        }
        
        table,
        tr,
        td {
          vertical-align: top;
          border-collapse: collapse;
        }
        
        p {
          margin: 0;
        }
        
        .ie-container table,
        .mso-container table {
          table-layout: fixed;
        }
        
        * {
          line-height: inherit;
        }
        
        a[x-apple-data-detectors='true'] {
          color: inherit !important;
          text-decoration: none !important;
        }
        
        table, td { color: #000000; } #u_body a { color: #0000ee; text-decoration: underline; } @media (max-width: 480px) { #u_content_image_1 .v-container-padding-padding { padding: 40px 10px 10px !important; } #u_content_image_1 .v-src-width { width: auto !important; } #u_content_image_1 .v-src-max-width { max-width: 25% !important; } #u_content_heading_1 .v-font-size { font-size: 25px !important; } #u_content_text_1 .v-container-padding-padding { padding: 5px 10px 10px !important; } #u_content_text_1 .v-font-size { font-size: 14px !important; } #u_content_text_1 .v-text-align { text-align: center !important; } #u_content_button_1 .v-container-padding-padding { padding: 10px 10px 40px !important; } #u_content_button_1 .v-size-width { width: 50% !important; } #u_content_text_deprecated_1 .v-container-padding-padding { padding: 40px 10px 10px !important; } #u_content_text_deprecated_2 .v-container-padding-padding { padding: 10px 10px 40px !important; } }
            </style>
          
          
        
        <!--[if !mso]><!--><link href="https://fonts.googleapis.com/css?family=Open+Sans:400,700" rel="stylesheet" type="text/css"><!--<![endif]-->
        
        </head>
        
        <body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;style="background-image: url('https://cdn.templates.unlayer.com/assets/1697613131983-Layer%20bg.png'); background-repeat: no-repeat; background-size: cover;>
          <!--[if IE]><div class="ie-container"><![endif]-->
          <!--[if mso]><div class="mso-container"><![endif]-->
          <table id="u_body" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ecf0f1;width:100%" cellpadding="0" cellspacing="0">
          <tbody>
          <tr style="vertical-align: top">
            <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
            <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #ecf0f1;"><![endif]-->
            
        
        <div class="u-row-container" style="padding: 0px;background-color: white">
          <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: white;">
            <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: white;">
              <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: white;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: white;"><![endif]-->
              
        <!--[if (mso)|(IE)]><td align="center" width="600" style="background-color: #FFFFFF;width: 600px;padding: 0px;border-top: 0px solid white;border-left: 0px solid white;border-right: 0px solid white;border-bottom: 0px solid white;" valign="top"><![endif]-->
        <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
          <div height: 100%;width: 100% !important;">
          <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid white;border-left: 0px solid white;border-right: 0px solid white;border-bottom: 0px solid white;"><!--<![endif]-->
          
         
      
       
      <table id="u_content_image_1" style=" margin-bottom: 50px; font-family:'Open Sans',sans-serif; background-color: #FFFFFF;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
      <tbody>
        <tr>
          <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;font-family:'Open Sans',sans-serif; text-align: center;" align="left">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td class="" style="padding-right: 0px;padding-left: 0px; " align="center">
                  <img  align="center" border="0" src="https://assets.unlayer.com/stock-templates/1709634606754-logo44.png" alt="image" title="image" width="80%" height="auto">
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </tbody>
    </table>

    <table id="u_content_heading_1" style="font-family:'Open Sans',sans-serif; background-color: #FFFFFF;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
    <tbody>
        <tr>
            <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:13px 80px 10px;font-family:'Open Sans',sans-serif;" align="left">
                <div class="v-text-align v-font-size" style="font-size: 20px; line-height: 90%; text-align: center; word-wrap: break-word;">
                    <h4 style="line-height: 90%;">Welcome to Menu.com!</h4>
                </div>
            </td>
        </tr>
    </tbody>
</table>
        
        <table id="u_content_heading_1" style="margin-top:37px;font-family:'Open Sans',sans-serif; background-color: #FFFFFF;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
          <tbody>
            <tr>
              <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:10px 10px 0px;font-family:'Open Sans',sans-serif;" align="left">
                
              <div class="v-text-align v-font-size" style="font-size: 16px; line-height: 170%; text-align: center; word-wrap: break-word;">
              
              <p style="line-height: 170%;"> This is a random password that you can use it once</p>
            </div>
          
            </div>
              </td>
            </tr>
          </tbody>
        </table>
                
        <table id="u_content_button_1" style="font-family:'Open Sans',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
          <tbody>
            <tr>
              <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:10px 10px 60px;font-family:'Open Sans',sans-serif;" align="left">
                
                  <!--[if mso]><style>.v-button {background: white !important;}</style><![endif]-->
       
                <div class="v-text-align" align="center" style="margin-top: 10px;">
                  <p style="margin-bottom: 10px; ">
                    <a target="_blank" class="v-button v-size-width v-font-size" style="box-sizing: border-box;display: inline-block;font-family:'Open Sans',sans-serif;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #FA8072; border-radius: 4px;-webkit-border-radius: 4px; -moz-border-radius: 4px; width:14%; max-width:30%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;border-top-color: #CCC; border-top-style: dashed; border-top-width: 0px; border-left-color: #CCC; border-left-style: dashed; border-left-width: 0px; border-right-color: #CCC; border-right-style: dashed; border-right-width: 0px; border-bottom-color: #CCC; border-bottom-style: dashed; border-bottom-width: 0px;font-family: helvetica,sans-serif; font-size: 17px;">
                      <span style="display:block;padding:10px 20px;line-height:120%;">
                        <strong><span style="line-height: 20.4px;">${password}</span></strong>
                      </span>
                    </a>
                  </p>
                </div>
        
              </td>
            </tr>
          </tbody>
        </table>
        <table id="u_content_heading_1" style="font-family:'Open Sans',sans-serif; background-color: #FFFFFF;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
            <tr>
                <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:10px 10px 0px;font-family:'Open Sans',sans-serif;" align="center">
                    <div class="v-text-align v-font-size" style="font-size: 16px; line-height: 170%; text-align: center; word-wrap: break-word;">
                        <div style="display: inline-block; margin-right: 10px;">
                            <img src="https://assets.unlayer.com/stock-templates/1709634275136-instagram.png"  alt="Instagram" style="width: 40px; height: 40px; border-radius: 50%;">
                        </div>
                        <div style="display: inline-block; margin-right: 10px;">
                            <img src="https://assets.unlayer.com/stock-templates/1709634299199-facebook.png" alt=" Facebook" style="width: 40px; height: 40px; border-radius: 50%;">
                        </div>
                        <div style="display: inline-block; margin-right: 10px;">
                            <img src="https://assets.unlayer.com/stock-templates/1709634548413-whatsapp.png" alt="Whatsapp" style="width: 40px; height: 40px; border-radius: 50%;">
                        </div>
                        <!-- Ajoutez d'autres icônes de réseaux sociaux de la même manière -->
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
    
        
          <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
          </div>
        </div>
        <!--[if (mso)|(IE)]></td><![endif]-->
              <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
            </div>
          </div>
        </div>
        <div class="u-row-container" style="padding: 0px;background-color: white">
        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: white;">
          <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: white;">
            <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: white;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: white;"><![endif]-->
            
      <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid white;border-left: 0px solid white;border-right: 0px solid white;border-bottom: 0px solid white;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
      <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
        <div style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
        <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid white;border-left: 0px solid white;border-right: 0px solid white;border-bottom: 0px solid white;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
        
      <table id="u_content_text_deprecated_1" style="font-family:'Open Sans',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
          <tr>
            <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:13px 80px 10px;font-family:'Open Sans',sans-serif;" align="left">
              
        <div class="v-text-align v-font-size" style="line-height: 180%; text-align: center; word-wrap: break-word;">
          <p style="font-size: 14px; line-height: 180%;">if you have any questions, please email us at <a rel="noopener" href="https://www.unlayer.com" target="_blank">Menuapp@gmail.com</a></p>
        </div>
      
            </td>
          </tr>
        </tbody>
      </table>
              </td>
            </tr>
          </tbody>
        </table>
        
        <table style="font-family:'Open Sans',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
          <tbody>
            <tr>
              <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:8px 0px;font-family:'Open Sans',sans-serif;" align="left">
                
          <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #BBBBBB;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
            <tbody>
              <tr style="vertical-align: top">
                <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                  <span>&#160;</span>
                </td>
              </tr>
            </tbody>
          </table>
        
              </td>
            </tr>
          </tbody>
        </table>
        
        <table id="u_content_text_deprecated_2" style="font-family:'Open Sans',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
          <tbody>
            <tr>
              <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:5px 10px 10px;font-family:'Open Sans',sans-serif;" align="left">
                
          <div class="v-text-align v-font-size" style="line-height: 160%; text-align: center; word-wrap: break-word;">
            <p style="font-size: 14px; line-height: 160%;"> © 2024 IPACT Consult Alright Reserved</p>
          </div>
        
              </td>
            </tr>
          </tbody>  
        </table>
        
          <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
          </div>
        </div>
        <!--[if (mso)|(IE)]></td><![endif]-->
              <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
            </div>
          </div>
        </div>
        
        
            <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
            </td>
          </tr>
          </tbody>
          </table>
          <!--[if mso]></div><![endif]-->
          <!--[if IE]></div><![endif]-->
        </body>
        
        </html>
        
    
              
    
        `,
      };
  
      transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
          console.error('Error sending email:', err);
          return res.status(500).json({ success: false, error: 'Error sending email' });
        } else {
          console.log('Email sent:', info.response);
          return res.status(201).json({ success: true, data: { newFranchise, resFranchiseUser } });
        }
      });
    } catch (error) {
      console.error('Error creating franchise:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  };
  
  

exports.getAllFranchises = async (req, res) => {
  try {

    const franchises = await Franchise.find({ archive: false });
    res.status(200).json({ success: true, data: franchises });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getFranchiseById = async (req, res) => {
  try {
    const franchise = await Franchise.findById(req.params.id);
    if (!franchise) {
      return res.status(404).json({ success: false, error: 'Franchise not found' });
    }

    const restaurantCount = await Restaurant.countDocuments({ franchiseFK: franchise._id });

    franchise.nbrR = restaurantCount;
    await franchise.save();

    res.status(200).json({ success: true, data: franchise });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
exports.getRestaurantsByFranchiseId = async (req, res) => {
  try {
    const { franchiseId } = req.params;

    // Find all restaurants that belong to the specified franchise
    const restaurants = await Restaurant.find({ franchiseFK: franchiseId });

    res.status(200).json({ success: true, data: restaurants });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
exports.updateFranchiseCRM = async (req, res) => {
  const { franchiseId } = req.params;

  try {
    const updatedFields = { ...req.body };

    // Handle logo file upload
    if (req.file) {
      updatedFields.logo = req.file.filename; // Save the filename to the franchise document
    }

    // Handle images file upload
    if (req.files && req.files.images) {
      const imagesFile = req.files.images[0];
      updatedFields.images = imagesFile.filename;
    }

    const updatedFranchise = await Franchise.findOneAndUpdate(
      { _id: franchiseId },
      { $set: updatedFields },
      { new: true }
    );

    if (!updatedFranchise) {
      return res.status(404).json({ error: 'Franchise not found' });
    }

    // Update related restaurants with the new franchise logo
    if (updatedFields.logo) {
      await Restaurant.updateMany(
        { franchiseFK: franchiseId },
        { $set: { logo: updatedFields.logo } }
      );
    }

    res.status(200).json(updatedFranchise);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateFranchise = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedFranchise = await Franchise.findByIdAndUpdate(id, req.body, { new: true });

    if (req.body.archive && req.body.archive === true) {
      await User.updateMany({ franchiseFK: id }, { $set: { statusarchieve: true } });
    }
    res.status(200).json({ success: true, data: updatedFranchise });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.deleteFranchise = async (req, res) => {
  try {
    const deletedFranchise = await Franchise.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: deletedFranchise });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
exports.getFranchiseLogoById = async (req, res) => {
  try {
    const franchiseId = req.params.franchiseId;

    // Find the franchise by ID
    const franchise = await Franchise.findById(franchiseId);

    if (!franchise) {
      return res.status(404).json({ success: false, error: 'Franchise not found' });
    }

    // Check if the franchise has a logo
    if (!franchise.logo) {
      return res.status(404).json({ success: false, error: 'Franchise logo not found' });
    }

    // Construct the absolute path to the logo file
    const logoPath = path.resolve(__dirname, `../uploads/Franchise/${franchise.logo}`);

    // Send the logo file as a response
    res.sendFile(logoPath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};


exports.getArchivedFranchises = async (req, res) => {
  try {
    const archivedFranchises = await Franchise.find({ archive: true });
    res.status(200).json({ success: true, data: archivedFranchises });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
  exports.retrieveMenuIdByFranchiseId= async (req, res) => {
    try {
      const franchiseId = req.params.id;
      const franchise = await Franchise.findById(franchiseId);
      
      if (!franchise) {
        return res.status(404).json({ error: 'Franchise not found' });
      }

      if (!franchise.menu) {
        return res.status(404).json({ error: 'Menu ID not found for this franchise' });
      }

      res.json({ menuId: franchise.menu });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
