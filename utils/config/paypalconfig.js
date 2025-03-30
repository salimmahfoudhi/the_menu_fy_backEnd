const paypal = require('@paypal/checkout-server-sdk');

let clientId = process.env.PAYPAL_CLIENT_ID;
let clientSecret = process.env.PAYPAL_CLIENT_SECRET;

function environment() {
    let clientEnvironment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
    return clientEnvironment;
}

function client() {
    return new paypal.core.PayPalHttpClient(environment());
}

module.exports = { client };
