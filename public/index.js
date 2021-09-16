/**
 * @author: Madeline Shao
 * Date: 6/9/21
 *
 * Dynamically loads data about featured products from an API to display on the
 * Featured section of the Petite Treats website. Allows user to submit a "Contact us"
 * form to the server.
 */
(function() {
  "use strict";

  const BASE_URL = "/";

  /**
   * Sets up the featured section on the page and initial event handlers.
   */
  function init() {
    initializeFeatured();
    id("contact-form").addEventListener("submit", submitForm);
    id("cart-btn").addEventListener("click", goToCart);
  }

  /**
   * Fills the Featured section of the page with item cards for featured products
   * using data from an API:
   * <section id="featured">
   *  <article>...</article>
   *  <article>...</article>
   * </section>
   * Displays an error message if there is an error loading
   * the data.
   */
  async function initializeFeatured() {
    id("results").textContent = "Response Loading...";
    try {
      let featured = await fetch(BASE_URL + "featured");
      await checkStatus(featured);
      let featuredText = await featured.text();
      featuredText = featuredText.trim().split("\n");
      for (let i = 0; i < featuredText.length; i++) {
        let product = await fetch(BASE_URL + "products/" + formatDashes(featuredText[i]));
        await checkStatus(product);
        let productJson = await product.json();
        let card = createCard(productJson);
        id("featured").appendChild(card);
      }
      id("results").textContent = "";
    }
    catch {
      handleRequestError();
    }
  }

  /**
   * Returns an article with information about a product.
   * @param {object} product - A JSON object containing information
   * about a product:
   * { name : "Cheesecake",
   *   price: 7,
   *   description: "A delicious cheesecake.",
   *   image : "imgs/cheesecake.jpg"}
   * @return {DOMobject} - DOM object for the item card:
   * <article>
   *   <h2>Cheesecake</h2>
   *   <p>$7.00</p>
   *   <img src="imgs/cheesecake.jpg" alt="Cheesecake" />
   *   <p>A delicious cheesecake.</p>
   * </article>
   */
  function createCard(product) {
    let article = gen("article");
    let heading = gen("h2");
    heading.textContent = product.name;
    let price = gen("p");
    price.textContent = "$" + product.price.toFixed(2);
    let img = gen("img");
    img.src = product.image;
    img.alt = product.name;
    let description = gen("p");
    description.textContent = product.description;
    article.appendChild(heading);
    article.appendChild(price);
    article.appendChild(img);
    article.appendChild(description);
    return article;
  }

  /**
   * Prevents default submission behavior for the submit event and makes request to submit
   * contact form data to the server.
   * Displays a success message if successful, or an error message if there is an error
   * submitting the data.
   * @param {Object} evt - The event object
   */
  async function submitForm(evt) {
    evt.preventDefault();
    let params = new FormData(id("contact-form"));
    try {
      let resp = await fetch(BASE_URL + "contact-us", { method : "POST", body : params });
      await checkStatus(resp);
      let text = await resp.text();
      id("confirmation").textContent = text;
      id("contact-form").reset();
    } catch (err) {
      handlePostError(err);
    }
  }

  /**
   * Redirects page to cart.html.
   */
  function goToCart() {
    window.location.href = "cart.html";
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
   * This function is called when an error occurs in the fetch call chain for GET requests.
   * Displays a user-friendly error message on the page.
   */
  function handleRequestError() {
    id("results").textContent = "There was an error loading the data. Please try again later.";
  }

  /**
   * This function is called when an error occurs in the fetch call chain for POST requests.
   * Displays a user-friendly error message on the page.
   */
  function handlePostError(err) {
    id("confirmation").textContent = err.message;
  }

  /**
   * Checks the status of a fetch Response, returning the Response object back
   * for further processing if successful, otherwise returns an Error that needs
   * to be caught.
   * @param {object} response - response with status to check for success/error.
   * @returns {object} - The Response object if successful, otherwise an Error that
   * needs to be caught.
   */
  async function checkStatus(response) {
    if (!response.ok) { // Response.status >= 200 && response.status < 300
      let msg = "The server encountered an error. Please try again later.";
      if (response.status === 400) {
        msg = await response.text();
      }
      throw Error(msg);
    } // Else, we got a response back with a good status code (e.g. 200)
    return response; // A Response object.
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} idName - element ID
   * @return {object} DO object associated with id
   */
  function id(idName) {
    return document.getElementById(idName);
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
