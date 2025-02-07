const express = require('express');
const path = require('path');
const storeService = require('./store-service'); // Import store service module

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Setting up static file serving
app.use(express.static(path.join(__dirname, 'public')));

// Initialize store service before starting the server
storeService.initialize()
    .then(() => {
        console.log("Store service initialized successfully.");

        // Define application routes

        // Route to serve the About page
        app.get('/about', (req, res) => {
            res.sendFile(path.join(__dirname, 'views', 'about.html')); // Ensure correct file path
        });

        // Route to retrieve all available shop items
        app.get('/shop', (req, res) => {
            storeService.getAllItems()
                .then(data => res.json(data))
                .catch(err => res.json({ message: err }));
        });

        // Fetch all published items
        app.get('/items', (req, res) => {
            storeService.getPublishedItems()
                .then(data => res.json(data))
                .catch(err => res.json({ message: err }));
        });

        // Retrieve category list
        app.get('/categories', (req, res) => {
            storeService.getCategories()
                .then(data => res.json(data))
                .catch(err => res.json({ message: err }));
        });

        // Catch-all route for undefined endpoints
        app.use((req, res) => {
            res.status(404).send('Page Not Found');
        });

        // Launch the server
        app.listen(HTTP_PORT, () => {
            console.log(`Server is running on port ${HTTP_PORT}`);
        });
    })
    .catch(err => {
        console.error("Failed to initialize store service:", err);
    });
