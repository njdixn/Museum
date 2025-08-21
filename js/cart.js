// Global Variables
let discountChosen = false;
let appliedDiscount = 0;
let appliedLabel = '';
const SHIPPING_RATE = 25.00;
const FREE_SHIPPING_THRESHOLD = 100.00; // set free shipping threshold
const TAX_RATE = 0.102;

// Cart Helpers
function readCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

function writeCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Cart Operations
function addToCart(button) {
  const id = button.dataset.id;
  const name = button.dataset.name;
  const price = parseFloat(button.dataset.price);
  const image = button.dataset.image;

  let cart = readCart();
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty++;
  } else {
    cart.push({ id, name, unitPrice: price, qty: 1, image });
  }
  writeCart(cart);
  updateCartCount();
  updateShopQuantityLabels();
}

function removeItem(id) {
  const cart = readCart().filter(it => it.id !== id);
  writeCart(cart);
  render();
}

function clearCart() {
  writeCart([]);
  const memberToggle = document.getElementById('memberToggle');
  if (memberToggle) memberToggle.checked = false;
  render();
}

function updateQty(id, newQty) {
  let cart = readCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;

  if (newQty <= 0) {
    removeItem(id);
    return;
  }
  item.qty = newQty;
  writeCart(cart);
  render();
}

// Cart Count
function updateCartCount() {
  const cart = readCart();
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const countSpan = document.getElementById('cartCount');
  if (countSpan) countSpan.textContent = totalQty;
}

// Shop Quantity Labels
function updateShopQuantityLabels() {
  const cart = readCart();
  const items = document.querySelectorAll('.souvenir-item');
  items.forEach(itemDiv => {
    const id = itemDiv.dataset.id;
    const badge = itemDiv.querySelector('.qty-badge');
    const cartItem = cart.find(i => i.id === id);
    if (cartItem) {
      badge.textContent = cartItem.qty;
    } else {
      badge.textContent = '';
    }
  });
}

// Money Formatting
function money(amount) {
  return `$${amount.toFixed(2)}`;
}

// Discounts (placeholder)
function volumeRate(total) {
  if (total >= 75) return 0.1; // 10% volume discount
  return 0;
}

