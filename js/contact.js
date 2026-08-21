/* =====================================================
   CONTACT.JS
   Validates and "submits" the Contact Us form. Since there
   is no backend, the message is saved into localStorage
   (so a real submission really is captured) and a success
   message is shown on screen.
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    let isFormValid = true;

    const name = document.getElementById("contactName").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const phone = document.getElementById("contactPhone").value.trim();
    const subject = document.getElementById("contactSubject").value.trim();
    const message = document.getElementById("contactMessage").value.trim();

    ["contactName", "contactEmail", "contactPhone", "contactSubject", "contactMessage"]
      .forEach(clearContactError);

    if (name === "") {
      showContactError("contactName", "Please enter your name.");
      isFormValid = false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      showContactError("contactEmail", "Please enter a valid email.");
      isFormValid = false;
    }

    const phonePattern = /^[0-9]{10}$/;
    if (!phonePattern.test(phone)) {
      showContactError("contactPhone", "Please enter a valid 10-digit phone number.");
      isFormValid = false;
    }

    if (subject === "") {
      showContactError("contactSubject", "Please enter a subject.");
      isFormValid = false;
    }

    if (message.length < 10) {
      showContactError("contactMessage", "Message should be at least 10 characters.");
      isFormValid = false;
    }

    if (!isFormValid) return;

    const allMessages = JSON.parse(localStorage.getItem("contactMessages")) || [];
    allMessages.push({ name, email, phone, subject, message, date: new Date().toLocaleString() });
    localStorage.setItem("contactMessages", JSON.stringify(allMessages));

    const successBox = document.getElementById("contact-success");
    successBox.textContent = "Thank you! Your message has been submitted successfully.";
    successBox.classList.add("show");

    form.reset();

    setTimeout(function () {
      successBox.classList.remove("show");
    }, 4000);
  });

  form.addEventListener("reset", function () {
    ["contactName", "contactEmail", "contactPhone", "contactSubject", "contactMessage"]
      .forEach(clearContactError);
  });
});

function showContactError(inputId, message) {
  const input = document.getElementById(inputId);
  const errorEl = document.getElementById(inputId + "-error");
  if (input) input.classList.add("invalid");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add("show");
  }
}

function clearContactError(inputId) {
  const input = document.getElementById(inputId);
  const errorEl = document.getElementById(inputId + "-error");
  if (input) input.classList.remove("invalid");
  if (errorEl) {
    errorEl.textContent = "";
    errorEl.classList.remove("show");
  }
}
