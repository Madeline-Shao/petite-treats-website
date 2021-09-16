/*
 * Name: Madeline Shao
 * Date: 6/8/21
 *
 * Database to store information for a bakery e-commerce store.
 * Tables:
 * products - Information about products that the store sells (includes name, price,
 *            description, image url)
 * macaron_flavors - Information about macaron flavors (includes name, description,
 *                   image url)
 * products_flavors - Associates products with their available flavors
 * feedback - Stores feedback submitted by customers (requires name, email, message)
 * faq - Contains commonly asked questions and their answers
 */

CREATE DATABASE IF NOT EXISTS ptdb;
USE ptdb;

DROP TABLE IF EXISTS products_flavors;
DROP TABLE IF EXISTS macaron_flavors;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS faq;

CREATE TABLE products(
  name  VARCHAR(255) PRIMARY KEY,
  price  INT NOT NULL,
  description TEXT NOT NULL,
  image VARCHAR(255) NOT NULL
);

CREATE TABLE macaron_flavors(
  name VARCHAR(255) PRIMARY KEY,
  description TEXT NOT NULL,
  image VARCHAR(255) NOT NULL
);

CREATE TABLE products_flavors(
  product      VARCHAR(255) NOT NULL,
  flavor        VARCHAR(255) NOT NULL,
  PRIMARY KEY (product, flavor),
  FOREIGN KEY (product) REFERENCES products(name) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE feedback(
  email VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL
);

CREATE TABLE faq(
  id  INT PRIMARY KEY AUTO_INCREMENT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL
);

INSERT INTO products(name, price, description, image) VALUES
("Cheesecake", 7, "One homemade cheesecake, four inches in diameter. Each cheesecake is
 packaged in a beautiful handcrafted box.", "imgs/cheesecake-original.jpg"),
("Macarons (6 pcs)", 10.25, "Six homemade macarons, freshly baked. Each set is packaged in
 a beautiful handcrafted box.", "imgs/macarons-6pcs.jpg"),
("Macarons (12 pcs)", 20, "Twelve homemade macarons, freshly baked. Each set is packaged in
 a beautiful handcrafted box.", "imgs/macarons-12pcs.jpg"),
("Mini Palmiers", 8, "Ten homemade palmiers made from flaky, buttery puff pastry. Each set
 is packaged in a beautiful handcrafted box.",
 "imgs/mini-palmiers.jpg"),
("Imperfect Macarons", 7, "Six homemade macarons that have visual imperfections such
 as cracks in the shell. Still taste delicious! Each set is packaged in a beautiful handcrafted
 box.", "imgs/imperfect-macarons.jpg"),
("Wagashi", 3.5, "One homemade wagashi, freshly made. Wagashi are traditional Japanese confections
  made with sweet bean paste. At Petite Treats, we shape our wagashi by hand into creative
  designs and fill them with flavored mochi. Each wagashi is packaged in a beautiful handcrafted
  box.",
 "imgs/wagashi.jpg"),
("Cookies", 2, "Three homemade cookies, freshly baked. Each set is packaged in
 a beautiful handcrafted box.", "imgs/cookies.jpg"),
("Brownies", 2, "Two homemade brownies, freshly baked. Each set is packaged in
 a beautiful handcrafted box.", "imgs/brownies.jpg"),
("Cake Pops", 2, "Three homemade cake pops, freshly baked. Each set is packaged in
 a beautiful handcrafted box.", "imgs/cake-pops.jpg"),
("Truffles", 5, "Six homemade truffles made from high quality chocolate. Each set is packaged in
 a beautiful handcrafted box.", "imgs/truffles.jpg"),
("Rice Krispies", 2, "Two homemade Rice Krispy treats, freshly baked. Each set is packaged in
 a beautiful handcrafted box.", "imgs/rice-krispies.jpg"),
("Sweet Bread", 5, "One homemade sweet bread, freshly baked. Each sweet bread is packaged in
 a beautiful handcrafted box.", "imgs/sweet-bread.jpg"),
("Cupcakes", 3, "Four homemade cupcakes, freshly baked. Each set is packaged in
 a beautiful handcrafted box.", "imgs/cupcakes.jpg"),
("Cake", 10, "One homemade cake, freshly baked. Each cake is packaged in
 a beautiful handcrafted box.", "imgs/cake.jpg"),
("Pie", 10, "One homemade pie, six inches in diameter. Each pie is packaged in
 a beautiful handcrafted box.", "imgs/pie.jpg");

INSERT INTO macaron_flavors(name, description, image) VALUES
("Chocolate", "Filled with decadent chocolate ganache and topped with a smooth melted
 chocolate drizzle.", "imgs/chocolate-macaron.jpg"),
("Mango", "Filled with mango Italian meringue buttercream dipped in toasted coconut, topped
  with osmanthus.", "imgs/mango-macaron.jpg"),
("Rose", "Filled with rose petal jam and Italian meringue buttercream, sprinkled with edible
rose blossoms.", "imgs/rose-macaron.jpg"),
("Vanilla", "Filled with traditional Madagascar vanilla buttercream, hand-painted with detailed
illustrations.", "imgs/vanilla-macaron.jpg");


INSERT INTO products_flavors(product, flavor) VALUES
("Cheesecake", "Original"),
("Cheesecake", "Chocolate"),
("Macarons (6 pcs)", "Chocolate"),
("Macarons (6 pcs)", "Mango"),
("Macarons (6 pcs)", "Rose"),
("Macarons (6 pcs)", "Vanilla"),
("Macarons (12 pcs)", "Chocolate"),
("Macarons (12 pcs)", "Mango"),
("Macarons (12 pcs)", "Rose"),
("Macarons (12 pcs)", "Vanilla"),
("Mini Palmiers", "Cinnamon"),
("Mini Palmiers", "Sesame"),
("Imperfect Macarons", "Chocolate"),
("Imperfect Macarons", "Mango"),
("Imperfect Macarons", "Rose"),
("Imperfect Macarons", "Vanilla"),
("Wagashi", "Matcha"),
("Wagashi", "Sesame"),
("Cookies", "Chocolate Chip"),
("Cookies", "Snickerdoodle"),
("Brownies", "Chocolate"),
("Brownies", "Caramel"),
("Cake Pops", "Lemon"),
("Cake Pops", "Raspberry"),
("Cake Pops", "Coffee"),
("Truffles", "Dark Chocolate"),
("Truffles", "Raspberry"),
("Rice Krispies", "Chocolate"),
("Rice Krispies", "Plain"),
("Sweet Bread", "Chocolate"),
("Sweet Bread", "Cinnamon"),
("Cupcakes", "Red Velvet"),
("Cupcakes", "Vanilla"),
("Cupcakes", "Butterscotch"),
("Cake", "Chocolate"),
("Cake", "Red Velvet"),
("Pie", "Pumpkin"),
("Pie", "Chocolate Cream");

INSERT INTO faq (question, answer) VALUES
("Do you do delivery?", "Unfortunately, we do not currently offer delivery at the moment."),
("Where do I pick up my order?", "Please pick up your order at 1234 Main Street."),
("Can I pick up at a time outside of scheduled store hours?", "Just let us know in your order
 notes or with the Contact Us form! We are usually very flexible with pick up times."),
("What payment options do you offer?", "You can pay with Paypal or Venmo at checkout, or you
can pay with cash when you pick up your order."),
("Are your products made-to-order?", "Yes! Our treats are made the day of your pick up date.
 This means we can usually accommadate any customizations you request. :)");
