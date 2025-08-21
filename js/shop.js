// function updateShopQuantities() {
//   const cart = readCart();
//   document.querySelectorAll('.souvenir-item').forEach(itemDiv => {
//     const id = itemDiv.dataset.id;
//     const qty = cart.find(i => i.id === id)?.qty || 0;
//     const badge = itemDiv.querySelector('.qty-badge');
//     badge.textContent = qty > 0 ? `Quantity: ${qty}` : '';
//   });
// }

// // Call this whenever the cart changes
// function addToCart(button) {
//   const id = button.dataset.id;
//   const name = button.dataset.name;
//   const price = parseFloat(button.dataset.price);
//   const image = button.dataset.image;

//   const cart = readCart();
//   const item = cart.find(i => i.id === id);
//   if (item) {
//     item.qty++;
//   } else {
//     cart.push({ id, name, unitPrice: price, image, qty: 1 });
//   }
//   writeCart(cart);
//   updateCartCount();
//   updateShopQuantities(); 
// }

// // call updateShopQuantities() on page load
// document.addEventListener('DOMContentLoaded', () => {
//   updateCartCount();
//   updateShopQuantities();
// });


// function openModal(imgElement) {
//   const modal = document.getElementById("modal");
//   const modalImage = document.getElementById("modal-image");
//   modalImage.src = imgElement.src;
//   modalImage.alt = imgElement.alt;
//   modal.style.display = "block";
// }

// function closeModal() {
//   document.getElementById("modal").style.display = "none";
// }

// window.onclick = function(event) {
//   const modal = document.getElementById("modal");
//   if (event.target === modal) {
//     closeModal();
//   }
// };