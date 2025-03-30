module.exports = function generateOrderPdfTemplate(order) {
    const today = new Date();

    return `
        <!doctype html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Order Invoice</title>
            <style>
                .invoice-box {  
                    max-width: 800px;
                    margin: auto;
                    padding: 30px;
                    border: 1px solid #eee;
                    box-shadow: 0 0 10px rgba(0, 0, 0, .15);
                    font-size: 16px;
                    line-height: 24px;
                    font-family: 'Helvetica Neue', 'Helvetica', sans-serif;
                    color: #555;
                }
                /* Additional styling can go here */
            </style>
        </head>
        <body>
            <div class="invoice-box">
                <h1>Thanks for your order, ${order.user.name}!</h1>
                <table>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Price</th>
                    </tr>
                    ${order.cartOrderFK.map(cartItem => `
                        <tr>
                            <td>${cartItem.productFK.name}</td>
                            <td>${cartItem.quantityProduct}</td>
                            <td>$${cartItem.productFK.price}</td>
                           
                        </tr>

                    `).join('')}
                </table>
                <p>Total: $${order.totalPrice}</p>
            </div>
        </body>
        </html>
    `;
};
