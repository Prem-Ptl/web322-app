const fs = require('fs'); // Import filesystem module for file operations
const path = require('path'); // Import path module to handle file paths easily

let items = []; // Stores all items from JSON file
let categories = []; // Stores all categories from JSON file

// Function to initialize data by reading JSON files
function initialize() {
    return new Promise((resolve, reject) => {
        // Read categories.json file first
        fs.readFile(path.join(__dirname, 'data', 'categories.json'), 'utf8', (err, data) => {
            if (err) {
                reject("Unable to load categories.json file"); // Handle error while reading categories file
                return;
            }
            categories = JSON.parse(data); // Parse and store categories data
            
            // Read items.json file after categories
            fs.readFile(path.join(__dirname, 'data', 'items.json'), 'utf8', (err, data) => {
                if (err) {
                    reject("Unable to load items.json file"); // Handle error while reading items file
                    return;
                }
                items = JSON.parse(data); // Parse and store items data
                resolve(); // Resolve when both files are successfully read
            });
        });
    });
}

// Function to fetch all available items
function getAllItems() {
    return new Promise((resolve, reject) => {
        if (items.length > 0) {
            resolve(items); // Return items if data exists
        } else {
            reject("No items found"); // Reject if there are no items
        }
    });
}

// Function to retrieve published items only
function getPublishedItems() {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter(item => item.published === true);
        if (publishedItems.length > 0) {
            resolve(publishedItems); // Return published items
        } else {
            reject("No published items available"); // Reject if none are published
        }
    });
}

// Function to fetch all categories
function getCategories() {
    return new Promise((resolve, reject) => {
        if (categories.length > 0) {
            resolve(categories); // Return categories if available
        } else {
            reject("No categories found"); // Reject if none exist
        }
    });
}

// Export functions for external usage
module.exports = {
    initialize,
    getCategories,
    getAllItems,
    getPublishedItems
};
