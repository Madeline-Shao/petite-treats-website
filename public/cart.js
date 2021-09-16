/**
 * @author: Madeline Shao
 * Date: 6/9/21
 *
 * Implements functionality for the cart page of the Petite Treats website.
 * Loads the cart from the browser session storage to display on page.
 * The user can remove items from the cart and clear the cart.
 */
(function() {
  "use strict";

  /**
   * Sets up the cart and initial document event handlers.
   */
  function init() {
    initializeCart();
    id("product-btn").addEventListener("click", goToProducts);
    id("cart-btn").addEventListener("click", goToCart);
    id("clear-cart-btn").addEventListener("click", clearCart);
  }

  /**
   * Fills the Cart section of the page with a list of items in the cart stored in the
   * browser session storage.
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
   */
  function initializeCart() {
    let cart = JSON.parse(window.sessionStorage.getItem("cart"));
    if (cart) {
      for (let i = 0; i < cart.length; i++) {
        id("cart").appendChild(createItem(cart[i]));
      }
    }
  }

  /**
   * Creates a list element from the given item information to add to the cart.
   * @param {Object} item - The item to add
   * Ex: { name : "Cake",
   *       price: 10,
   *       customizations: [{flavor: "Chocolate", box : "Plain"},
   *                        {flavor: "Vanilla", box : "Flower"}] }
   * @returns {DOMObject} The DOM object to append to the cart.
   * Ex:
   * <li>
   *   2 Brownies - $<span>4.00</span>
   *   <button class="remove-btn">X</button>
   *   <ul>
   *     <li>Flavor: Caramel
   *         Box Decoration: Plain</li>
   *     <li>Flavor: Chocolate
   *         Box Decoration: Bow</li>
   *   </ul>
   * </li>
   */
  function createItem(item) {
    let itemName = gen("li");
    let customsUl = gen("ul");
    itemName.textContent = `${item.customizations.length} ${item.name} - $`;
    let span = gen("span");
    itemName.appendChild(span);
    let items = item.customizations;
    let totalItemPrice = 0;
    for (let i = 0; i < items.length; i++) {
      let itemCustoms = gen("li");
      let newItem = items[i];
      itemCustoms.textContent = `Flavor: ${newItem.flavor}\nBox Decoration: ${newItem.box}`;
      customsUl.appendChild(itemCustoms);
      id("cart-count").textContent = parseInt(id("cart-count").textContent) + 1;
      totalItemPrice += item.price;
    }
    span.textContent = totalItemPrice.toFixed(2);
    id("total-price").textContent = (parseFloat(id("total-price").textContent) +
                                     totalItemPrice).toFixed(2);
    let removeBtn = gen("button");
    removeBtn.classList.add("remove-btn");
    removeBtn.textContent = "X";
    removeBtn.addEventListener("click", removeItem);
    itemName.appendChild(removeBtn);
    itemName.appendChild(customsUl);
    return itemName;
  }

  /**
   * Removes the item associated with the remove button click event from the cart, updating
   * the session storage, count of items in the cart, and the total price.
   */
  function removeItem() {
    let cart = JSON.parse(window.sessionStorage.getItem("cart"));
    if (cart) {
      let name = this.parentNode.textContent;
      name = name.slice(name.indexOf(" ") + 1, name.indexOf(" - "))
      for (let i = 0; i < cart.length; i++) {
        if (cart[i].name === name) {
          cart.splice(i, 1);
        }
      }
      window.sessionStorage.setItem("cart", JSON.stringify(cart));
      id("cart-count").textContent = parseInt(id("cart-count").textContent) -
                                     this.parentNode.children[2].children.length;
      id("total-price").textContent = (parseFloat(id("total-price").textContent) -
                                       this.parentNode.children[0].textContent).toFixed(2);
      this.parentNode.remove();
    }
  }

  /**
   * Clears the cart of all items, updating the count of items in the cart to 0 and the
   * total price to 0.00.
  */
  function clearCart() {
    id("cart").innerHTML = "";
    id("total-price").textContent = "0.00";
    id("cart-count").textContent = "0";
    window.sessionStorage.setItem("cart", JSON.stringify([]));
  }

  /**
   * Redirects page to cart.html.
   */
  function goToCart() {
    window.location.href = "cart.html";
  }

  /**
   * Redirects page to products.html.
   */
  function goToProducts() {
    window.location.href = "products.html";
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
