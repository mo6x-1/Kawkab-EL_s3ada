document.addEventListener('DOMContentLoaded', function () {
  /* === apply saved theme (no toggle on cart page) === */
  (function () {
    const saved = localStorage.getItem('siteTheme');
    if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
  })();
  function getCartItems() {
    const saved = localStorage.getItem('cartItems');
    return saved ? JSON.parse(saved) : [];
  }

  function saveCartItems(items) {
    localStorage.setItem('cartItems', JSON.stringify(items));
  }

  function updateCartCount() {
    const count = getCartItems().reduce((total, item) => total + item.quantity, 0);
    const badge = document.getElementById('cartCount');
    if (!badge) return;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
  }

  function addToCart(name, price) {
    const items = getCartItems();
    const existing = items.find(item => item.name === name);
    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({ name, price: Number(price), quantity: 1 });
    }
    saveCartItems(items);
    updateCartCount();
  }

  function removeFromCart(name) {
    let items = getCartItems();
    items = items.filter(item => item.name !== name);
    saveCartItems(items);
    updateCartCount();
    renderCartPage();
  }

  function decreaseQuantity(name) {
    const items = getCartItems();
    const item = items.find(i => i.name === name);
    if (item) {
      if (item.quantity > 1) {
        item.quantity -= 1;
        saveCartItems(items);
      } else {
        removeFromCart(name);
        return;
      }
    }
    updateCartCount();
    renderCartPage();
  }

  function increaseQuantity(name) {
    const items = getCartItems();
    const item = items.find(i => i.name === name);
    if (item) {
      item.quantity += 1;
      saveCartItems(items);
    }
    updateCartCount();
    renderCartPage();
  }

  function renderCartPage() {
    const cartPage = document.getElementById('cartPage');
    if (!cartPage) return;

    const items = getCartItems();
    const list = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    const emptyEl = document.getElementById('emptyCart');
    if (!list || !totalEl || !emptyEl) return;

    list.innerHTML = '';
    if (items.length === 0) {
      emptyEl.style.display = 'block';
      list.style.display = 'none';
      totalEl.textContent = '0';
      return;
    }

    emptyEl.style.display = 'none';
    list.style.display = 'grid';

    let total = 0;
    items.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-details">${item.quantity} × ${item.price} ج.م</div>
        </div>
        <div class="cart-item-actions">
          <button class="cart-btn cart-btn-decrease" data-name="${item.name}" aria-label="إنقاص الكمية">−</button>
          <span class="cart-qty">${item.quantity}</span>
          <button class="cart-btn cart-btn-increase" data-name="${item.name}" aria-label="زيادة الكمية">+</button>
          <button class="cart-btn cart-btn-delete" data-name="${item.name}" aria-label="حذف من السلة">🗑️</button>
        </div>
      `;
      list.appendChild(row);
      
      // Attach event listeners
      const decreaseBtn = row.querySelector('.cart-btn-decrease');
      const increaseBtn = row.querySelector('.cart-btn-increase');
      const deleteBtn = row.querySelector('.cart-btn-delete');
      decreaseBtn.addEventListener('click', () => decreaseQuantity(item.name));
      increaseBtn.addEventListener('click', () => increaseQuantity(item.name));
      deleteBtn.addEventListener('click', () => removeFromCart(item.name));
      
      total += item.price * item.quantity;
    });

    totalEl.textContent = total.toFixed(0);
  }

  const addButtons = document.querySelectorAll('.add-to-cart');
  addButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const name = this.dataset.name;
      const price = this.dataset.price;
      addToCart(name, price);
      const originalText = this.textContent;
      this.textContent = 'تمت الإضافة';
      setTimeout(() => {
        this.textContent = originalText;
      }, 900);
    });
  });

  updateCartCount();
  renderCartPage();

  // Order modal and submission handling
  const orderModal = document.getElementById('orderModal');
  const openOrderBtn = document.getElementById('completeOrderBtn');
  const closeOrderBtn = document.getElementById('closeOrderModal');
  const cancelOrderBtn = document.getElementById('cancelOrderBtn');
  const orderForm = document.getElementById('orderForm');

  function clearFormErrors() {
    ['errName','errPhone','errAddress'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '';
    });
  }

  function openModal() {
    if (orderModal) orderModal.classList.add('open');
    if (orderModal) orderModal.setAttribute('aria-hidden','false');
  }

  function closeModal() {
    if (orderModal) orderModal.classList.remove('open');
    if (orderModal) orderModal.setAttribute('aria-hidden','true');
    clearFormErrors();
    if (orderForm) orderForm.reset();
  }

  if (openOrderBtn) openOrderBtn.addEventListener('click', function () {
    // Only open if there are items in the cart
    if (getCartItems().length === 0) {
      alert('السلة فارغة، الرجاء إضافة عناصر قبل إتمام الطلب.');
      return;
    }
    openModal();
  });

  if (closeOrderBtn) closeOrderBtn.addEventListener('click', closeModal);
  if (cancelOrderBtn) cancelOrderBtn.addEventListener('click', closeModal);

  // close when clicking overlay background
  if (orderModal) orderModal.addEventListener('click', function (e) {
    if (e.target === orderModal) closeModal();
  });

  if (orderForm) {
    orderForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearFormErrors();

      const name = document.getElementById('customerName')?.value?.trim() || '';
      const phone = document.getElementById('customerPhone')?.value?.trim() || '';
      const address = document.getElementById('customerAddress')?.value?.trim() || '';
      const notes = document.getElementById('customerNotes')?.value?.trim() || '';

      let valid = true;
      if (!name) { document.getElementById('errName').textContent = 'الاسم مطلوب'; valid = false; }
      if (!phone) { document.getElementById('errPhone').textContent = 'رقم الهاتف مطلوب'; valid = false; }
      if (!address) { document.getElementById('errAddress').textContent = 'العنوان مطلوب'; valid = false; }

      if (!valid) return;

      const items = getCartItems();
      const total = Number(document.getElementById('cartTotal')?.textContent || 0);

      const order = { customer: { name, phone, address, notes }, items, total, createdAt: new Date().toISOString() };

      // Save order (for demo) and clear cart
      try {
        localStorage.setItem('lastOrder', JSON.stringify(order));
        saveCartItems([]);
        updateCartCount();
        renderCartPage();
        closeModal();
        alert('تم إتمام الطلب بنجاح. شكرًا لاختيارك Kawkab ALs3ada');
      } catch (err) {
        console.error('Order save failed', err);
        alert('حدث خطأ أثناء إتمام الطلب، حاول مرة أخرى.');
      }
    });
  }
});
