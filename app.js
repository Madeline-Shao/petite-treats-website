"use strict";
/**
 * @author Madeline Shao
 * Date: 6/8/2021
 * API that returns various information about bakery products and records
 * "Contact us" form submissions.
 *
 * This API supports the following Endpoints:
 * GET /featured
 * GET /products
 * GET /products/:product
 * GET /flavors/:product
 * GET /macaron-flavors
 * GET /box-decorations
 * GET /faq
 * POST /custom-description
 * POST /contact-us
 * Refer to API documentation at https://documenter.getpostman.com/view/16010970/TzeRpVvG
 * for more information.
 */
const express = require("express");
const fs = require("fs/promises");
const mysql = require("promise-mysql");
const multer = require("multer");

const SERVER_ERROR = "The server encountered an error, please try again later.";
const PRODUCT_404_ERR = "Product not found";
const INVALID_QUERY_ERR = "Invalid query parameter(s)";
const DEBUG = false;

const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(multer().none());

/**
 * Returns a list of names of featured products separated by newlines
 * as a plain text response.
 * Example: "Cheesecake\nMini Palmiers\n"
 * Returns a 500 error if something goes wrong on the server.
 */
 app.get("/featured", async (req, res, next) => {
  try {
    let contents = await fs.readFile("featured.txt", "utf8");
    let lines = contents.split("\n");
    for (let i = 0; i < lines.length; i++) {
        lines[i] = formatTitleCase(lines[i]);
    }
    contents = lines.join("\n");
    res.type("text");
    res.send(contents);
  } catch (err) {
    res.status(500);
    err.message = SERVER_ERROR;
    next(err);
  }
});

/**
 * Returns a JSON collection of products that the bakery sells.
 * Filters and sorts the products based on optional query parameters.
 * "sort" query parameter must be either "name" or "price", and "direction" query
 * parameter must be either "asc" or "desc". Ignores casing.
 * Returns a 400 error if the query parameters are invalid.
 * Returns a 500 error if something goes wrong on the server.
 */
app.get("/products", validateProductsQuery, async (req, res, next) => {
  let db;
  try {
    db = await getDB();
    let productsData;
    productsData = await getProductsListFiltered(db, req.query.contains, req.query.sort, req.query.direction);
    db.end();
    res.json(productsData);
  } catch (err) {
    res.status(500);
    err.message = SERVER_ERROR;
    if (db) {
      db.end();
    }
    next(err);
  }
});

/**
 * Returns a JSON object of information about the given product.
 * Returns a 400 error if no product found for the given name.
 * Returns a 500 error if something goes wrong on the server.
 */
app.get("/products/:product", async (req, res, next) => {
  let db;
  try {
    db = await getDB();
    let product = await getProduct(db, formatTitleCase(req.params.product));
    db.end();
    res.json(product[0]);
  } catch (err) {
    if (err.message === PRODUCT_404_ERR) {
      res.status(400);
    } else {
      res.status(500);
      err.message = SERVER_ERROR;
    }
    if (db) {
      db.end();
    }
    next(err);
  }
});

/**
 * Returns a JSON collection of flavors available for the given product.
 * Returns a 400 error if no product found for the given name.
 * Returns a 500 error if something goes wrong on the server.
 */
app.get("/flavors/:product", async (req, res, next) => {
  let db;
  try {
    db = await getDB();
    let productFlavors = await getProductFlavors(db, formatTitleCase(req.params.product));
    let flavors = [];
    for (let i = 0; i < productFlavors.length; i++) {
      flavors.push(productFlavors[i].flavor);
    }
    db.end();
    res.json(flavors);
  } catch (err) {
    if (err.message === PRODUCT_404_ERR) {
      res.status(400);
    } else {
      res.status(500);
      err.message = SERVER_ERROR;
    }
    if (db) {
      db.end();
    }
    next(err);
  }
});

/**
 * Returns a JSON collection of information about each macaron flavor.
 * Returns a 500 error if something goes wrong on the server.
 */
app.get("/macaron-flavors", async (req, res, next) => {
  let db;
  try {
    db = await getDB();
    let flavorData = await getMacaronFlavors(db);
    db.end();
    res.json(flavorData);
  } catch (err) {
    res.status(500);
    err.message = SERVER_ERROR;
    if (db) {
      db.end();
    }
    next(err);
  }
});

/**
 * Returns a list of box decoration styles separated by newlines
 * as a plain text response.
 * Example: "Plain\nBow\nFlower\n"
 * Returns a 500 error if something goes wrong on the server.
 */
app.get("/box-decorations", async (req, res, next) => {
  try {
    let contents = await fs.readFile("box-decorations.txt", "utf8");
    let lines = contents.split("\n");
    for (let i = 0; i < lines.length; i++) {
        lines[i] = formatTitleCase(lines[i]);
    }
    contents = lines.join("\n");
    res.type("text");
    res.send(contents);
  } catch (err) {
    res.status(500);
    err.message = SERVER_ERROR;
    next(err);
  }
});

/**
 * Returns a JSON collection of commonly asked questions and answers.
 * Returns a 500 error if something goes wrong on the server.
 */
