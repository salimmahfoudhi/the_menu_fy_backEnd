const nodemailer = require('nodemailer');
const moment = require('moment');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});

const sendInvoiceEmail = async (order) => {
    const emailHtmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Invoice</title>
<style>
    body { font-family: Arial, sans-serif; background-color: #fa8072; margin: 0; padding: 20px; color: #333; }
    .container { background-color: #ffffff; padding: 20px; border-radius: 10px; color: #333; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px; border: 1px solid #ddd; }
    th { background-color: #f2f2f2; }
</style>
</head>
<body>
<div class="container">
    <h1>Invoice Details</h1>
    <p>Billed To: ${order.user.name}</p>
    <p>Invoice Number: ${moment().format('YYYYMMDDHHmmss')}</p>
    <p>Date: ${moment().format('DD/MM/YYYY')}</p>
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total Price</th>
            </tr>
        </thead>
        <tbody>
            ${order.cartOrderFK.map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${item.productFK.name}</td>
                <td>${item.quantityProduct}</td>
                <td>$${item.productFK.price.toFixed(2)}</td>
                <td>$${(item.quantityProduct * item.productFK.price).toFixed(2)}</td>
            </tr>
            `).join('')}
        </tbody>
    </table>
    <p>Total Due: $${order.cartOrderFK.reduce((acc, item) => acc + (item.quantityProduct * item.productFK.price), 0).toFixed(2)}</p>
</div>
</body>
</html>`;

    const mailOptions = {
        from: process.env.EMAIL,
        to: order.user.email,
        subject: 'Payment Confirmation Invoice',
        html: emailHtmlContent
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

module.exports = { sendInvoiceEmail };
