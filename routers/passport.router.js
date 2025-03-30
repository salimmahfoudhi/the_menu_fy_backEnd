// passport.router.js
const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const client = new OAuth2Client(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI,
);
const clients = new OAuth2Client(process.env.CLIENT_ID);

router.get('/google', (req, res) => {
    const authUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: ['profile', 'email']
    });
    res.redirect(authUrl);
});

router.post('/google/callback', async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ error: "ID Token manquant" });
        }

        const ticket = await clients.verifyIdToken({
            idToken,
            audience: process.env.CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, given_name, family_name, picture } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                firstName: given_name,
                lastName: family_name,
                email,
                profilePicture: picture,
            });
            await user.save();
        }

        const token = generateAuthToken(user);

        res.json({ user, token });
    } catch (error) {
        console.error('Erreur lors de l\'authentification Google:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

function generateAuthToken(user) {
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
}

module.exports = router;