app.get("/faq", async (req, res, next) => {
  let db;
  try {
    db = await getDB();
    let faq = await getFAQ(db);
    db.end();
    res.json(faq);
  } catch (err) {
    res.status(500);
    err.message = SERVER_ERROR;
    if (db) {
      db.end();
    }
    next(err);
  }
});

/**
 * Returns a description of the given product, customized with the given flavor
 * and box style as a plain text response.
 * Required POST parameters: product, flavor, box.
 * Returns a 400 error if invalid parameters or no product found for the given name.
 * Returns a 500 error if something goes wrong on the server.
 */
app.post("/custom-description", validateDescParams, async(req, res, next) =>{
  let db;
  try {
    db = await getDB();
    let desc = await getDescription(db, req.body.product);
    desc = desc[0].description.split(" ");
    desc.splice(2, 0, req.body.flavor);
    desc.splice(-1, 0, req.body.box);
    res.type("text");
    res.send(desc.join(" "));
    db.end();
  } catch (err) {
    res.status(500);
    err.message = SERVER_ERROR;
    if (db) {
      db.end();
    }
    next(err);
  }
});

/**
 * Records the submitted form information in the database.
 * Returns a plain text success message if successful.
 * Required POST parameters: name, email, message.
 * Returns a 400 error if submission parameters are invalid.
 * Returns a 500 error if something goes wrong on the server.
 */
app.post("/contact-us", validateForm, async(req, res, next) => {
  let db;
  try {
    db = await getDB();
    await recordMessage(db, req.body.name, req.body.email, req.body.message);
    res.type("text");
    res.send("Message successfully submitted! Thank you!");
    db.end();
  } catch (err) {
    if (db) {
      db.end();
    }
    res.status(500);
    err.message = SERVER_ERROR;
    next(err);
  }
});

/**
 * Returns the collection of product information according to the search/sort parameters
 * as an array of RowDataPackets.
 * @param {Object} db - The database object for connection
 * @param {String} contains - The search parameter. Words should be separated by dashes,
 * not spaces. The returned list of products will only include products that contain this
 * string in their name. If none given, will return all products. Ignores casing
 * @param {String} sort - The attribute to sort by (either "name" or "price"). Must be
 * lowercase.
 * @param {String} direction - The direction in which to sort (either "asc" or "desc"). Must
 * be lowercase.
 * @returns {Object} The collection of product information
 */
async function getProductsListFiltered(db, contains, sort, direction) {
  let query = "SELECT * FROM products WHERE name LIKE ?";
  let words = contains.split("-");
  for (let i = 0; i < words.length - 1; i++) {
    query += " AND name LIKE ?"
    words[i] = "%" + words[i] + "%";
  }
  words[words.length - 1] = "%" + words[words.length - 1] + "%";
  if (sort === "name") {
    query += " ORDER BY name"
  }
  else if (sort === "price") {
    query += " ORDER BY price"
  }
  if (direction === "asc") {
    query += " asc"
  }
  else if (direction === "desc") {
    query += " desc"
  }
  let rows = await db.query(query, words);
  return rows;
}

/**
 * Returns information about the given product as an array of RowDataPackets.
 * Throws an error if the product does not exist in the database.
 * @param {Object} db - The database object for connection
 * @param {String} product - The product name. Words should be separated by spaces. Ignores casing
 * @param {Object} The product information
 */
async function getProduct(db, product) {
  let query = "SELECT * FROM products WHERE name = ?;";
  let rows = await db.query(query, [product]);
  if (rows.length === 0) {
    throw new Error(PRODUCT_404_ERR);
  }
  return rows;
}

/**
 * Returns the flavors available for the given product as an array of RowDataPackets
 * Throws an error if the product does not exist in the database.
 * @param {Object} db - The database object for connection
 * @param {String} product - The product name. Words should be separated by spaces. Ignores casing
 * @returns {Object} The collection of flavors
 */
async function getProductFlavors(db, product) {
  await getProduct(db, product); //Check if product exists
  let query = "SELECT * FROM products_flavors WHERE product = ?;";
  let rows = await db.query(query, [product]);
  return rows;
}

/**
 * Returns a collection of information about macaron flavors as an array of RowDataPackets.
 * @param {Object} db - The database object for connection
 * @returns {Object} The information about macaron flavors
 */
async function getMacaronFlavors(db) {
  let query = "SELECT * FROM macaron_flavors;";
  let rows = await db.query(query);
  return rows;
}

/**
 * Returns a collection of common questions and answers as an array of RowDataPackets.
 * @param {Object} db - The database object for connection
 * @returns {Object} The collection of questions and answers
 */
async function getFAQ(db) {
  let query = "SELECT question, answer FROM faq;";
  let rows = await db.query(query);
  return rows;
}

/**
 * Returns the description about the given product as an array of RowDataPackets.
 * Throws an error if the product does not exist in the database.
 * @param {Object} db - The database object for connection
 * @param {String} product - The product name. Words should be separated by spaces. Ignores casing
 * @returns {Object} The product description
 */
