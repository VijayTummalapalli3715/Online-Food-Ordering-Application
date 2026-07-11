/* ============================================================
   Bite Bazaar — main application script
   Task 4: interactive menus, real-time cart, form validation,
           user-event handling — all in vanilla JavaScript
           (mobile menu, drawer, modal, and toast are custom-built)
   Task 5: AJAX (fetch) — load menu items without a page refresh
   ============================================================ */

(function () {
  "use strict";

  const DELIVERY_FEE = 3.0;

  // ---------- State ----------
  let menuItems = [];
  let activeCategory = "All";
  let searchQuery = "";
  const cart = new Map(); // id -> { item, qty }

  // ---------- Elements ----------
  const menuGrid = document.getElementById("menuGrid");
  const menuStatus = document.getElementById("menuStatus");
  const categoryChips = document.getElementById("categoryChips");
  const searchInputs = [document.getElementById("searchInput"), document.getElementById("searchInputMobile")];
  const cartItemsEl = document.getElementById("cartItems");
  const cartCountEls = [document.getElementById("cartCount"), document.getElementById("cartCountMobile")];
  const cartSubtotalEl = document.getElementById("cartSubtotal");
  const cartDeliveryEl = document.getElementById("cartDelivery");
  const cartTotalEl = document.getElementById("cartTotal");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const confirmOrderBtn = document.getElementById("confirmOrderBtn");

  const fmt = (n) => "$" + n.toFixed(2);

  // ============================================================
  // Custom UI components (vanilla JS — no framework)
  // ============================================================

  // Mobile menu toggle
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  menuToggle.addEventListener("click", () => {
    const open = mobileMenu.classList.toggle("hidden") === false;
    menuToggle.setAttribute("aria-expanded", String(open));
  });
  mobileMenu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => mobileMenu.classList.add("hidden"))
  );

  // Cart drawer
  const drawer = document.getElementById("cartDrawer");
  const drawerBackdrop = document.getElementById("drawerBackdrop");
  function openDrawer() {
    drawer.classList.remove("translate-x-full");
    drawerBackdrop.classList.remove("opacity-0", "pointer-events-none");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    drawer.classList.add("translate-x-full");
    drawerBackdrop.classList.add("opacity-0", "pointer-events-none");
    document.body.style.overflow = "";
  }
  document.getElementById("openCartBtn").addEventListener("click", openDrawer);
  document.getElementById("openCartBtnMobile").addEventListener("click", openDrawer);
  document.getElementById("closeCartBtn").addEventListener("click", closeDrawer);
  drawerBackdrop.addEventListener("click", closeDrawer);

  // Checkout modal
  const modal = document.getElementById("checkoutModal");
  function openModal() {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    renderPaymentQR(); // refresh demo payment QR with the current total
  }
  function closeModal() {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  }

  // ---------- Demo payment QR (drawn in vanilla JS, no library) ----------
  const qrSvg = document.getElementById("paymentQR");
  const payAmountEl = document.getElementById("payAmount");
  function renderPaymentQR() {
    const total = cartTotalEl.textContent;
    payAmountEl.textContent = total;

    // Deterministic pseudo-random bits seeded by the total, so the
    // pattern changes with the amount — looks like a real QR code.
    let seed = 0;
    const payload = "upi://pay?pa=bitebazaar@demo&am=" + total;
    for (let i = 0; i < payload.length; i++) seed = (seed * 31 + payload.charCodeAt(i)) >>> 0;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };

    const N = 29; // modules per side
    let cells = "";
    const inFinder = (x, y) =>
      (x < 9 && y < 9) || (x >= N - 9 && y < 9) || (x < 9 && y >= N - 9);

    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        if (!inFinder(x, y) && rand() < 0.45) {
          cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
        }
      }
    }

    // Three finder squares (the classic QR corner markers)
    const finder = (fx, fy) =>
      `<rect x="${fx}" y="${fy}" width="7" height="7" fill="none" stroke="#1C1B17" stroke-width="1"/>` +
      `<rect x="${fx + 2}" y="${fy + 2}" width="3" height="3"/>`;

    qrSvg.innerHTML =
      `<g fill="#1C1B17" shape-rendering="crispEdges">` +
      cells + finder(0.5, 0.5) + finder(N - 7.5, 0.5) + finder(0.5, N - 7.5) +
      `</g>`;
  }
  checkoutBtn.addEventListener("click", () => { closeDrawer(); openModal(); });
  document.getElementById("closeModalBtn").addEventListener("click", closeModal);
  document.getElementById("cancelModalBtn").addEventListener("click", closeModal);
  document.getElementById("modalBackdrop").addEventListener("click", closeModal);

  // Escape key closes drawer / modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeDrawer(); closeModal(); }
  });

  // Toast
  const toastEl = document.getElementById("appToast");
  const toastBody = document.getElementById("appToastBody");
  let toastTimer = null;
  function notify(message) {
    toastBody.textContent = message;
    toastEl.classList.remove("opacity-0", "translate-y-2");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.add("opacity-0", "translate-y-2");
    }, 2200);
  }

  // ---------- Skeleton shimmer while the menu loads ----------
  function showSkeleton(n = 8) {
    menuGrid.innerHTML = "";
    for (let i = 0; i < n; i++) {
      const sk = document.createElement("div");
      sk.className = "skeleton-card";
      sk.innerHTML = `
        <div class="skeleton-block h-28"></div>
        <div class="p-4 space-y-2">
          <div class="skeleton-block h-4 w-3/4 rounded"></div>
          <div class="skeleton-block h-3 w-full rounded"></div>
          <div class="skeleton-block h-3 w-1/2 rounded"></div>
        </div>`;
      menuGrid.appendChild(sk);
    }
  }

  // ============================================================
  // Task 5 — AJAX: load the menu from data/menu.json via fetch()
  // ============================================================
  async function loadMenu() {
    showSkeleton();
    try {
      const response = await fetch("data/menu.json");
      if (!response.ok) throw new Error("HTTP " + response.status);
      const data = await response.json();
      menuItems = data.items;
      menuStatus.textContent = "";
    } catch (err) {
      // Fallback for file:// browsing (fetch blocked without a local server)
      console.warn("AJAX fetch failed, using embedded fallback data:", err);
      menuItems = FALLBACK_MENU;
      menuStatus.textContent =
        "Note: menu loaded from fallback data. Run a local server (e.g. VS Code Live Server) to see the AJAX fetch in action.";
    }
    renderCategories();
    renderMenu();
  }

  // ---------- Categories ----------
  function renderCategories() {
    const categories = ["All", ...new Set(menuItems.map((i) => i.category))];
    categoryChips.innerHTML = "";
    categories.forEach((cat) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip" + (cat === activeCategory ? " active" : "");
      btn.textContent = cat;
      btn.addEventListener("click", () => {
        activeCategory = cat;
        renderCategories();
        renderMenu();
      });
      categoryChips.appendChild(btn);
    });
  }

  // ---------- Menu grid ----------
  function renderMenu() {
    const q = searchQuery.trim().toLowerCase();
    const visible = menuItems.filter((item) => {
      const inCategory = activeCategory === "All" || item.category === activeCategory;
      const inSearch =
        q === "" ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q);
      return inCategory && inSearch;
    });

    menuGrid.innerHTML = "";

    if (visible.length === 0) {
      menuGrid.innerHTML =
        '<p class="col-span-full text-muted py-3">No dishes match your search. Try another keyword or category.</p>';
      return;
    }

    visible.forEach((item, idx) => {
      const card = document.createElement("article");
      card.className = "menu-card reveal bg-white border border-line rounded-2xl overflow-hidden flex flex-col";
      card.style.transitionDelay = (idx % 4) * 70 + "ms";
      card.innerHTML = `
        <div class="grid place-items-center text-5xl py-7 bg-gradient-to-b from-marigold/10 to-transparent" aria-hidden="true"><span class="menu-emoji-icon">${item.emoji}</span></div>
        <div class="p-4 flex flex-col flex-1">
          <div class="flex justify-between items-start gap-2 mb-1">
            <span class="font-bold">${item.name}</span>
            <span class="bg-ink text-marigold text-xs font-bold rounded-full px-2 py-0.5 shrink-0">★ ${item.rating.toFixed(1)}</span>
          </div>
          <p class="text-muted text-sm flex-1">${item.desc}</p>
          <div class="flex justify-between items-center mt-3">
            <span class="font-display font-extrabold text-lg">${fmt(item.price)}</span>
            <button class="btn-ghost btn-add" data-id="${item.id}">Add +</button>
          </div>
        </div>`;
      menuGrid.appendChild(card);
      revealObserver.observe(card);
    });
  }

  // Scroll-reveal observer (cards animate in as they enter the viewport)
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  // Event delegation: one listener for all "Add" buttons
  menuGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-add");
    if (!btn) return;
    addToCart(Number(btn.dataset.id));
    flyToCart(btn);
    buttonFeedback(btn);
  });

  // "Fly to cart" — an emoji leaps from the card into the cart button
  function flyToCart(fromBtn) {
    const card = fromBtn.closest(".menu-card");
    const emojiEl = card && card.querySelector(".menu-emoji-icon");
    const target = [...cartCountEls].find((el) => el && el.offsetParent !== null);
    if (!emojiEl || !target) return;

    const start = fromBtn.getBoundingClientRect();
    const end = target.getBoundingClientRect();

    const fly = document.createElement("span");
    fly.className = "fly-item";
    fly.textContent = emojiEl.textContent;
    fly.style.left = start.left + start.width / 2 + "px";
    fly.style.top = start.top + "px";
    document.body.appendChild(fly);

    requestAnimationFrame(() => {
      fly.style.transform =
        `translate(${end.left - start.left}px, ${end.top - start.top}px) scale(.25)`;
      fly.style.opacity = "0";
    });
    setTimeout(() => fly.remove(), 750);
  }

  // Button briefly confirms the add
  function buttonFeedback(btn) {
    if (btn.dataset.busy) return;
    btn.dataset.busy = "1";
    const original = btn.textContent;
    btn.textContent = "✓ Added";
    btn.classList.add("added");
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove("added");
      delete btn.dataset.busy;
    }, 900);
  }

  // ---------- Search (live, no refresh; desktop + mobile inputs) ----------
  searchInputs.forEach((input) => {
    if (!input) return;
    input.addEventListener("input", () => {
      searchQuery = input.value;
      searchInputs.forEach((other) => {
        if (other && other !== input) other.value = input.value;
      });
      renderMenu();
    });
  });

  // ---------- Cart (real-time updating) ----------
  function addToCart(id) {
    const item = menuItems.find((i) => i.id === id);
    if (!item) return;
    const entry = cart.get(id);
    if (entry) entry.qty += 1;
    else cart.set(id, { item, qty: 1 });
    renderCart();
    notify(`${item.name} added to your cart`);
  }

  function changeQty(id, delta) {
    const entry = cart.get(id);
    if (!entry) return;
    entry.qty += delta;
    if (entry.qty <= 0) cart.delete(id);
    renderCart();
  }

  function renderCart() {
    let count = 0;
    let subtotal = 0;

    cartItemsEl.innerHTML = "";

    if (cart.size === 0) {
      cartItemsEl.innerHTML =
        '<div class="text-muted text-center py-16">Your ticket is empty.<br />Add something tasty from the menu!</div>';
    } else {
      cart.forEach(({ item, qty }) => {
        count += qty;
        subtotal += item.price * qty;

        const row = document.createElement("div");
        row.className = "flex items-center gap-3 py-3 border-b border-dashed border-line";
        row.innerHTML = `
          <span class="text-2xl" aria-hidden="true">${item.emoji}</span>
          <div class="flex-1">
            <div class="font-semibold text-sm">${item.name}</div>
            <div class="text-muted text-xs">${fmt(item.price)} each</div>
          </div>
          <div class="flex items-center gap-1">
            <button class="qty-btn w-7 h-7 border border-line rounded-lg font-bold hover:border-brand-light hover:text-brand-light" data-id="${item.id}" data-delta="-1" aria-label="Decrease quantity">−</button>
            <span class="min-w-6 text-center font-semibold">${qty}</span>
            <button class="qty-btn w-7 h-7 border border-line rounded-lg font-bold hover:border-brand-light hover:text-brand-light" data-id="${item.id}" data-delta="1" aria-label="Increase quantity">+</button>
          </div>`;
        cartItemsEl.appendChild(row);
      });
    }

    const total = cart.size === 0 ? 0 : subtotal + DELIVERY_FEE;

    cartCountEls.forEach((el) => {
      if (!el) return;
      if (el.textContent !== String(count)) {
        el.textContent = count;
        el.classList.remove("badge-pop");
        void el.offsetWidth; // restart animation
        el.classList.add("badge-pop");
      }
    });
    cartSubtotalEl.textContent = fmt(subtotal);
    cartDeliveryEl.textContent = cart.size === 0 ? "$0.00" : fmt(DELIVERY_FEE);
    animateTotal(total);
    checkoutBtn.disabled = cart.size === 0;
  }

  // Smooth count-up/down animation on the cart total
  let displayedTotal = 0;
  let totalAnimFrame = null;
  function animateTotal(target) {
    cancelAnimationFrame(totalAnimFrame);
    const from = displayedTotal;
    const startTime = performance.now();
    const DURATION = 350;
    function tick(now) {
      const t = Math.min((now - startTime) / DURATION, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = from + (target - from) * eased;
      cartTotalEl.textContent = fmt(value);
      if (t < 1) totalAnimFrame = requestAnimationFrame(tick);
      else displayedTotal = target;
    }
    totalAnimFrame = requestAnimationFrame(tick);
  }

  cartItemsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".qty-btn");
    if (!btn) return;
    changeQty(Number(btn.dataset.id), Number(btn.dataset.delta));
  });

  // ---------- Checkout form validation (Task 4) ----------
  const nameInput = document.getElementById("custName");
  const phoneInput = document.getElementById("custPhone");
  const addressInput = document.getElementById("custAddress");

  function mark(el, ok) {
    el.classList.toggle("input-error", !ok);
    const msg = document.getElementById(el.id + "Error");
    if (msg) msg.classList.toggle("hidden", ok);
    return ok;
  }

  const validators = {
    name: () => mark(nameInput, nameInput.value.trim().length >= 3),
    phone: () => mark(phoneInput, /^\d{10}$/.test(phoneInput.value.trim())),
    address: () => mark(addressInput, addressInput.value.trim().length >= 10),
  };

  nameInput.addEventListener("input", validators.name);
  phoneInput.addEventListener("input", validators.phone);
  addressInput.addEventListener("input", validators.address);

  confirmOrderBtn.addEventListener("click", () => {
    const allValid =
      [validators.name(), validators.phone(), validators.address()].every(Boolean);
    if (!allValid) return;

    const orderId = "BB-" + Math.floor(1000 + Math.random() * 9000);

    // Reset cart and form
    cart.clear();
    renderCart();
    [nameInput, phoneInput, addressInput].forEach((el) => {
      el.value = "";
      el.classList.remove("input-error");
      const msg = document.getElementById(el.id + "Error");
      if (msg) msg.classList.add("hidden");
    });

    closeModal();
    notify(`Payment received — order ${orderId} placed! Your food is on the way 🚚`);
  });

  // ---------- Fallback data (used only when fetch is unavailable) ----------
  const FALLBACK_MENU = [
    { id: 1, name: "Cheese Burger", category: "Burgers", price: 13, rating: 4.3, emoji: "🍔", desc: "Double cheddar, toasted brioche, house sauce." },
    { id: 2, name: "Elk Burger", category: "Burgers", price: 15, rating: 4.5, emoji: "🍔", desc: "Lean elk patty, caramelised onion, smoked mayo." },
    { id: 3, name: "Veggie Burger", category: "Burgers", price: 11, rating: 4.1, emoji: "🥬", desc: "Chickpea-beet patty, avocado, garlic aioli." },
    { id: 4, name: "Margherita Pizza", category: "Pizza", price: 14, rating: 4.6, emoji: "🍕", desc: "San Marzano tomato, fior di latte, basil." },
    { id: 5, name: "Pepperoni Pizza", category: "Pizza", price: 16, rating: 4.7, emoji: "🍕", desc: "Cup-and-char pepperoni, hot honey drizzle." },
    { id: 6, name: "Chicken Burrito", category: "Burritos", price: 12, rating: 4.2, emoji: "🌯", desc: "Grilled chicken, cilantro-lime rice, black beans." },
    { id: 7, name: "Veggie Burrito", category: "Burritos", price: 10, rating: 4.0, emoji: "🌯", desc: "Roasted peppers, corn salsa, guacamole." },
    { id: 8, name: "Chocolate Lava Cake", category: "Desserts", price: 8, rating: 4.8, emoji: "🍫", desc: "Molten centre, vanilla bean ice cream." },
    { id: 9, name: "New York Cheesecake", category: "Desserts", price: 7, rating: 4.5, emoji: "🍰", desc: "Classic baked cheesecake, berry compote." },
    { id: 10, name: "Glazed Donut Box", category: "Donuts", price: 9, rating: 4.4, emoji: "🍩", desc: "Six assorted glazed donuts, baked daily." },
    { id: 11, name: "Cold Brew Coffee", category: "Beverages", price: 5, rating: 4.3, emoji: "🥤", desc: "18-hour steep, served over ice." },
    { id: 12, name: "Mango Lassi", category: "Beverages", price: 6, rating: 4.6, emoji: "🥭", desc: "Alphonso mango, cardamom, thick yogurt." },
    { id: 13, name: "Paneer Tikka Pizza", category: "Pizza", price: 15, rating: 4.4, emoji: "🍕", desc: "Char-grilled paneer, onion, mint chutney drizzle." },
    { id: 14, name: "Crispy Chicken Wings", category: "Sides", price: 10, rating: 4.5, emoji: "🍗", desc: "Six wings tossed in smoky BBQ glaze." },
    { id: 15, name: "Loaded Fries", category: "Sides", price: 8, rating: 4.3, emoji: "🍟", desc: "Cheese sauce, jalapeños, spring onion." },
    { id: 16, name: "Garlic Breadsticks", category: "Sides", price: 6, rating: 4.2, emoji: "🥖", desc: "Herb butter, parmesan, marinara dip." },
    { id: 17, name: "Chicken Biryani Bowl", category: "Rice Bowls", price: 14, rating: 4.7, emoji: "🍛", desc: "Fragrant basmati, saffron, raita on the side." },
    { id: 18, name: "Buddha Bowl", category: "Rice Bowls", price: 12, rating: 4.1, emoji: "🥗", desc: "Quinoa, roasted veg, hummus, tahini dressing." },
    { id: 19, name: "Strawberry Shake", category: "Beverages", price: 7, rating: 4.4, emoji: "🍓", desc: "Fresh strawberries, vanilla ice cream, whipped top." },
    { id: 20, name: "Masala Chai", category: "Beverages", price: 4, rating: 4.6, emoji: "☕", desc: "Slow-brewed with ginger, cardamom, and clove." },
    { id: 21, name: "Boston Cream Donut", category: "Donuts", price: 6, rating: 4.5, emoji: "🍩", desc: "Custard-filled, dipped in dark chocolate glaze." },
    { id: 22, name: "Chocolate Sprinkle Donut", category: "Donuts", price: 5, rating: 4.3, emoji: "🍩", desc: "Yeast-raised ring, chocolate icing, rainbow sprinkles." },
    { id: 23, name: "Cinnamon Sugar Twist", category: "Donuts", price: 5, rating: 4.4, emoji: "🍩", desc: "Hand-twisted dough, buttery cinnamon-sugar coating." },
    { id: 24, name: "Tiramisu Cup", category: "Desserts", price: 8, rating: 4.7, emoji: "🍮", desc: "Espresso-soaked ladyfingers, mascarpone, cocoa dust." },
    { id: 25, name: "Brownie Sundae", category: "Desserts", price: 9, rating: 4.6, emoji: "🍨", desc: "Warm fudge brownie, vanilla scoop, hot chocolate sauce." },
    { id: 26, name: "Gulab Jamun (2 pc)", category: "Desserts", price: 6, rating: 4.8, emoji: "🍡", desc: "Soft milk-solid dumplings soaked in cardamom syrup." },
    { id: 27, name: "Egg Fried Rice Bowl", category: "Rice Bowls", price: 10, rating: 4.3, emoji: "🍚", desc: "Wok-tossed rice, scrambled egg, spring onion, soy." },
    { id: 28, name: "Paneer Tikka Rice Bowl", category: "Rice Bowls", price: 12, rating: 4.5, emoji: "🍛", desc: "Char-grilled paneer over turmeric rice, mint yogurt." },
    { id: 29, name: "BBQ Chicken Pizza", category: "Pizza", price: 17, rating: 4.6, emoji: "🍕", desc: "Smoky BBQ base, grilled chicken, red onion, cilantro." },
    { id: 30, name: "Farmhouse Pizza", category: "Pizza", price: 15, rating: 4.4, emoji: "🍕", desc: "Mushroom, capsicum, sweet corn, extra mozzarella." },
    { id: 31, name: "Four Cheese Pizza", category: "Pizza", price: 18, rating: 4.7, emoji: "🧀", desc: "Mozzarella, cheddar, parmesan, gorgonzola." },
    { id: 32, name: "Peri Peri Veggie Pizza", category: "Pizza", price: 15, rating: 4.3, emoji: "🌶️", desc: "Fiery peri peri sauce, paprika veggies, olives." },
    { id: 33, name: "Double Bacon Burger", category: "Burgers", price: 16, rating: 4.7, emoji: "🥓", desc: "Two patties, crispy bacon, smoked cheddar, BBQ mayo." },
    { id: 34, name: "Crispy Chicken Burger", category: "Burgers", price: 13, rating: 4.4, emoji: "🍗", desc: "Buttermilk-fried fillet, pickles, spicy mayo." },
    { id: 35, name: "Mushroom Swiss Burger", category: "Burgers", price: 14, rating: 4.3, emoji: "🍄", desc: "Sautéed mushrooms, melted Swiss, garlic butter bun." },
    { id: 36, name: "Peri Peri Paneer Burger", category: "Burgers", price: 12, rating: 4.2, emoji: "🧀", desc: "Grilled paneer slab, peri peri sauce, slaw." },
    { id: 37, name: "Paneer Wrap", category: "Burritos", price: 11, rating: 4.2, emoji: "🌯", desc: "Spiced paneer, crunchy slaw, mint chutney in a soft wrap." },
    { id: 38, name: "Beef Burrito", category: "Burritos", price: 14, rating: 4.5, emoji: "🌯", desc: "Slow-cooked beef, pinto beans, pico de gallo." },
    { id: 39, name: "Breakfast Burrito", category: "Burritos", price: 10, rating: 4.1, emoji: "🍳", desc: "Scrambled eggs, hash browns, cheese, salsa roja." },
    { id: 40, name: "Onion Rings", category: "Sides", price: 6, rating: 4.1, emoji: "🧅", desc: "Beer-battered rings, served with chipotle dip." },
    { id: 41, name: "Mozzarella Sticks", category: "Sides", price: 8, rating: 4.4, emoji: "🧀", desc: "Golden-fried, gooey centre, marinara dip." },
    { id: 42, name: "Peri Peri Fries", category: "Sides", price: 7, rating: 4.3, emoji: "🍟", desc: "Shoestring fries dusted with peri peri masala." },
    { id: 43, name: "Coleslaw Cup", category: "Sides", price: 4, rating: 4.0, emoji: "🥗", desc: "Creamy cabbage-carrot slaw, house dressing." },
    { id: 44, name: "Veg Manchurian Bowl", category: "Rice Bowls", price: 11, rating: 4.3, emoji: "🍚", desc: "Crispy veg balls in tangy sauce over fried rice." },
    { id: 45, name: "Teriyaki Chicken Bowl", category: "Rice Bowls", price: 13, rating: 4.6, emoji: "🍱", desc: "Glazed chicken, steamed rice, sesame, scallions." },
    { id: 46, name: "Rajma Chawal Bowl", category: "Rice Bowls", price: 10, rating: 4.4, emoji: "🍛", desc: "Slow-simmered kidney beans over jeera rice." },
    { id: 47, name: "Schezwan Fried Rice Bowl", category: "Rice Bowls", price: 11, rating: 4.2, emoji: "🍚", desc: "Spicy Schezwan rice with crunchy vegetables." },
    { id: 48, name: "Mango Cheesecake Jar", category: "Desserts", price: 8, rating: 4.6, emoji: "🥭", desc: "Layered mango purée, cream cheese, biscuit crumble." },
    { id: 49, name: "Ice Cream Sandwich", category: "Desserts", price: 6, rating: 4.3, emoji: "🍦", desc: "Vanilla scoop pressed between chocolate cookies." },
    { id: 50, name: "Rasmalai (2 pc)", category: "Desserts", price: 7, rating: 4.7, emoji: "🥛", desc: "Soft cheese discs in saffron-cardamom milk." },
    { id: 51, name: "Apple Pie Slice", category: "Desserts", price: 7, rating: 4.4, emoji: "🥧", desc: "Cinnamon apples, flaky crust, served warm." },
    { id: 52, name: "Red Velvet Donut", category: "Donuts", price: 6, rating: 4.5, emoji: "🍩", desc: "Cream-cheese glaze over a soft red velvet ring." },
    { id: 53, name: "Nutella-Filled Donut", category: "Donuts", price: 6, rating: 4.8, emoji: "🍫", desc: "Pillowy donut piped full of hazelnut spread." },
    { id: 54, name: "Maple Glazed Donut", category: "Donuts", price: 5, rating: 4.3, emoji: "🍁", desc: "Classic ring dipped in real maple glaze." },
    { id: 55, name: "Fresh Lime Soda", category: "Beverages", price: 4, rating: 4.2, emoji: "🍋", desc: "Sweet-and-salty sparkling lime, made to order." },
    { id: 56, name: "Oreo Milkshake", category: "Beverages", price: 7, rating: 4.6, emoji: "🥤", desc: "Blended Oreos, vanilla ice cream, chocolate drizzle." },
    { id: 57, name: "Watermelon Cooler", category: "Beverages", price: 5, rating: 4.1, emoji: "🍉", desc: "Chilled watermelon juice, hint of mint." },
    { id: 58, name: "Filter Coffee", category: "Beverages", price: 4, rating: 4.5, emoji: "☕", desc: "Strong South Indian filter brew with frothy milk." }
  ];

  // ---------- Init ----------
  renderCart();
  loadMenu();
})();
