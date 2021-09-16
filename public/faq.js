/**
 * @author: Madeline Shao
 * Date: 6/9/21
 *
 * Dynamically loads data about FAQs from an API to display on the
 * FAQ section of the Petite Treats website.
 */
(function() {
  "use strict";

  const BASE_URL = "/";

  /**
   * Sets up the FAQ section of the page and initial event handlers.
   */
  function init() {
    initializeFAQ();
    id("cart-btn").addEventListener("click", goToCart);
  }

  /**
   * Fills the FAQ section of the page with item cards for FAQ
   * using data from an API:
   * <section id="faq">
   *  <article>...</article>
   *  <article>...</article>
   * </section>
   * Displays an error message if there is an error loading
   * the data.
   */
  async function initializeFAQ() {
    id("results").textContent = "Response Loading...";
    try {
      let resp = await fetch(BASE_URL + "faq");
      checkStatus(resp);
      let faq = await resp.json();
      id("results").textContent = "";
      for (let i = 0; i < faq.length; i++) {
        let card = createCard(faq[i]);
        id("faq").appendChild(card);
      }
    }
    catch {
      handleRequestError();
    }
  }

  /**
   * Returns an article with the question and answer.
   * @param {object} faq - A JSON object containing information
   * about a single FAQ.
   * { question : "Who are you?",
   *   answer : "You, but better."}
   * @return {DOMobject} - DOM object for the FAQ card:
   * <article>
   *   <h2>Q: Who are you?</h2>
   *   <p>A: You, but better.</p>
   * </article>
   */
  function createCard(faq) {
    let article = gen("article");
    article.classList.add("faq-card");
    let heading = gen("h2");
    heading.textContent = "Q: " + faq.question;
    let answer = gen("p");
    answer.textContent = "A: " + faq.answer;
    article.appendChild(heading);
    article.appendChild(answer);
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
