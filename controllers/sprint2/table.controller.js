const jwt_decode = require("jwt-decode");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require('path');
const mongoose = require('mongoose');
const Table = require('../../models/sprint2/table.model');
const Restaurant = require('../../models/restaurant.model');
const QRCode = require('qrcode');
const User = require('../../models/user.model');

async function findRestaurantByOwnerId(ownerId) {
    try {
        const restaurant = await Restaurant.findOne({ owner: ownerId }).populate('owner');
        return restaurant;
    } catch (error) {
        console.error('Error finding restaurant by owner ID:', error);
        throw error;
    }
  }
const tableController = {

    AddNewTable: async (req, res) => {
        try {
          //  const tokenLogin = req.cookies.tokenLogin;
          //  const decodeTokenLogin = jwt_decode(tokenLogin);
            //const idUser = decodeTokenLogin.id;
            const idUser = '64ec84b22b8071e06b57e415';


            if (idUser) {
                const restaurantId = req.params.restaurant;
                const { tableNb, chairNb} = req.body;

                if (isNaN(tableNb) || isNaN(chairNb)) {
                    return res.status(400).json({ message: "Les champs tableNb et chairNb doivent être des nombres." });
                }
                if (tableNb === 0 || chairNb === 0) {
                    return res.status(400).json({ message: "Les champs tableNb et chairNb doivent être supérieurs à zéro." });
                }
                const qrCodeContent = JSON.stringify({
                    restaurantId: restaurantId,
                    tableNb: tableNb
                });

                QRCode.toDataURL(qrCodeContent, async (err, qrCodeUrl) => {
                    if (err) {
                        return res.status(500).json({ message: err });
                    }

                    const existingTable = await Table.findOne({ tableNb, restaurant: restaurantId });
                    if (existingTable) {
                        return res.status(409).json({ message: "Ce numéro de table existe déjà." });
                    }

                    const table = new Table({ tableNb, chairNb, restaurant: restaurantId, qr: qrCodeUrl, user: idUser });
                    const savedTable = await table.save();
                    return res.status(201).json({ data: savedTable, qr: qrCodeUrl });
                });
            }
        } catch (error) {
            return res.status(500).json({ message: error });
        }
    },
    
    getTablebyId: async (req, res) => {
        try {
            await Table.findById(req.params.id)
                .then((docs) => {
                    res.send(docs)
                })
                .catch((err) => {
                    res
                        .status(400)
                        .json({ message: "Table not found" + "" + err });
                });

        } catch (error) {
            return res.status(500).json({ message: "updating Table failed" + "" + error });
        }
    },

    getTables: async (req, res) => {
        try {
            const tokenLogin = req.cookies.tokenLogin;
            const decodeTokenLogin = jwt_decode(tokenLogin);
            const idUser = decodeTokenLogin.id;
         //   console.log(idUser+"aaaaaaaaaaaa");

            const user = await User.findById(idUser);

            Table.find({restaurant : user.restaurantFK})
                .sort({ numberOfTables: 1 })
                .then((docs) => {
                    res.send(docs);
                  //  console.log(idUser+"aaaaaaaaaaaa");

                })
                .catch((err) => {
                    res
                        .status(400)
                        .json({ message: "Invalid" + "" + err });
                });

        } catch (err) {
            return res.status(500).json({ message: "Something wrong" + "" + err.message });
        }

    },
    
    updateTableById: async (req, res) => {
        try {
                const { tableNb, chairNb, qr } = req.body;
                const table = await Table.findById(req.params.id);

                const existingTable = await Table.findOne({ tableNb, restaurant: table.restaurant });
                if (existingTable && existingTable._id.toString() !== table._id.toString()) {
                    return res.status(409).json({ message: "Ce numéro de table existe déjà." });
                }
                table.tableNb = tableNb;
                table.chairNb = chairNb;
                if (tableNb === 0 || chairNb === 0) {
                    return res.status(400).json({ message: "Les champs tableNb et chairNb doivent être supérieurs à zéro." });
                }
                const qrCodeContent = JSON.stringify({
                    restaurantId: table.restaurant,
                    tableNb: tableNb
                });

                QRCode.toDataURL(qrCodeContent, async (err, qrCodeUrl) => {
                    if (err) {
                        return res.status(500).json({ message: err });
                    }
                    table.qr = qrCodeUrl;
                    await table.save();
                    return res.status(200).json({ data: table, qr: qrCodeUrl });
                });
           
        } catch (error) {
            return res.status(500).json({ message: "Updating table failed: " + error });
        }
    },
    getTablesPagination: async (req, res, next) => {
        try {
            const tokenLogin = req.get('Authorization').split(' ')[1];
            let decodeTokenLogin = jwt_decode(tokenLogin);
            let idUser = decodeTokenLogin.id;


            let user =await User.findById(idUser)
            if (user.role=="employee"){
              idUser=user.owner;
            }
            const restaurant = await findRestaurantByOwnerId(idUser);
            const restaurantId = restaurant._id;
    
            const page = parseInt(req.query.page) || 1;
            const limit = 6;
            const skip = (page - 1) * limit;
            const searchQuery = req.query.search || '';
    
            let query = {};
            query.restaurant = restaurantId; 
            if (searchQuery) {
                const searchNumber = parseInt(searchQuery);
                if (!isNaN(searchNumber)) {
                    query.tableNb = searchNumber;
                } else {
                    // Handle invalid searchQuery, perhaps by sending an error response
                    res.status(400).json({ message: "Invalid search query. Please provide a number." });
                    return; // Exit the function early
                }
            }
    
            const tables = await Table.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
            const total = await Table.countDocuments(query);
    
            res.json({ tables, total });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server Error" });
        }
    },
    AddNewTableQrCode: async (req, res) => {
        try {
            const tokenLogin = req.get('Authorization').split(' ')[1];
            let decodeTokenLogin = jwt_decode(tokenLogin);
            let idUser = decodeTokenLogin.id;
            let user =await User.findById(idUser)
            if (user.role=="employee"){
              idUser=user.owner;
            }
            const restaurant = await findRestaurantByOwnerId(idUser);
          const restaurantId = restaurant._id;

            if (idUser) {
                const { tableNb, chairNb} = req.body;

                if (isNaN(tableNb) || isNaN(chairNb)) {
                    return res.status(400).json({ message: "Les champs tableNb et chairNb doivent être des nombres." });
                }
                if (tableNb === 0 || chairNb === 0) {
                    return res.status(400).json({ message: "Les champs tableNb et chairNb doivent être supérieurs à zéro." });
                }
                const qrCodeContent = JSON.stringify({
                    restaurantId: restaurantId,
                    tableNb: tableNb
                });

                QRCode.toDataURL(qrCodeContent, async (err, qrCodeUrl) => {
                    if (err) {
                        return res.status(500).json({ message: err });
                    }

                    const existingTable = await Table.findOne({ tableNb, restaurant: restaurantId });
                    if (existingTable) {
                        return res.status(409).json({ message: "Ce numéro de table existe déjà." });
                    }

                    const table = new Table({ tableNb, chairNb, restaurant: restaurantId, qr: qrCodeUrl, user: idUser });
                    const savedTable = await table.save();
                 //   console.log(qrCodeUrl)
                    return res.status(201).json({ data: savedTable, qr: qrCodeUrl });
                });
            }
        } catch (error) {
            return res.status(500).json({ message: error });
        }
    },
    deleteById: async (req, res) => {
        try {
            const tableId = req.params.id;
            
            // Delete the table
            const table = await Table.findByIdAndDelete(tableId);
            
         
    
            res.status(200).json({ message: "Table deleted successfully", data: table });
        } catch (error) {
            res.status(500).json({ message: "An error occurred", error: error.message });
        }
    }
    

};

module.exports = tableController;