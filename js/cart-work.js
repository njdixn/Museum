const CART_KEY = 'museumCartV1';

function readCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

function writeCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function money(n) {
  const sign = n < 0 ? -1 : 1;
  const s = '$' + Math.abs(n).toFixed(2);
  return sign < 0 ? '(' + s + ')' : s;
}

function volumeRate(total) {
  const VOLUME_TIERS = [
    [0.00, 49.99, 0.00],
    [50.00, 99.99, 0.05],
    [100.00, 199.99, 0.10],
    [200.00, Infinity, 0.15]
  ];
  for (const [min, max, rate] of VOLUME_TIERS) {
    if (total >= min && total <= max) return rate;
  }
  return 0;
}

