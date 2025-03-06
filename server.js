/*********************************************************************************
WEB322 – Assignment 03
I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
No part of this assignment has been copied manually or electronically from any other source
(including 3rd party web sites) or distributed to other students.

Name: Premkumar Patel
Student ID: 169817236
Date: 6 Feb 2025
Replit Web App URL: https://replit.com/@pbpatel/web322-app#package-lock.json
GitHub Repository URL: https://github.com/Prem-Ptl/web322-app
********************************************************************************/

const express = require("express");
const path = require("path");
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

// Middleware to Serve Static Files
app.use(express.static(path.join(__dirname, "public")));

// Enable Express to Parse Form Data
app.use(express.urlencoded({ extended: true }));

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
            res.sendFile(path.join(__dirname, "views", "about.html"));
        });

        // Shop Page (All Published Items)
        app.get("/shop", (req, res) => {
            storeService.getPublishedItems()
                .then(data => res.json(data))
                .catch(err => res.json({ message: err }));
        });

        // All Items (With Query Filters)
        app.get("/items", (req, res) => {
            if (req.query.category) {
                storeService.getItemsByCategory(req.query.category)
                    .then(data => res.json(data))
                    .catch(err => res.json({ message: err }));
            } else if (req.query.minDate) {
                storeService.getItemsByMinDate(req.query.minDate)
                    .then(data => res.json(data))
                    .catch(err => res.json({ message: err }));
            } else {
                storeService.getAllItems()
                    .then(data => res.json(data))
                    .catch(err => res.json({ message: err }));
            }
        });

        // Get Categories
        app.get("/categories", (req, res) => {
            storeService.getCategories()
                .then(data => res.json(data))
                .catch(err => res.json({ message: err }));
        });

        // Get a Single Item by ID
        app.get("/item/:id", (req, res) => {
            storeService.getItemById(req.params.id)
                .then(data => res.json(data))
                .catch(err => res.json({ message: err }));
        });

        // Add Item Page (Form)
        app.get("/items/add", (req, res) => {
            res.sendFile(path.join(__dirname, "views", "addItem.html"));
        });

        // Handle Adding a New Item
        app.post("/items/add", upload.single("featureImage"), (req, res) => {
            if (req.file) {
                let streamUpload = (req) => {
                    return new Promise((resolve, reject) => {
                        let stream = cloudinary.uploader.upload_stream(
                            (error, result) => {
                                if (result) resolve(result);
                                else reject(error);
                            }
                        );
                        streamifier.createReadStream(req.file.buffer).pipe(stream);
                    });
                };

                async function upload(req) {
                    let result = await streamUpload(req);
                    return result;
                }

                upload(req).then((uploaded) => processItem(uploaded.url));
            } else {
                processItem("");
            }

            function processItem(imageUrl) {
                req.body.featureImage = imageUrl;
                storeService.addItem(req.body)
                    .then(() => res.redirect("/items"))
                    .catch(err => res.status(500).json({ message: "Error adding item" }));
            }
        });

        // 404 Page Not Found Handler
        app.use((req, res) => {
            res.status(404).send("Page Not Found");
        });

        // Start Server
        app.listen(HTTP_PORT, () => {
            console.log(`Server is running on port ${HTTP_PORT}`);
        });
    })
    .catch(err => {
        console.error("Failed to initialize store service:", err);
    });
