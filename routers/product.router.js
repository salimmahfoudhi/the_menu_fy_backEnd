const express = require("express");
const router = express.Router();
const multer = require("multer");

const _ = require("../controllers/product.controller");
const path = require("path");
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/svg": "svg",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const destinationPath = path.join(__dirname, "../uploads/product");
    callback(null, destinationPath);
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name);
  },
});

const upload = multer({ storage: storage });
//const uploadMultiple = multer({ storage: storage }).array("photos", 5); // 'photos' is the field name, 5 is the maximum number of files
// const uploadGif = multer({ storage: storage }).single("gif_");

router.post(
  "/add/:categoryFK",
  [upload.single("img"), upload.array("imgs", 5), upload.single("gif")],
  _.addNew
);
router.post(
  "/create",
  upload.single("photo"),
  //[upload.single("photo"), upload.array("photos", 5), upload.single("gif_")],
  _.createNew
);
router.get("/retrieve", _.retrieveAll);
router.get("/fetch/enable", _.retrieveWhereVisibilityIsEqualToENABLE);
router.get("/fetch/disable", _.retrieveWhereVisibilityIsEqualToDISABLE);
router.get("/find/item/:id", _.retrieveById);
router.delete("/delete/:id", _.deleteById);
router.post('/byCategories', _.retrieveByCategoryIds);
router.get("/products/:category", _.fetchProductIdsByCategory);
router.get('/getByname/:name', _.getProductByName);



router.put(
  "/update/:id",
  upload.single("photo"),
  (req, res) => _.updateById(req, res)
);

//router.put ('/update/:id',[upload.single("photo"),upload.array("photos",5),upload.single("gif_")], _.updateById);
router.put("/update/enable/visibility/:id", _.enableProductById);
router.put("/update/disable/visibility/:id", _.disableProductById);
//router.put('/update/photo/:id',upload,_.updatePhotoById);
router.get(
  "/retrieve/enabled/products/category/:categoryFK",
  _.retrieveEnabledProductsByCategory
);





////////////web///////
router.get('/products/:productId/similar', _.similarProducts);
router.post('/users/:userId/wishlist/:productId', _.addProductToWishList);
router.get('/users/:userId/wishlist',_.getUserWishList);
router.get('/menu/:id/products', _.retrieveAllByMenu);
router.get("/retrieve", _.retrieveAll);
router.get("/fetch/enable", _.retrieveWhereVisibilityIsEqualToENABLE);
router.get("/fetch/disable", _.retrieveWhereVisibilityIsEqualToDISABLE);
router.get("/find/item/:id", _.retrieveById);
router.get("/find/by/menu/:id", _.retrieveByProductId);
router.delete("/delete/:id", _.deleteById);
router.get("/retrieveProductsByMenu", _.retrieveProductsByMenu);
router.get('/products/filter', _.filterProductsByPrice);
router.get ('/retrieveallbymenu/:id', _.retrieveAllByMenu);
router.post('/wishlist/toggle/:userId/:productId', _.toggleWishlist);

module.exports = router;
   
