const Privilege = require("../../models/sprint3/privilege.model");
const jwt_decode = require("jwt-decode");

const PrivilegeController = {
  getPrivilegeByUser: async (req, res) => {
    try {
      const tokenLogin = req.cookies.tokenLogin;
      let decodeTokenLogin = jwt_decode(tokenLogin);
      let idUser = decodeTokenLogin.id;
  
      const userPrivilege = await Privilege.findOne({ user: idUser })
      return res.status(200).json({ data : userPrivilege });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Une erreur s'est produite lors de la récupération des privilèges utilisateur" });
    
  }
}

  
};
module.exports = PrivilegeController;