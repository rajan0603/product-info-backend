const Product = require("../Model/Product");
const axios = require("axios");

const getAllData = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const transactionData =  async(req,res) => {
    const { search = '', page = 1, perPage = 10, month } = req.query;
    console.log(req.query);
    const query = {};
    
    if (month) {
        query.dateOfSale = {
            $gte: new Date(`2022-${month}-01`),
            $lt: new Date(`2022-${month}-01`).setMonth(new Date(`2022-${month}-01`).getMonth() + 1)
        };
    }

    if (search) {
        const regex = new RegExp(search, 'i');
        const orQuery = [
            { title: regex },
            { description: regex }
        ];

        // Check if search can be converted to a number
        const searchAsNumber = Number(search);
        if (!isNaN(searchAsNumber)) {
            orQuery.push({ price: searchAsNumber });
        }

        query.$or = orQuery;
    }

    try {
        const products = await Product.find(query)
            .skip((page - 1) * perPage)
            .limit(Number(perPage));

        const total = await Product.countDocuments(query);

        res.json({
            products,
            currentPage: Number(page),
            totalPages: Math.ceil(total / perPage)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const statisticsData = async(req,res) => {
    const { month } = req.query;
    if (!month) return res.status(400).json({ error: "Month is required" });

    const query = {
        dateOfSale: {
            $gte: new Date(`2022-${month}-01`),
            $lt: new Date(`2022-${month}-01`).setMonth(new Date(`2022-${month}-01`).getMonth() + 1)
        }
    };

    try {
        const products = await Product.find(query);
        const totalSaleAmount = products.reduce((acc, product) => acc + (product.sold ? product.price : 0), 0);
        const totalSoldItems = products.filter(product => product.sold).length;
        const totalNotSoldItems = products.filter(product => !product.sold).length;

        res.json({
            totalSaleAmount,
            totalSoldItems,
            totalNotSoldItems
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const barchartData = async(req,res) => {
    const { month } = req.query;
    if (!month) return res.status(400).json({ error: "Month is required" });

    const query = {
        dateOfSale: {
            $gte: new Date(`2022-${month}-01`),
            $lt: new Date(`2022-${month}-01`).setMonth(new Date(`2022-${month}-01`).getMonth() + 1)
        }
    };

    try {
        const products = await Product.find(query);
        const priceRanges = {
            '0-100': 0,
            '101-200': 0,
            '201-300': 0,
            '301-400': 0,
            '401-500': 0,
            '501-600': 0,
            '601-700': 0,
            '701-800': 0,
            '801-900': 0,
            '901-above': 0
        };

        products.forEach(product => {
            if (product.price <= 100) priceRanges['0-100']++;
            else if (product.price <= 200) priceRanges['101-200']++;
            else if (product.price <= 300) priceRanges['201-300']++;
            else if (product.price <= 400) priceRanges['301-400']++;
            else if (product.price <= 500) priceRanges['401-500']++;
            else if (product.price <= 600) priceRanges['501-600']++;
            else if (product.price <= 700) priceRanges['601-700']++;
            else if (product.price <= 800) priceRanges['701-800']++;
            else if (product.price <= 900) priceRanges['801-900']++;
            else priceRanges['901-above']++;
        });

        res.json(priceRanges);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const piechartData = async(req,res) => {
    const { month } = req.query;
    if (!month) return res.status(400).json({ error: "Month is required" });

    const query = {
        dateOfSale: {
            $gte: new Date(`2022-${month}-01`),
            $lt: new Date(`2022-${month}-01`).setMonth(new Date(`2022-${month}-01`).getMonth() + 1)
        }
    };

    try {
        const products = await Product.find(query);
        const categoryCounts = {};

        products.forEach(product => {
            if (!categoryCounts[product.category]) {
                categoryCounts[product.category] = 1;
            } else {
                categoryCounts[product.category]++;
            }
        });

        res.json(categoryCounts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const combineData = async(req,res) => {
    const { month } = req.query;
    if (!month) return res.status(400).json({ error: "Month is required" });

    try {
        const [transactionsResponse, statisticsResponse, barChartResponse, pieChartResponse] = await Promise.all([
            axios.get(`https://product-info-backend.onrender.com/api/product/transaction?month=${month}`),
            axios.get(`https://product-info-backend.onrender.com/api/product/statistics?month=${month}`),
            axios.get(`https://product-info-backend.onrender.com/api/product/barchart?month=${month}`),
            axios.get(`https://product-info-backend.onrender.com/api/product/piechart?month=${month}`)
        ]);

        res.json({
            transactions: transactionsResponse.data,
            statistics: statisticsResponse.data,
            barChart: barChartResponse.data,
            pieChart: pieChartResponse.data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




module.exports = {getAllData, transactionData, statisticsData, barchartData, piechartData, combineData};

