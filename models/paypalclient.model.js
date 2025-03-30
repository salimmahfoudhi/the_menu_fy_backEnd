const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

function client() {
    return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

function environment() {
    let clientId = process.env.PAYPAL_CLIENT_ID || 'sb-4iip229834714@personal.example.com';
    let clientSecret = process.env.PAYPAL_CLIENT_SECRET || 'a=-kZ1H3';

    return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
}

module.exports = { client: client };