async function getDescription(db, product) {
  let query = "SELECT description FROM products WHERE name=?;";
  let rows = await db.query(query, [product]);
  if (rows.length === 0) {
    throw new Error(PRODUCT_404_ERR);
  }
  return rows;
}

/**
 * Records the given information in the feedback database.
 * @param {Object} db - The database object for connection
 * @param {String} name - The name to record
 * @param {String} email - The email to record
 * @param {String} message - The message to record
 */
async function recordMessage(db, name, email, message) {
  let query = "INSERT INTO feedback(name, email, message) VALUES (?, ?, ?);";
  await db.query(query, [name, email, message]);
}

/**
 * Middleware function to validate the query parameters for the GET /products endpoint.
 * The "sort" parameter must be either "name" or "price", and the "direction" parameter must
 * be either "asc" or "desc". Ignores casing.
 * If any of the "contains", "sort", or "direction" are not given, they will default to
 * "", "name", and "asc", respectively.
 * Returns a 400 error if the parameters are invalid.
 * @param {String} req - The request
 * @param {String} res - The response
 * @param {String} next - The next middleware function
 */
function validateProductsQuery(req, res, next) {
  if (!req.query.contains) {
    req.query.contains = "";
  }
  if (!req.query.sort) {
    req.query.sort = "name";
  }
  if (!req.query.direction) {
    req.query.direction = "asc";
  }
  req.query.contains = formatDashes(req.query.contains);
  req.query.sort = req.query.sort.toLowerCase();
  req.query.direction = req.query.direction.toLowerCase();
  let sort = req.query.sort;
  let direction = req.query.direction;
  if (sort != "name" && sort != "price" || direction != "asc" && direction != "desc") {
    res.status(400);
    next(new Error(INVALID_QUERY_ERR));
  } else {
    next();
  }
}

/**
 * Middleware function to validate the parameters for the POST /custom-description endpoint.
 * The parameters "product", "flavor", and "box" must all exist.
 * Returns a 400 error if the parameters are invalid or if the given product does not exist
 * in the database (ignores casing).
 * @param {String} req - The request
 * @param {String} res - The response
 * @param {String} next - The next middleware function
 */
async function validateDescParams(req, res, next) {
  if (!req.body.product || !req.body.flavor || !req.body.box) {
    res.status(400);
    next(new Error("Missing one or more of the required parameters: product, flavor, box."));
  } else {
    req.body.product = formatTitleCase(req.body.product);
    let db = await getDB();
    let query = "SELECT name FROM products WHERE name=?;";
    let rows = await db.query(query, [req.body.product]);
    db.end();
    if (rows.length === 0) {
      res.status(400);
      next(new Error(PRODUCT_404_ERR));
    } else {
      next();
    }
  }
}

/**
 * Middleware function to validate the parameters for the POST /contact-us endpoint.
 * The parameters "name", "email", and "message" must all exist. The email must contain
 * an "@"."
 * Returns a 400 error if the parameters are invalid.
 * @param {String} req - The request
 * @param {String} res - The response
 * @param {String} next - The next middleware function
 */
function validateForm(req, res, next) {
  if (!req.body.name || !req.body.email || !req.body.message) {
    res.status(400);
    next(new Error("Missing one or more of the required parameters: name, email and message."));
  } else if (!req.body.email.includes("@")) {
    res.status(400);
    next(new Error("Invalid email. Must contain '@'."));
  } else {
    next();
  }
}

/**
 * Establishes a database connection to the ptdb and returns the database object.
 * @returns {Object} - The database object for the connection.
 */
async function getDB() {
  let db = await mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: "root",
    password: "rootroot",
    database: "ptdb"
  });
  return db;
}

/**
 * Takes a title case name and converts it to a dash-separated directory name.
 * Example: formatDashes("Mini Palmiers") returns "mini-palmiers".
 * @param {String} name - name to format
 * @returns {String} - dashed formatted name
 */
function formatDashes(name) {
  let words = name.split(" ");
  let result = words[0].toLowerCase();
  for (let i = 1; i < words.length; i++) {
    let nextWord = words[i];
    result += "-" + nextWord.toLowerCase();
  }
  return result;
}

/**
 * (From lecture).
 * Takes a dash-separated directory name and converts it to a Title Case name.
 * Example: formatTitleCase("mini-palmier") returns "Mini Palmier".
 * @param {String} dirName - directory name to format
 * @returns {String} - Title Case formatted name
 */
function formatTitleCase(dirName) {
  let words = dirName.split("-");
  let firstWord = words[0];
  let result = firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
  for (let i = 1; i < words.length; i++) {
    let nextWord = words[i];
    result += " " + nextWord.charAt(0).toUpperCase() + nextWord.slice(1);
  }
  return result;
}

/**
 * (From lecture).
 * Error-handling middleware that handles different types of errors.
 * Sends error message as plain text.
 */
function errorHandler(err, req, res, next) {
  if (DEBUG) {
    console.error(err);
  }
  res.type("text");
  res.send(err.message);
}

app.use(errorHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT);