// Cart Rendering
function render() {
  const itemsDiv = document.getElementById('items');
  const summaryDiv = document.getElementById('summary');
  const emptyMsg = document.getElementById('emptyMsg');
  const isMemberToggle = document.getElementById('memberToggle');
  const isMember = isMemberToggle ? isMemberToggle.checked : false;

  const cart = readCart().filter(it => it.qty > 0 && it.unitPrice > 0);

  if (!itemsDiv || !summaryDiv || !emptyMsg) return;

  if (cart.length === 0) {
    itemsDiv.hidden = true;
    summaryDiv.hidden = true;
    emptyMsg.hidden = false;
    updateCartCount();
    return;
  }

  itemsDiv.hidden = false;
  summaryDiv.hidden = false;
  emptyMsg.hidden = true;
  itemsDiv.innerHTML = '';

  let itemTotal = 0;

  // --- Cart Header (including Unit Price) ---
  const header = document.createElement('div');
  header.classList.add('cart-header');
  header.style.display = 'grid';
  header.style.gridTemplateColumns = '80px 2fr 1fr 1fr 1fr 1fr'; // Image | Name | Unit | Quantity | Price | Remove
  header.style.fontWeight = 'bold';
  header.style.marginBottom = '8px';

  ['Image', 'Name', 'Unit Price', 'Quantity', 'Price', 'Remove'].forEach(text => {
    const h = document.createElement('div');
    h.textContent = text;
    header.appendChild(h);
  });
  itemsDiv.appendChild(header);

  // --- Cart Items ---
  cart.forEach(item => {
    const line = document.createElement('div');
    line.classList.add('cart-item');
    line.dataset.id = item.id;

    const img = document.createElement('img');
    img.src = item.image || '../images/default.png';
    img.alt = item.name;
    img.classList.add('cart-item-image');

    const name = document.createElement('div');
    name.textContent = item.name;
    name.classList.add('cart-item-name');

    const unitPriceDiv = document.createElement('div');
    unitPriceDiv.textContent = money(item.unitPrice);
    unitPriceDiv.classList.add('cart-item-price');

    const qtyDiv = document.createElement('div');
    qtyDiv.classList.add('cart-item-qty');

    const minusBtn = document.createElement('button');
    minusBtn.textContent = '−';
    minusBtn.addEventListener('click', () => updateQty(item.id, item.qty - 1));

    const qtyValue = document.createElement('span');
    qtyValue.textContent = item.qty;
    qtyValue.classList.add('qty-value');

    const plusBtn = document.createElement('button');
    plusBtn.textContent = '+';
    plusBtn.addEventListener('click', () => updateQty(item.id, item.qty + 1));

    qtyDiv.append(minusBtn, qtyValue, plusBtn);

    const price = document.createElement('div');
    price.textContent = money(item.unitPrice * item.qty);
    price.classList.add('cart-item-price');

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.classList.add('cart-item-remove');
    removeBtn.onclick = () => removeItem(item.id);

    line.append(img, name, unitPriceDiv, qtyDiv, price, removeBtn);
    itemsDiv.appendChild(line);

    itemTotal += item.unitPrice * item.qty;
  });

  // --- Discounts ---
  const volumeDiscountRate = volumeRate(itemTotal);
  const volumeDiscount = itemTotal * volumeDiscountRate;
  const memberDiscount = isMember ? itemTotal * 0.15 : 0;

  if (!discountChosen && isMember && volumeDiscountRate > 0) {
    const choice = prompt("Only one discount may be applied. Type 'M' for Member or 'V' for Volume:");
    if (choice === 'M') {
      appliedDiscount = memberDiscount;
      appliedLabel = 'Member Discount';
    } else if (choice === 'V') {
      appliedDiscount = volumeDiscount;
      appliedLabel = 'Volume Discount';
    } else {
      appliedDiscount = 0;
      appliedLabel = 'No Discount Applied';
    }
    discountChosen = true;
  } else if (isMember) {
    appliedDiscount = memberDiscount;
    appliedLabel = 'Member Discount';
  } else if (volumeDiscountRate > 0) {
    appliedDiscount = volumeDiscount;
    appliedLabel = 'Volume Discount';
  } else {
    appliedDiscount = 0;
    appliedLabel = 'No Discount Applied';
  }

  // --- Shipping (with threshold) ---
  let shippingCost = SHIPPING_RATE;
  if (itemTotal >= FREE_SHIPPING_THRESHOLD) {
    shippingCost = 0;
  }

  const subtotal = itemTotal - appliedDiscount + shippingCost;
  const taxAmount = subtotal * TAX_RATE;
  const invoiceTotal = subtotal + taxAmount;

  // --- Build Summary ---
  summaryDiv.innerHTML = '';
  const summaryItems = [
    { label: 'Subtotal of Items:', value: money(itemTotal) },
    { label: appliedLabel + ':', value: money(-appliedDiscount), negative: appliedDiscount > 0 },
    { label: 'Shipping ($100+ gets free shipping!):', value: money(shippingCost) },
    { label: 'Subtotal (Taxable):', value: money(subtotal) },
    { label: `Tax Rate:`, value: (TAX_RATE * 100).toFixed(1) + '%' },
    { label: 'Tax Amount:', value: money(taxAmount) },
    { label: 'Invoice Total:', value: money(invoiceTotal), total: true }
  ];

  summaryItems.forEach(item => {
    const row = document.createElement('div');
    row.classList.add('summary-row');
    if (item.total) row.classList.add('total');

    const label = document.createElement('div');
    label.textContent = item.label;

    const value = document.createElement('div');
    value.textContent = item.value;
    value.classList.add('value');
    if (item.negative) value.classList.add('negative');

    row.append(label, value);
    summaryDiv.appendChild(row);
  });

  updateCartCount();
  updateShopQuantityLabels();
}


document.addEventListener('DOMContentLoaded', () => {
  const memberToggle = document.getElementById('memberToggle');
  const clearBtn = document.getElementById('clearBtn');

  if (memberToggle) memberToggle.addEventListener('change', render);
  if (clearBtn) clearBtn.addEventListener('click', clearCart);

  render();
});
