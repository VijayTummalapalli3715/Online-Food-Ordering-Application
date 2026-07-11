/* ============================================================
   Task 4 — JavaScript: admin login form validation & events
   ============================================================ */

(function () {
  "use strict";

  // Demo credentials for the admin panel
  const ADMIN_EMAIL = "admin@gmail.com";
  const ADMIN_PASSWORD = "admin@123";

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const passwordError = document.getElementById("passwordError");
  const loginBtn = document.getElementById("loginBtn");
  const resetBtn = document.getElementById("resetBtn");
  const toggleBtn = document.getElementById("togglePassword");
  const alertBox = document.getElementById("loginAlert");

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function showAlert(message, type) {
    alertBox.textContent = message;
    alertBox.className = "alert mb-4 alert-" + type;
  }

  function mark(el, ok) {
    el.classList.toggle("input-error", !ok);
    const msg = document.getElementById(el.id + "Error");
    if (msg) msg.classList.toggle("hidden", ok);
    return ok;
  }

  function validateEmail() {
    return mark(emailInput, EMAIL_RE.test(emailInput.value.trim()));
  }

  function validatePassword() {
    const ok = passwordInput.value.length >= 8;
    passwordError.textContent = ok ? "" : "Password must be at least 8 characters.";
    return mark(passwordInput, ok);
  }

  // Live validation as the user types (user-event handling)
  emailInput.addEventListener("input", validateEmail);
  passwordInput.addEventListener("input", validatePassword);

  // Show / hide password
  toggleBtn.addEventListener("click", function () {
    const hidden = passwordInput.type === "password";
    passwordInput.type = hidden ? "text" : "password";
    toggleBtn.textContent = hidden ? "Hide" : "Show";
  });

  // Submit on Enter key
  [emailInput, passwordInput].forEach(function (el) {
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter") loginBtn.click();
    });
  });

  // Login
  loginBtn.addEventListener("click", function () {
    const emailOk = validateEmail();
    const passOk = validatePassword();
    if (!emailOk || !passOk) {
      showAlert("Please fix the highlighted fields before logging in.", "warning");
      return;
    }

    if (
      emailInput.value.trim().toLowerCase() === ADMIN_EMAIL &&
      passwordInput.value === ADMIN_PASSWORD
    ) {
      showAlert("Successfully logged in! Redirecting to the menu…", "success");
      window.alert("successfully login!"); // matches expected project output
      setTimeout(function () {
        window.location.href = "index.html";
      }, 600);
    } else {
      showAlert("Invalid email or password. Try the demo credentials below.", "danger");
    }
  });

  // Reset
  resetBtn.addEventListener("click", function () {
    [emailInput, passwordInput].forEach(function (el) {
      el.value = "";
      el.classList.remove("input-error");
      const msg = document.getElementById(el.id + "Error");
      if (msg) msg.classList.add("hidden");
    });
    alertBox.className = "alert hidden mb-4";
    emailInput.focus();
  });
})();
