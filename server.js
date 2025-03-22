/*********************************************************************************
WEB322 – Assignment 04
I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
No part of this assignment has been copied manually or electronically from any other source
(including 3rd party web sites) or distributed to other students.

Name: Premkumar Patel
Student ID: 169817236
Date: 18 March 2025
Replit Web App URL: https://replit.com/@pbpatel/web322-app#package-lock.json
GitHub Repository URL: https://github.com/Prem-Ptl/web322-app
********************************************************************************/

const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const storeService = require("./store-service");

// Multer, Cloudinary, and Streamifier for Image Upload
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// Cloudinary Configuration (Replace with Your Credentials)
cloudinary.config({
    cloud_name: "Cloud Name",
    api_key: "API Key",
    api_secret: "API Secret",
    secure: true
});

const upload = multer(); 

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Set Handlebars as View Engine
app.engine(".hbs", exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
        navActive: (path, currentPath) => (path === currentPath ? "active" : ""),
        formatDate: (date) => new Date(date).toDateString()
    }
}));
app.set("view engine", ".hbs");

// Middleware to Serve Static Files
app.use(express.static(path.join(__dirname, "public")));

// Enable Express to Parse Form Data
app.use(express.urlencoded({ extended: true }));

// Middleware to Pass Current Path to Handlebars
app.use((req, res, next) => {
    res.locals.currentPath = req.path;
    next();
});

// Initialize store service before starting the server
storeService.initialize()
    .then(() => {
        console.log("Store service initialized successfully.");

        // Home Page Redirect
        app.get("/", (req, res) => {
            res.redirect("/about");
        });

        // About Page
        app.get("/about", (req, res) => {
            res.render("about");
        });

        // Shop Page (All Published Items)
        app.get("/shop", (req, res) => {
            storeService.getPublishedItems()
                .then(items => res.render("shop", { items }))
                .catch(err => res.render("shop", { message: "No items available." }));
        });

        // View Single Shop Item
        app.get("/shop/:id", (req, res) => {
            storeService.getItemById(req.params.id)
                .then(item => res.render("shop", { item }))
                .catch(err => res.render("shop", { message: "Item not found." }));
        });

        // All Items (With Query Filters)
        app.get("/items", (req, res) => {
            if (req.query.category) {
                storeService.getItemsByCategory(req.query.category)
                    .then(items => res.render("items", { items }))
                    .catch(err => res.render("items", { message: `No items found in category ${req.query.category}` }));
            } else if (req.query.minDate) {
                storeService.getItemsByMinDate(req.query.minDate)
                    .then(items => res.render("items", { items }))
                    .catch(err => res.render("items", { message: `No items found after ${req.query.minDate}` }));
            } else {
                storeService.getAllItems()
                    .then(items => res.render("items", { items }))
                    .catch(err => res.render("items", { message: "No items found." }));
            }
        });

        // Get Categories
        app.get("/categories", (req, res) => {
            console.log("Category Query:", req.query.category); 
        
            if (req.query.category) {
                storeService.getItemsByCategory(req.query.category)
                    .then(items => {
                        console.log("Filtered Items:", items); 
                        res.render("categories", { items });
                    })
                    .catch(err => {
                        console.log("Error:", err); 
                        res.render("categories", { message: `No items found in this category.` });
                    });
            } else {
                storeService.getCategories()
                    .then(categories => res.render("categories", { categories }))
                    .catch(err => res.render("categories", { message: "No categories found." }));
            }
        });
        

        // Get a Single Item by ID
        app.get("/item/:id", (req, res) => {
            storeService.getItemById(req.params.id)
                .then(item => res.render("items", { item }))
                .catch(err => res.render("items", { message: "No item found." }));
        });

        // Add Item Page (Form)
        app.get("/items/add", (req, res) => {
            res.render("addItem");
        });

        // Handle Adding a New Item
        app.post("/items/add", upload.single("featureImage"), async (req, res) => {
            try {
                let imageUrl = "";
                if (req.file) {
                    const streamUpload = (req) => {
                        return new Promise((resolve, reject) => {
                            let stream = cloudinary.uploader.upload_stream(
                                (error, result) => (result ? resolve(result) : reject(error))
                            );
                            streamifier.createReadStream(req.file.buffer).pipe(stream);
                        });
                    };
                    const uploaded = await streamUpload(req);
                    imageUrl = uploaded.url;
                }
                req.body.featureImage = imageUrl;
                await storeService.addItem(req.body);
                res.redirect("/items");
            } catch (error) {
                res.status(500).json({ message: "Error adding item" });
            }
        });

        // 404 Page Not Found Handler
        app.use((req, res) => {
            res.status(404).render("404");
        });

        // Start Server
        app.listen(HTTP_PORT, () => {
            console.log(`Server is running on port ${HTTP_PORT}`);
        });
    })
    .catch(err => {
        console.error("Failed to initialize store service:", err);
    });
