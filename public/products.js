/**
 * @author: Madeline Shao
 * Date: 6/9/21
 *
 * Implements functionality for the products page of the Petite Treats website.
 * Dynamically loads data about the products from an API to display on the
 * products section. The user search and sort the products, view more information about a
 * single item and add items to their cart.
 */
(function() {
  "use strict";

  const BASE_URL = "/";

  /**
   * Sets up the products section and initial document event handlers.
   */
  function init() {
    initializeMenu();
    id("cart-btn").addEventListener("click", goToCart);
    id("go-btn").addEventListener("click", updateMenu);
  }

  /**
   * Fills the Products section of the page with item cards for each products
   * using data from an API:
   * <section id="product-list-view">
   *  <article>...</article>
   *  <article>...</article>
   * </section>
   * Displays an error message if there is an error loading
   * the data.
   */
  async function initializeMenu() {
    id("results").textContent = "Response Loading...";
    try {
      let menu = await fetch(BASE_URL + "products");
      checkStatus(menu);
      let menuJson = await menu.json();
      id("results").textContent = "";
      for (let i = 0; i < menuJson.length; i++) {
        let card = createCard(menuJson[i]);
        id("product-list-view").appendChild(card);
      }
    }
    catch {
      handleRequestError();
    }
  }

  /**
   * Fills the Products section with item cards according to the search and sort parameters
   * using data from an API.
   * <section id="product-list-view">
   *  <article>...</article>
   *  <article>...</article>
   * </section>
   * Displays an error message if there is an error loading the data.
   */
  async function updateMenu() {
    id("results").textContent = "Response Loading...";
    let query = formatDashes(id("search").value);
    try {
      let menu = await fetch(BASE_URL + "products?contains=" + query + "&sort=" +
                             id("sort-by").value + "&direction=" + qs("input:checked").value);
      checkStatus(menu);
      let menuJson = await menu.json();
      id("product-list-view").innerHTML = "";
      if (menuJson.length === 0) {
        id("results").textContent = "No products found matching '" + id("search").value + "'.";
      } else {
        id("results").textContent = "";
        for (let i = 0; i < menuJson.length; i++) {
          let card = createCard(menuJson[i]);
          id("product-list-view").appendChild(card);
        }
      }
    }
    catch {
      handleRequestError();
    }
  }

  /**
   * Switches to single item view where the item is displayed on its own in greater detail.
   * The user can customize the item and add the item to their cart.
   * Displays an error message if there is an error loading the data.
   * @param {Object} evt - The event object
   */
  async function viewItem(evt) {
    id("single-item-view").innerHTML = "";
    id("results").textContent = "Response Loading...";
    let name = evt.target.parentNode.children[0].textContent;
    try {
      let resp = await fetch(BASE_URL + "products/" + formatDashes(name));
      checkStatus(resp);
      let product = await resp.json();
      let card = await createSingleViewCard(product);
      id("single-item-view").appendChild(card);
      id("results").textContent = "";
      toggleView();
    } catch {
      handleRequestError();
    }
  }

  /**
   * Changes the description of the single view item card depending on what
   * customizations the user selects.
   * Displays an error message if there is an error loading the data.
   */
  async function changeDesc() {
    id("results").textContent = "Response Loading...";
    let name = id("product-name").textContent;
    let flavor = id("flavor-select").value;
    let box = id("box-select").value;
    try {
      let newDesc = await getCustomDesc(name, flavor, box);
      id("description").textContent = newDesc;
      id("results").textContent = "";
    } catch {
      handleRequestError();
    }
  }

  /**
   * Checks if the input quantity value is valid. If so, prevents default behavior and
   * adds selected item, its customizations, and its price to the cart in the browser session
   * storage and switches to cart view.
   * Example value of session storage key "cart" :
   *  [{ name : "Cake",
   *     price: 10,
   *     customizations: [{flavor: "Chocolate", box : "Plain"},
   *                      {flavor: "Vanilla", box : "Flower"}]
   *   },
   *   { name : "Brownies",
   *     price: 2,
   *     customizations: [{flavor: "Chocolate", box : "Bow"}]
   *   }
   *  ]
   * @param {Object} evt - The event object.
  */
  function addCart(evt) {
    let qty = parseInt(id("qty-input").value);
    if (qty < id("qty-input").min || qty > id("qty-input").max || !qty) {
      return;
    }
    evt.preventDefault();
    let cart= JSON.parse(window.sessionStorage.getItem("cart"));
    if (!cart) {
      cart = [];
    }
    cart = updateCart(cart);
    window.sessionStorage.setItem("cart", JSON.stringify(cart));
    goToCart();
  }

  /**
   * Returns an article with information about a product and a button to view more
   * information about the item.
   * @param {object} product - A JSON object containing information
   * about a product:
   * { name : "Cheesecake",
   *   price: 7,
   *   description: "A delicious cheesecake.",
   *   image : "imgs/cheesecake.jpg"}
   * @returns {DOMobject} - DOM object for the item card:
   * <article>
   *   <h2>Cheesecake</h2>
   *   <p>$7.00</p>
   *   <img src="imgs/cheesecake.jpg" alt="Cheescake" />
   *   <p>A delicious cheesecake.</p>
   *   <button class="view-item-btn">View Item</button>
   * </article>
   */
  function createCard(product) {
    let article = gen("article");
    let heading = gen("h2");
    heading.textContent = product.name;
    let price = gen("p");
    price.textContent = "$" + product.price.toFixed(2);
    price.id = "price";
    let img = gen("img");
    img.src = product.image;
    img.alt = product.name;
    let button = gen("button");
    button.addEventListener("click", viewItem);
    button.classList.add = "view-item-btn";
    button.textContent = "View Item";
    article.appendChild(heading);
    article.appendChild(price);
    article.appendChild(img);
    article.appendChild(button);
    return article;
  }

  /**
   * Returns an article with information about a product, a button to return to the products page,
   * two dropdowns to select a flavor and box style, a numerical input box to choose the
   * quantity (minimum 1, maximum 10), and a button to add the product to the cart. The
   * description dynamically updates depending on the customizations chosen.
   * @param {object} product - A JSON object containing information
   * about a product:
   * { name : "Cheesecake",
   *   price: 7,
   *   description: "A delicious cheesecake.",
   *   image : "imgs/cheesecake.jpg"}
   * @returns {DOMobject} - DOM object for the item card:
   * <article id="single-view-card">
   *   <button id="single-view-back-btn">Back To Products</button>
   *   <h2 id="product-name">Cheesecake</h2>
   *   <p id="single-view-price">$7.00</p>
   *   <img src="imgs/cheesecake.jpg" alt="Cheescake" />
   *   <p id="description">A homemade original cheesecake, packaged in a flower box.</p>
   *   <form id="customizations-form">
   *     <div id="customizations">
   *       <label>Flavor:
   *         <select id="flavor-select">
   *           <option value="caramel">Caramel</option>
   *           <option value="chocolate">Chocolate</option>
   *         </select>
   *       </label>
   *       <label>Box Decoration:
   *         <select id="box-select">
   *           <option value="plain">Plain</option>
   *           <option value="bow">Bow</option>
   *           <option value="flower">Flower</option>
   *         </select>
   *       </label>
   *       <label>Quantity: <input type="number" id="qty-input" min="1" max="10"></label>
   *     </div>
   *     <button type="submit">Add To Cart</button>
   *   </form>
   * </article>
   */
  async function createSingleViewCard(product) {
    let article = createCard(product);
    article.id = "single-view-card";
    article.removeChild(article.children[article.children.length - 1]);
    article.children[0].id = "product-name";
    article.children[1].id = "single-view-price";
    article.insertBefore(createBackButton(), article.children[0]);
    let flavorLabel = gen("label");
    flavorLabel.textContent = "Flavor: ";
    let flavorSelect = await createCustomizationSelect(product.name, "flavor", getFlavors);
    let boxLabel = gen("label");
    boxLabel.textContent = "Box Decoration: ";
    let boxSelect = await createCustomizationSelect(product.name, "box", getBoxDecorations);
    let qtyLabel = gen("label");
    qtyLabel.textContent = "Quantity: ";
    let qtyInput = createQtyInput();
    let customDesc = await getCustomDesc(article.children[1].textContent, flavorSelect.value,
                                         boxSelect.value);
    let description = gen("p");
    description.id = "description";
    description.textContent = customDesc;
    flavorLabel.appendChild(flavorSelect);
    boxLabel.appendChild(boxSelect);
    qtyLabel.appendChild(qtyInput);
    let form = createCustomizationsForm(flavorLabel, boxLabel, qtyLabel);
    article.appendChild(description);
    article.appendChild(form);
    return article;
  }

  /**
   * Creates the customizations form with the given customization options and the add
   * to cart button.
   * @param {DOMObject} flavorLabel - The label containing the flavor select
   * @param {DOMObject} boxLabel - The label containing the box select
   * @param {DOMObject} qtyLabel - The label containing the quantity input
   * @returns {DOMObject} A form DOM Object
   * <form id="customizations-form">
   *   <div id="customizations">
   *     <label>...</label>
   *     <label>...</label>
   *     <label>...</label>
   *   </div>
   *   <button type="submit">Add To Cart</buttons>
   * </form>
   */
  function createCustomizationsForm(flavorLabel, boxLabel, qtyLabel) {
    let customizations = gen("div");
    customizations.id = "customizations";
    let form = gen("form");
    form.id = "customizations-form";
    customizations.appendChild(flavorLabel);
    customizations.appendChild(boxLabel);
    customizations.appendChild(qtyLabel);
    form.appendChild(customizations);
    form.appendChild(createAddCartButton());
    return form;
  }

  /**
   * Creates the "Back To Products" button that allows the user to return to the product
   * list page.
   * @returns {DOMObject} The button to return to the product list page
   * <button id="single-view-back-btn">Back To Products</button>
   */
  function createBackButton() {
    let backButton = gen("button");
    backButton.addEventListener("click", toggleView);
    backButton.textContent = "Back To Products";
    backButton.id = "single-view-back-btn";
    return backButton;
  }

  /**
   * Creates the "Add To Cart" button that allows the user to add an item to their cart.
   * @returns {DOMObject} The button to add items to the cart
   * <button type="submit">Add To Cart</button>
   */
  function createAddCartButton() {
    let cartButton = gen("button");
    cartButton.addEventListener("click", addCart);
    cartButton.classList.add = "add-cart-btn";
    cartButton.textContent = "Add To Cart";
    cartButton.type = "submit";
    return cartButton
  }

  /**
   * Creates the <input> DOM element that allows the user to input a numerical value
   * from 1 to 10 inclusive.
   * @returns {DOMObject} DOM object for quantity input
   * <input type="number" id="qty-input" min="1" max="10">
   */
  function createQtyInput() {
    let qtyInput = gen("input");
    qtyInput.type = "number";
    qtyInput.id = "qty-input";
    qtyInput.min = 1;
    qtyInput.max = 10;
    qtyInput.value = 1;
    return qtyInput;
  }

 /**
  * Creates the <select> DOM element for the given product and customization type.
  * @param {String} productName - The name of the product
  * @param {String} customization - The type of customization (ex: "flavor" or "box")
  * @param {Function} getFunc - The function to get the available options for given product
  * of the given customization type
  * @returns {DOMObject} DOM object for the customization selection. Ex:
  * <select id="box-select">
  *   <option value="plain">Plain</option>
  *   <option value="bow">Bow</option>
  *   <option value="flower">Flower</option>
  * </select>
  */
  async function createCustomizationSelect(productName, customization, getFunc) {
    let select = gen("select");
    select.id = customization + "-select";
    select.addEventListener("change", changeDesc);
    let options = await getFunc(productName);
    for (let i = 0; i < options.length; i++) {
      let option = gen("option");
      option.value = options[i].toLowerCase();
      option.textContent = formatTitleCase(options[i]);
      select.appendChild(option);
    }
    return select;
  }

  /**
   * Updates the given cart with the selected product and its customizations.
   * @param {Object} cart - The original cart
   * @returns {Object} The updated cart
   * The original and updated cart should be in this format:
   * [{ name : "Cake",
   *     price: 10,
   *     customizations: [{flavor: "Chocolate", box : "Plain"},
   *                      {flavor: "Vanilla", box : "Flower"}]
   *   },
   *   { name : "Brownies",
   *     price: 2,
   *     customizations: [{flavor: "Chocolate", box : "Bow"}]
   *   }
   *  ]
   */
  function updateCart(cart) {
    let qty = parseInt(id("qty-input").value);
    let name = id("product-name").textContent;
    let customizations = { "flavor" : formatTitleCase(id("flavor-select").value),
                            "box" : formatTitleCase(id("box-select").value)};
    let item = null;
    for (let i = 0; i < cart.length; i++) {
      if (cart[i].name === name) {
        item = cart.splice(i, 1)[0];
      }
    }
    if (!item) {
      item = {"name" : name,
              "price" : parseFloat(id("single-view-price").textContent.slice(1)),
              "customizations" : []};
    }
    for (let j = 0; j < qty; j++) {
      item.customizations.push(customizations);
    }
    cart.push(item);
    return cart;
  }

  /**
   * Gets a product description customized with a flavor and box style.
   * @param {String} product - The product name
   * @param {String} flavor - The flavor name
   * @param {String} box - The box style name
   * @returns {String} - The customized description
   */
  async function getCustomDesc(product, flavor, box) {
    let params = {"product" : product,
                  "flavor" : flavor,
                  "box" : box};
    let requestOptions = {method: "POST",
                          headers: {
                            "Content-Type": "application/json"
                          },
                          body: JSON.stringify(params)};
    let resp = await fetch(BASE_URL + "custom-description", requestOptions);
    checkStatus(resp);
    let customDesc = await resp.text();
    return customDesc;
  }

  /**
   * Gets the flavors available for a product as a JSON collection.
   * @param {String} name - The name of the product
   * @returns {Object} - The flavors available for the product
   * ["Chocolate", "Strawberry"]
   */
  async function getFlavors(name) {
    let resp = await fetch(BASE_URL + "flavors/" + formatDashes(name));
    checkStatus(resp);
    let flavors = await resp.json();
    return flavors;

  }

  /**
   * Gets the available box decoration styles as an array of strings.
   * @param {productName} productName - The name of the product
   * @returns {Object} - The available box decoration styles"
   * ["Plain", "Bow", "Flower"]
   */
  async function getBoxDecorations() {
    let resp = await fetch(BASE_URL + "box-decorations");
    checkStatus(resp);
    let boxDecor= await resp.text();
    boxDecor = boxDecor.trim().split("\n");
    return boxDecor;
  }

  /**
   * Toggles the .hidden class of the relevent product view and single item view elements
   * to show/hide them.
   */
  function toggleView() {
    id("results").textContent = "";
    id("product-list-view").classList.toggle("hidden");
    id("single-item-view").classList.toggle("hidden");
  }

  /**
   * Redirects page to cart.html.
   */
  function goToCart() {
    window.location.href = "cart.html";
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
   * This function is called when an error occurs in the fetch call chain.
   * Displays a user-friendly error message on the page.
   */
  function handleRequestError() {
    id("results").textContent = "There was an error loading the data. Please try again later.";
  }

  /**
   * Checks the status of a fetch Response, returning the Response object back
   * for further processing if successful, otherwise returns an Error that needs
   * to be caught.
   * @param {object} response - response with status to check for success/error.
   * @returns {object} - The Response object if successful, otherwise an Error that
   * needs to be caught.
   */
  function checkStatus(response) {
    if (!response.ok) { // Response.status >= 200 && response.status < 300
     throw Error("Error in request: " + response.statusText);
    } // Else, we got a response back with a good status code (e.g. 200)
    return response; // A Response object.
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} idName - element ID
   * @returns {object} DO object associated with id
   */
  function id(idName) {
    return document.getElementById(idName);
  }

  /**
   * Returns the first element that matches the given CSS selector.
   * @param {string} selector - CSS query selector string.
   * @returns {object} first element matching the selector in the DOM tree (null if none)
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns a new element with the given tagname
   * @param {string} tagname - name of element to create and return
   * @returns {object} new DOM element with the given tagname
   */
  function gen(tagname) {
    return document.createElement(tagname);
  }

  init();
})();
