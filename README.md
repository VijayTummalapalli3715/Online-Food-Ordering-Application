# Bite Bazaar — Online Food Ordering Application

Phase-end Project  · Full Stack Development Program

A responsive online food ordering frontend built with **HTML, CSS, JavaScript, and Tailwind CSS**. Users can browse the menu, search and filter by category, manage a real-time cart, and place orders. An admin login page validates credentials before granting access.

## Project structure

```
food-ordering-app/
├── index.html          # User dashboard / menu page 
├── about.html           # About Us 
├── contact.html         # Contact Us with validated form 
├── login.html            # Admin login page 
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
