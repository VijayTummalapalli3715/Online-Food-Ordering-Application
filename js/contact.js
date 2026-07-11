/* ============================================================
   Contact page — form validation & user events (Task 4)
   ============================================================ */

(function () {
  "use strict";

  const nameEl = document.getElementById("ctName");
  const emailEl = document.getElementById("ctEmail");
  const phoneEl = document.getElementById("ctPhone");
  const topicEl = document.getElementById("ctTopic");
  const messageEl = document.getElementById("ctMessage");
  const sendBtn = document.getElementById("ctSendBtn");
  const alertBox = document.getElementById("contactAlert");

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function mark(el, ok) {
    el.classList.toggle("input-error", !ok);
    const msg = document.getElementById(el.id + "Error");
    if (msg) msg.classList.toggle("hidden", ok);
    return ok;
  }

  const validators = {
    name: () => mark(nameEl, nameEl.value.trim().length >= 3),
    email: () => mark(emailEl, EMAIL_RE.test(emailEl.value.trim())),
    phone: () => {
      const v = phoneEl.value.trim();
      return mark(phoneEl, v === "" || /^\d{10}$/.test(v)); // optional field
    },
    topic: () => mark(topicEl, topicEl.value !== ""),
    message: () => mark(messageEl, messageEl.value.trim().length >= 15),
  };

  // Live validation
  nameEl.addEventListener("input", validators.name);
  emailEl.addEventListener("input", validators.email);
  phoneEl.addEventListener("input", validators.phone);
  topicEl.addEventListener("change", validators.topic);
  messageEl.addEventListener("input", validators.message);

  sendBtn.addEventListener("click", function () {
    const allValid = [
      validators.name(),
      validators.email(),
      validators.phone(),
      validators.topic(),
      validators.message(),
    ].every(Boolean);

    if (!allValid) return;

    // Show success and reset the form
    alertBox.classList.remove("hidden");
    [nameEl, emailEl, phoneEl, messageEl, topicEl].forEach(function (el) {
      el.value = "";
      el.classList.remove("input-error");
      const msg = document.getElementById(el.id + "Error");
      if (msg) msg.classList.add("hidden");
    });
    alertBox.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();
