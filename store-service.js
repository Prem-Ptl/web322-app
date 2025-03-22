const fs = require("fs");
const path = require("path");

let items = [];
let categories = [];

// Initialize Data from JSON Files
function initialize() {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, "data", "categories.json"), "utf8", (err, data) => {
            if (err) {
                console.error("Error reading categories.json:", err);
                categories = [];
            } else {
                try {
                    categories = JSON.parse(data);
                } catch (error) {
                    console.error("Invalid JSON format in categories.json:", error);
                    categories = [];
                }
            }

            fs.readFile(path.join(__dirname, "data", "items.json"), "utf8", (err, data) => {
                if (err) {
                    console.error("Error reading items.json:", err);
                    items = [];
                } else {
                    try {
                        items = JSON.parse(data);
                    } catch (error) {
                        console.error("Invalid JSON format in items.json:", error);
                        items = [];
                    }
                }
                resolve();
            });
        });
    });
}

// Get All Items
function getAllItems() {
    return new Promise((resolve, reject) => {
        items.length > 0 ? resolve(items) : reject("No items found");
    });
}

// Get Only Published Items
function getPublishedItems() {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter(item => item.published === true);
        publishedItems.length > 0 ? resolve(publishedItems) : reject("No published items available");
    });
}

// Get All Categories
function getCategories() {
    return new Promise((resolve, reject) => {
        categories.length > 0 ? resolve(categories) : reject("No categories found");
    });
};

// Add a New Item and Save to File
function addItem(itemData) {
    return new Promise((resolve, reject) => {
        if (!itemData.name || !itemData.category || !itemData.postDate || !itemData.description) {
            reject("Invalid item data. Missing required fields.");
            return;
        }

        itemData.published = itemData.published === "on"; // Ensure Boolean value
        itemData.id = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;

        // Add the new item
        items.push({
            id: itemData.id,
            name: itemData.name,
            category: itemData.category,
            postDate: itemData.postDate,
            featureImage: itemData.featureImage || "", 
            published: itemData.published,
            description: itemData.description 
        });

        // Save updated items to items.json
        fs.writeFile(path.join(__dirname, "data", "items.json"), JSON.stringify(items, null, 4), "utf8", (err) => {
            if (err) {
                reject("Error saving new item");
                return;
            }
            resolve(itemData);
        });
    });
}

// Get Items by Category
function getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        console.log("Filtering category:", category);

        const filteredItems = items.filter(item => Number(item.category) === Number(category));
        
        console.log("Found items:", filteredItems);

        filteredItems.length > 0 ? resolve(filteredItems) : reject("No items found in this category");
    });
}


// Get Items by Minimum Date
function getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        let minDate = new Date(minDateStr);
        if (isNaN(minDate.getTime())) {
            reject(`Invalid date format: '${minDateStr}'. Use YYYY-MM-DD format.`);
            return;
        }
        const filteredItems = items.filter(item => new Date(item.postDate) >= minDate);
        filteredItems.length > 0 ? resolve(filteredItems) : reject(`No items found after ${minDateStr}`);
    });
}

// Get Item by ID
function getItemById(id) {
    return new Promise((resolve, reject) => {
        const item = items.find(item => item.id == id);
        item ? resolve(item) : reject("No result returned");
    });
}

// Export Functions
module.exports = {
    initialize,
    getCategories,
    getAllItems,
    getPublishedItems,
    addItem,
    getItemsByCategory,
    getItemsByMinDate,
    getItemById
};
