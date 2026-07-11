# Bite Bazaar — Online Food Ordering Application

Course-end Project 1 · Full Stack Development Program

A responsive online food ordering frontend built with **HTML, CSS, JavaScript, and Tailwind CSS**. Users can browse the menu, search and filter by category, manage a real-time cart, and place orders. An admin login page validates credentials before granting access.

## How to run

The AJAX call (`fetch("data/menu.json")`) needs the site to be served over HTTP, so run a local server from the project folder:

**Option A — VS Code Live Server:** right-click `index.html` → "Open with Live Server".

**Option B — Python:**
```bash
cd food-ordering-app
python -m http.server 5500
```
Then open http://localhost:5500

(Opening `index.html` directly via double-click also works — the app detects the blocked fetch and falls back to embedded data — but use a server to demonstrate Task 5 properly.)

**Admin demo credentials:** `admin@gmail.com` / `admin@123` (on `login.html`)

## Task 1 — Set up the remote Git repository

```bash
# 1. Create a new empty repository on GitHub named food-ordering-app (no README)

# 2. In the project folder:
git init
git add .
git commit -m "Initial commit: online food ordering app frontend"

# 3. Connect and push to GitHub:
git branch -M main
git remote add origin https://github.com/<your-username>/food-ordering-app.git
git push -u origin main
```

Suggested incremental commits to show development history:
```bash
git commit -m "Add HTML structure for menu, login, about, contact pages"  # Task 2
git commit -m "Style pages with Tailwind and custom CSS, responsive"      # Task 3
git commit -m "Add JS: cart, search, filters, form validation"            # Task 4
git commit -m "Load menu items via AJAX fetch from menu.json"             # Task 5
```

## How each task is covered

| Task | Where |
|------|-------|
| 1. Git repository | Commands above; commit after each task |
| 2. HTML structure | `index.html` (navbar, photo hero, menu grid, cart drawer, checkout modal), `login.html`, `about.html`, `contact.html` |
| 3. CSS styling & responsiveness | Tailwind utility classes for layout/spacing + `css/styles.css` for custom components (buttons, chips, cards, hero photo collage, login photo panel, drawer, modal, toast, form states); responsive down to mobile |
| 4. JavaScript interactivity | `js/app.js` — live search, category filter chips, real-time cart with quantity controls, checkout form validation, event delegation, plus hand-built UI in vanilla JS (mobile menu, sliding cart drawer, checkout modal, toast — no component library); `js/login.js` and `js/contact.js` — form validation & events |
| 5. AJAX | `js/app.js` → `loadMenu()` uses `fetch()` to load `data/menu.json` and renders the grid without a page refresh |

## Project structure

```
food-ordering-app/
├── index.html          # User dashboard / menu page (photo hero, no hardcoded data)
├── about.html           # About Us (separate page)
├── contact.html         # Contact Us with validated form (separate page)
├── login.html            # Admin login page (kitchen photo background)
├── css/
│   └── styles.css      # Custom components on top of Tailwind
├── js/
│   ├── app.js           # Menu, cart, search, checkout, AJAX
│   ├── contact.js       # Contact form validation
│   └── login.js         # Login validation & events
├── data/
│   └── menu.json         # Menu items loaded via AJAX
└── README.md
```

## Features

- **Menu browsing** — 58 items across 8 categories (Burgers, Pizza, Burritos, Sides, Rice Bowls, Desserts, Donuts, Beverages), rendered dynamically
- **Real food photography** — hero section and admin login page use real photos (free Unsplash-licensed images) instead of placeholder/hardcoded content
- **Live search** — filters by name, category, or description as you type
- **Category chips** — one-click filtering
- **Real-time cart** — badge count, quantity +/−, subtotal, delivery fee, total, all updated instantly
- **Checkout validation** — name (≥3 chars), 10-digit phone, address (≥10 chars) with inline feedback
- **Admin login** — email format + password length validation, show/hide password, success/failure alerts
- **Separate About & Contact pages** — multi-page site with shared navbar and styles; contact form with full validation
- **Responsive** — works on mobile through desktop
- **Accessible** — keyboard focus styles, aria labels, reduced-motion support

## Menu categories at a glance

- **Burgers** — Cheese Burger, Elk Burger, Veggie Burger
- **Pizza** — Margherita, Pepperoni, Paneer Tikka
- **Burritos** — Chicken, Veggie
- **Sides** — Wings, Loaded Fries, Garlic Breadsticks
- **Rice Bowls** — Chicken Biryani Bowl, Buddha Bowl, Egg Fried Rice Bowl, Paneer Tikka Rice Bowl
- **Desserts** — Chocolate Lava Cake, New York Cheesecake, Tiramisu Cup, Brownie Sundae, Gulab Jamun
- **Donuts** — Glazed Box, Boston Cream, Chocolate Sprinkle, Cinnamon Sugar Twist
- **Beverages** — Cold Brew, Mango Lassi, Strawberry Shake, Masala Chai
