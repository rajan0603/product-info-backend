const express = require("express");
const productController = require("../controller/productController");

const router = express.Router();

router.get("/", productController.getAllData);
router.get("/transaction", productController.transactionData);
router.get("/statistics", productController.statisticsData);
router.get("/barchart", productController.barchartData);
router.get("/piechart", productController.piechartData);
router.get("/combine", productController.combineData);


module.exports = router;