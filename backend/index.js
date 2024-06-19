const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const Product = require("./components/Model/Product");
const axios =  require("axios");
const productRoute = require("./components/Routes/productRoute");

const app = express();
const PORT = process.env.PORT;
const URI = process.env.URI;

app.use(express.json());
app.use(cors());

const fetchProduct = async () => {
    try{
        const { data } = await axios('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        await Product.deleteMany({});
        await Product.insertMany(data);
        console.log('Database seeded successfully');
    }
    catch(error){
        console.log("Get error", error.message);
    }
};

fetchProduct();

app.use("/api/product", productRoute);

mongoose.connect(URI)
.then(() => console.log("Connect with database",URI))
.catch((error) => console.log("Catch error", error));

app.listen(PORT, ()=> {
    console.log("Listen on port...", PORT);
});