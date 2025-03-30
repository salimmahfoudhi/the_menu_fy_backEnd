const jwt_decode = require("jwt-decode");
const mongoose = require('mongoose');
const Tax = require('../../models/sprint2/tax.model');

const taxController = {

    addTax: async (req, res) => {
        try {
            const tokenLogin = req.cookies.tokenLogin;
            let decodeTokenLogin = jwt_decode(tokenLogin);
            let idUser = decodeTokenLogin.id;
            let role = decodeTokenLogin.role;

            if (idUser) {
                if (role == 'client') {
                    const { title, idNumber, address, phoneNumber, typeTax } = req.body;

                    if (!title || !idNumber || !address || !phoneNumber) {
                        return res
                            .status(400)
                            .json({ message: "Not all fields have been entered" });
                    }
                    const newTax = new Tax({
                        typeTax,
                        title,
                        idNumber,
                        address,
                        phoneNumber,
                        user: idUser,
                        activate: 1
                    });
                    const savedTax = await newTax.save();
                    return res.status(200).json({ savedTax });
                }
            }
            return res.status(400).json({ error: "You are not authorized to perform this operation !" });
        } catch (error) {
            return res.status(500).json({ message: "Save failed" + "" + error });
        }

    },

    getTaxs: async (req, res) => {
        try {
            const tokenViewProfile = req.cookies.tokenLogin;
            let decodeTokenLogin = jwt_decode(tokenViewProfile);
            let idUser = decodeTokenLogin.id;

            Tax.find({ "user": idUser })
                .then((docs) => {
                    res.send(docs)
                })
                .catch((err) => {
                    res
                        .status(400)
                        .json({ message: "Invalid" + "" + err });
                });

        } catch (error) {
            return res.status(500).json({ message: "Get all taxs failed" + "" + error });
        }
    },

    getTaxById: async (req, res) => {
        try {
            const taxId =req.params.id;
            await Tax.findById(taxId)
                .then((docs) => {
                    res.send(docs)
                })
                .catch((err) => {
                    res
                        .status(400)
                        .json({ message: "Tax not found" + "" + err });
                }); 


        } catch (error) {
            return res.status(500).json({ message: "updating tax failed" + "" + error });
        }
    },

    editTaxById: async (req, res) => {
        try {
            const { typeTax, title, idNumber, address, phoneNumber } = req.body;
            const tax = await Tax.findById(req.params.id);
            tax.typeTax = typeTax
            tax.title = title
            tax.idNumber = idNumber
            tax.address = address
            tax.phoneNumber = phoneNumber
            const savedTaxUpdated = await tax.save();
            res.status(200).json(savedTaxUpdated);
        } catch (error) {
            return res.status(500).json({ message: "updating tax failed" + "" + error });
        }
    },

    hideTax: async (req, res) => {
        try {
            const tax = await Tax.findById(req.params.id);
            tax.activate = 0;
            await tax.save();
            return res.status(200).json({ message: "Tax hidden" });

        } catch (error) {
            return res.status(500).json({ message: "failed" + "" + error });
        }
    },

    activateTax: async (req, res) => {
        try {
            const tax = await Tax.findById(req.params.id);
            tax.activate = 1;
            await tax.save();
            return res.status(200).json({ message: "Tax activated" });

        } catch (error) {
            return res.status(500).json({ message: "failed" + "" + error });
        }
    },

    getActivateTaxs: async (req, res) => {
        try {
            const tokenViewProfile = req.cookies.tokenLogin;
            let decodeTokenLogin = jwt_decode(tokenViewProfile);
            let idUser = decodeTokenLogin.id;

            Tax.find({ "user": idUser, activate: true })
                .then((docs) => {
                    res.send(docs)
                })
                .catch((err) => {
                    res
                        .status(400)
                        .json({ message: err });
                });

        } catch (error) {
            return res.status(500).json({ message: error });
        }
    },

 };


module.exports = taxController;