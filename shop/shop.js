let cart = [];
let totalPrice = 0;

function addToCart(productName, productPrice) {
  cart.push({ name: productName, price: productPrice });
  totalPrice += productPrice;

  document.getElementById('cart-count').innerText = cart.length;
  alert(`${productName} added to cart!`);
}

function showCart() {
  const cartItemsContainer = document.getElementById('cart-items');
  cartItemsContainer.innerHTML = ''; // Clear previous items

  cart.forEach((item, index) => {
    const cartItem = document.createElement('div');
    cartItem.textContent = `${item.name} - $${item.price.toFixed(2)}`;
    cartItemsContainer.appendChild(cartItem);
  });

  document.getElementById('total-price').textContent = `Total: $${totalPrice.toFixed(2)}`;
  document.getElementById('cart-popup').classList.remove('hidden');
}

function hideCart() {
  document.getElementById('cart-popup').classList.add('hidden');
}
