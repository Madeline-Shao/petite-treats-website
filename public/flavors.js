/**
 * @author: Madeline Shao
 * Date: 6/8/21
 *
 * Dynamically loads data about macaron flavors from an API to display on the
 * Flavors section of the Petite Treats website.
 */
(function() {
  "use strict";

  const BASE_URL = "/";

  /**
   * Sets up the flavors section and initial document evnet handlers.
   */
  function init() {
    initializeFlavors();
    id("cart-btn").addEventListener("click", goToCart);
  }

  /**
   * Fills the Flavors section of the page with item cards for each flavor.
   * using data from an API:
   * <section id="flavors">
   *  <article>...</article>
   *  <article>...</article>
   * </section>
   * Displays an error message if there is an error loading
   * the data.
   */
  async function initializeFlavors() {
    id("results").textContent = "Response Loading...";
    try {
      let resp = await fetch(BASE_URL + "macaron-flavors");
      checkStatus(resp);
      let flavors = await resp.json();
      id("results").textContent = "";
      for (let i = 0; i < flavors.length; i++) {
        if (flavors[i].description && flavors[i].image) {
          let card = createCard(flavors[i]);
          id("flavors").appendChild(card);
        }
      }
    }
    catch {
      handleRequestError();
    }
  }

  /**
   * Returns an article with information about a macaron flavor.
   * @param {object} flavor - A JSON object containing information
   * about a flavor:
   * { name : "Vanilla",
   *   image : "imgs/vanilla-macaron.jpg",
   *   description: "A basic vanilla."}
   * @return {DOMobject} - DOM object for the flavor card:
   * <article>
   *   <h2>Vanilla</h2>
   *   <img src="imgs/vanilla-macaron.jpg" alt="Vanilla macaron" />
   *   <p>A basic vanilla.</p>
   * </article>
   */
  function createCard(flavor) {
    let article = gen("article");
    let heading = gen("h2");
    heading.textContent = flavor.name;
    let img = gen("img");
    img.src = flavor.image;
    img.alt = flavor.name + " macaron";
    let description = gen("p");
    description.textContent = flavor.description;
    article.appendChild(heading);
    article.appendChild(img);
    article.appendChild(description);
    return article;
  }

  /**
   * Redirects page to cart.html.
   */
  function goToCart() {
    window.location.href = "cart.html";
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
