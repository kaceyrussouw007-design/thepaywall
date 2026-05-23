const root = document.documentElement;
const paywallList = document.getElementById('paywall-list');
const paywallForm = document.getElementById('paywall-form');
const paywallTitle = document.getElementById('paywall-title');
const paywallDescription = document.getElementById('paywall-description');
const paywallCurrency = document.getElementById('paywall-currency');
const paywallPrice = document.getElementById('paywall-price');
const paywallLink = document.getElementById('paywall-link');
const checkoutCard = document.getElementById('checkout-card');
const paymentAddress = document.getElementById('payment-address');
const paymentUri = document.getElementById('payment-uri');
const expiresAt = document.getElementById('expires-at');
const openWallet = document.getElementById('open-wallet');
const unlockContent = document.getElementById('unlock-content');
const accessMessage = document.getElementById('access-message');

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'API error');
  }
  return res.json();
}

function formatCurrency(amount, currency) {
  return `${amount.toFixed(2)} ${currency}`;
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

async function loadPaywalls() {
  if (!paywallList) return;
  try {
    const paywalls = await api('/api/paywalls');
    if (!paywalls.length) {
      paywallList.innerHTML = '<p class="note">No paywall items yet. Create one to see it here.</p>';
      return;
    }
    paywallList.innerHTML = paywalls.map(item => `
      <article class="paywall-card">
        <h3>${item.title}</h3>
        <p>${item.description || 'No description provided.'}</p>
        <p><strong>Price:</strong> ${formatCurrency(item.price, item.currency)}</p>
        <p><strong>Link:</strong> <a href="paywall.html?id=${item.id}">Open buyer page</a></p>
      </article>
    `).join('');
  } catch (error) {
    paywallList.innerHTML = `<p class="note">Unable to load paywalls: ${error.message}</p>`;
  }
}

async function submitPaywall(event) {
  event.preventDefault();
  const formData = new FormData(paywallForm);
  const body = {
    title: formData.get('title').trim(),
    description: formData.get('description').trim(),
    price: Number(formData.get('price')),
    currency: formData.get('currency'),
    contentUrl: formData.get('contentUrl').trim()
  };
  try {
    const paywall = await api('/api/paywalls', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    paywallForm.reset();
    loadPaywalls();
    alert(`Published: ${paywall.title}\nBuyer page: paywall.html?id=${paywall.id}`);
  } catch (error) {
    alert(error.message);
  }
}

function showCheckout(data) {
  if (!checkoutCard) return;
  paymentAddress.textContent = data.address;
  paymentUri.textContent = data.uri;
  expiresAt.textContent = new Date(data.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  checkoutCard.classList.remove('hidden');
  accessMessage.classList.add('hidden');
}

function markAccessGranted(contentUrl) {
  if (!accessMessage) return;
  accessMessage.textContent = `Payment completed. Access your content here: ${contentUrl}`;
  accessMessage.classList.remove('hidden');
}

async function loadPaywallPage() {
  const id = getQueryParam('id');
  if (!id) {
    paywallTitle.textContent = 'Missing paywall ID';
    return;
  }

  try {
    const paywall = await api(`/api/paywalls/${id}`);
    paywallTitle.textContent = paywall.title;
    paywallDescription.textContent = paywall.description || 'Exclusive content behind the paywall.';
    paywallCurrency.textContent = paywall.currency;
    paywallPrice.textContent = formatCurrency(paywall.price, paywall.currency);
    paywallLink.textContent = paywall.contentUrl;
    paywallLink.href = paywall.contentUrl;

    const checkout = await api(`/api/paywalls/${id}/checkout`, { method: 'POST' });
    showCheckout(checkout);
    openWallet.addEventListener('click', () => {
      window.location.href = checkout.uri;
    });
    unlockContent.addEventListener('click', () => {
      markAccessGranted(paywall.contentUrl);
    });
  } catch (error) {
    paywallTitle.textContent = 'Paywall error';
    paywallDescription.textContent = error.message;
  }
}

if (paywallForm) {
  paywallForm.addEventListener('submit', submitPaywall);
  loadPaywalls();
}

if (paywallTitle && !paywallForm) {
  loadPaywallPage();
}
