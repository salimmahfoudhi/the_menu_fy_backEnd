const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const passport = require("passport");
const AuthRouter = require("./Auth.router");
const userSpaceRouter = require("./user.router");
const passportRouter = require("./passport.router");
const RequestRouter = require("./request.router");
const CategoryRouter = require("./category.router.js");
const MenuRouter = require("./menu.router.js");
const ProductRouter = require("./product.router.js");
const IngredientRouter = require("./ingredient.router.js");
const CartRouter = require('./cart.router');
const auth = require("../middleware/Auth");
const helpRequestRouter = require('./sprint2/help_request.router');
const taxRouter = require('./sprint2/tax.router');
const TableRouter = require('./sprint2/table.router');
const itemRouter = require('./item.router');
const OrderRouter = require('./sprint2/order.router');
const RestoRouter = require('./restaurant.route')
const NotifRouter = require('./sprint2/notification.router');
const NotifEmployeeRouter = require('./sprint2/notificationEmployee.router');
const StripeRouter = require('./sprint2/stripe.router');
const PrivilegeRouter = require('./sprint3/privilege.router');
const ReclamationRouter = require('./sprint4/reclamation.router');
const AvisRouter = require('./sprint4/avis.router');
const GifProductRouter = require('./gifproduct.route.js');
const ProductImagesRouter = require('./productimages_.route.js');
const ContactRouter = require("./contact.router.js");
const LinkRouter = require("./link.router.js");
const LogoRouter = require("./logo.router.js");
const SocialnetRouter = require("./socialnet.router.js");
const AboutUsRouter = require("./2024/aboutus.router.js");
const WhyChooseUsRouter = require("./2024/whyChooseUs.router.js");
const PrivacyPolicy = require('./2024/privacypolicy.route.js');
const FranchiseRouter = require('./franchise.route.js');
const RestauRouter = require('./restau.route.js');
const usefulLinksRouter = require('./2024/usefulLinks.route.js');
const AbonnementfrRouter = require('./abonnementfr.router');
const PaypalRouter = require('./paypalRoutes.js')
const DiscountRouter = require('./sprint4/discount.router.js')
const MessageRouter = require('./message.router.js');

    
router.use(cookieParser());
router.use(passport.initialize());

router.use("/auth", AuthRouter);
router.use("/user", userSpaceRouter);
router.use("/auth", passportRouter);
router.use("/", require("./facebook.router"));
router.use("/request", RequestRouter);
router.use("/category",  CategoryRouter); //auth,
router.use("/menu", MenuRouter); // auth,
router.use("/product",ProductRouter); // auth, 
router.use("/ingredient",  IngredientRouter); //auth,
router.use('/tax', taxRouter);  //auth,
router.use('/help',  helpRequestRouter); //auth,
router.use('/table', TableRouter); //auth,
router.use('/item', itemRouter);
router.use('/cart', CartRouter);
router.use('/order', OrderRouter);
router.use('/restaurant', RestoRouter);
router.use('/contact', ContactRouter);
router.use('/notification', NotifRouter);
router.use('/notification/employee', NotifEmployeeRouter)
router.use('/stripe', StripeRouter);
router.use('/privilege', PrivilegeRouter);
router.use('/reclamation', ReclamationRouter);
router.use('/avis', AvisRouter);
router.use('/gifproduct', GifProductRouter);
router.use('/productimages', ProductImagesRouter);
router.use('/logos', LogoRouter);
router.use('/links', LinkRouter);
router.use('/socialnets', SocialnetRouter);
router.use('/aboutUs', AboutUsRouter);
router.use('/whyChooseUs', WhyChooseUsRouter);
router.use('/privacyPolicy', PrivacyPolicy);
router.use('/franchise', FranchiseRouter);
router.use('/restau', RestauRouter);
router.use('/usefulLinks', usefulLinksRouter);
router.use('/abonnementfr', AbonnementfrRouter);
router.use('/paypal', PaypalRouter);
router.use('/discount',DiscountRouter)
router.use('/messages',MessageRouter)


module.exports = router;