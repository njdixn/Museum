// VARIABLES
const FREE_SHIP_THRESHOLD = 100;
const SHIPPING_RATE = 25.00;
const TAX_RATE = 0.102;

// HEADER
function updateCartCount() {
  const countEl = document.getElementById('cartCount');
  if (!countEl) return;
  const cart = readCart();
  const totalQty = cart.reduce((s, it) => s + (it.qty || 0), 0);
  countEl.textContent = totalQty;
}

function updateShopQuantityLabels() {
  const shopItems = document.querySelectorAll('.souvenir-item');
  if (!shopItems.length) return; 
  const cart = readCart();

  shopItems.forEach(itemEl => {
    const id = itemEl.getAttribute('data-id');
    const badge = itemEl.querySelector('.qty-badge');
    if (!badge || !id) return;

    const inCart = cart.find(i => i.id === id);
    const qty = inCart ? inCart.qty : 0;

    badge.textContent = qty > 0 ? `Quantity: ${qty}` : '';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  updateShopQuantityLabels();
});

// SHOP
function addToCart(btnEl) {
  const id    = btnEl.dataset.id;
  const name  = btnEl.dataset.name;
  const price = parseFloat(btnEl.dataset.price);
  const image = btnEl.dataset.image;

  if (!id || !name || isNaN(price)) return;

  const cart = readCart();
  const found = cart.find(i => i.id === id);

  if (found) {
    found.qty += 1;
  } else {
    cart.push({
      id,
      name,
      unitPrice: price,
      qty: 1,
      image: image || '../images/default.png'
    });
  }

  writeCart(cart);
  updateCartCount();
  updateShopQuantityLabels();
}

// CART
function removeItem(id) {
  const next = readCart().filter(it => it.id !== id);
  writeCart(next);
  render(); 
  updateShopQuantityLabels(); 
}

function clearCart() {
  writeCart([]);
  const memberToggle = document.getElementById('memberToggle');
  if (memberToggle) memberToggle.checked = false;
  render();

  updateCartCount();
  updateShopQuantityLabels();
}

function updateQty(id, newQty) {
  const cart = readCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;

  if (newQty <= 0) {
    writeCart(cart.filter(i => i.id !== id));
  } else {
    item.qty = newQty;
    writeCart(cart);
  }

  render();
  updateCartCount(); 
  updateShopQuantityLabels(); 
}

function render() {
  const itemsDiv   = document.getElementById('items');
  const summaryDiv = document.getElementById('summary');
  const emptyMsg   = document.getElementById('emptyMsg');
  const memberToggle = document.getElementById('memberToggle');

  if (!itemsDiv || !summaryDiv || !emptyMsg) return;

  const isMember = !!(memberToggle && memberToggle.checked);

  let cart = readCart().filter(it => (it.qty > 0) && (it.unitPrice > 0));

  if (cart.length === 0) {
    itemsDiv.hidden = true;
    summaryDiv.hidden = true;
    summaryDiv.innerHTML = '';
    emptyMsg.hidden = false;

    updateCartCount();
    return;
  }

  itemsDiv.hidden = false;
  summaryDiv.hidden = false;
  emptyMsg.hidden = true;
  itemsDiv.innerHTML = '';

  // HEADER
  const header = document.createElement('div');
  header.classList.add('cart-header');
  header.style.display = 'grid';
  header.style.gridTemplateColumns = '80px 2fr 1fr 1fr 1fr 1fr'; 
  header.style.fontWeight = 'bold';
  header.style.marginBottom = '8px';

  ['Image', 'Name', 'Quantity', 'Unit Price', 'Total Price','Remove'].forEach(text => {
    const h = document.createElement('div');
    h.textContent = text;
    header.appendChild(h);
  });
  itemsDiv.appendChild(header);

  // Rows
  let itemTotal = 0;
  for (const item of cart) {
    const line = document.createElement('div');
    line.classList.add('cart-item');
    line.dataset.id = item.id;

    // Image
    const img = document.createElement('img');
    img.src = item.image || '../images/default.png';
    img.alt = item.name;
    img.classList.add('cart-item-image');

    // Name
    const name = document.createElement('div');
    name.textContent = item.name;
    name.classList.add('cart-item-name');

    // Qty controls
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

    // Unit Price
    const unitPrice = document.createElement('div');
    unitPrice.textContent = money(item.unitPrice);
    unitPrice.classList.add('cart-item-price');

    //Total price per item
    const totalCell = document.createElement('div');
    totalCell.textContent = money(item.unitPrice * item.qty);
    totalCell.classList.add('cart-item-price');

    // Remove
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.classList.add('cart-item-remove');
    removeBtn.addEventListener('click', () => removeItem(item.id));

    // Append row
    line.append(img, name, qtyDiv, unitPrice, totalCell, removeBtn);
    itemsDiv.appendChild(line);

    itemTotal += item.unitPrice * item.qty;
  }

  // ----- Discounts -----
  const volumeDiscountRate = volumeRate(itemTotal);
  const volumeDiscount = itemTotal * volumeDiscountRate;
  const memberDiscountAmt = isMember ? itemTotal * 0.15 : 0;

  let appliedDiscount = 0;
  let appliedLabel = 'No Discount Applied';
  if (memberDiscountAmt > 0 || volumeDiscount > 0) {
    if (memberDiscountAmt >= volumeDiscount) {
      appliedDiscount = memberDiscountAmt;
      appliedLabel = 'Member Discount';
    } else {
      appliedDiscount = volumeDiscount;
      appliedLabel = 'Volume Discount';
    }
  }

  // Shipping 
  const merchandiseAfterDiscount = itemTotal - appliedDiscount;
  const shippingCost = (merchandiseAfterDiscount >= FREE_SHIP_THRESHOLD) ? 0 : SHIPPING_RATE;

  // Totals 
  const subtotalTaxable = merchandiseAfterDiscount + shippingCost;
  const taxAmount = subtotalTaxable * TAX_RATE;
  const invoiceTotal = subtotalTaxable + taxAmount;

  // Summary 
  summaryDiv.innerHTML = '';
  const summaryItems = [
    { label: 'Subtotal of Items:', value: money(itemTotal) },
    { label: appliedLabel + ':', value: money(-appliedDiscount), negative: appliedDiscount > 0 },
    { label: 'Shipping:', value: money(shippingCost) },
    { label: 'Subtotal (Taxable):', value: money(subtotalTaxable) },
    { label: 'Tax Rate:', value: (TAX_RATE * 100).toFixed(1) + '%' },
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

if (shippingCost === 0) {
  const banner = document.createElement('div');
  banner.className = 'free-shipping-msg';
  banner.textContent = 'Congratulations! You qualify for free shipping.';
  summaryDiv.appendChild(banner);
}

  updateCartCount();
  updateShopQuantityLabels();
}

// PAGE
document.addEventListener('DOMContentLoaded', () => {
  const memberToggle = document.getElementById('memberToggle');
  const clearBtn = document.getElementById('clearBtn');

  if (memberToggle) {
    memberToggle.addEventListener('change', render);
  }
  if (clearBtn) {
    clearBtn.addEventListener('click', clearCart);
  }

  if (document.getElementById('items') && document.getElementById('summary') && document.getElementById('emptyMsg')) {
    render();
  } else {
    updateCartCount();
    updateShopQuantityLabels();
  }
});
