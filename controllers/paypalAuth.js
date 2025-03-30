const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

async function getAccessToken() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    try {
        const response = await axios.post('https://api.sandbox.paypal.com/v1/oauth2/token', 'grant_type=client_credentials', {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return response.data.access_token;
    } catch (err) {
        console.error('Error getting PayPal access token:', err.response ? err.response.data : err.message);
        throw new Error('Could not get PayPal access token');
    }
}

// Test the getAccessToken function
(async () => {
    try {
        const accessToken = await getAccessToken();
        console.log('Access Token:', accessToken);
    } catch (error) {
        console.error(error.message);
    }
})();

module.exports = { getAccessToken, uuidv4 };
