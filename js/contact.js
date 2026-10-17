/* =====================================================
   CONTACT.JS
   Validates the Contact Us form, then really sends it as an
   email using Web3Forms (a free form-to-email service — the
   site itself still has no backend of its own). A copy of
   every message is also saved in localStorage as a backup.

   Setup: paste your Web3Forms access key below. The key is
   meant to be public (it can only send mail to *your* inbox),
   so it's fine to keep it in frontend code.
   ===================================================== */

const WEB3FORMS_ACCESS_KEY = "PASTE_MY_KEY_HERE";
const WEB3FORMS_URL = "https://api.web3forms.com/submit";
const SUCCESS_HIDE_MS = 4000; // how long the success message stays visible

// Remembers the "hide the success message" timer, so an old
// timer can't hide a newer message.
let contactMessageTimer = null;

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", async function (event) {
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

    // Backup copy first, so the message is kept even if sending fails.
    const allMessages = JSON.parse(localStorage.getItem("contactMessages")) || [];
    allMessages.push({ name, email, phone, subject, message, date: new Date().toLocaleString() });
    localStorage.setItem("contactMessages", JSON.stringify(allMessages));

    if (WEB3FORMS_ACCESS_KEY === "PASTE_MY_KEY_HERE") {
      showContactStatus("The contact form isn't set up yet (missing Web3Forms access key).", true);
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    hideContactStatus();

    const payload = {
      access_key: WEB3FORMS_ACCESS_KEY,
      name: name,
      email: email,
      phone: phone,
      subject: subject,
      message: message,
      from_name: "Placement Prep Portal",
    };

    // Honeypot: real people never see this checkbox, so if it's
    // ticked a bot filled in the form. Passing it on lets
    // Web3Forms reject the submission as spam.
    if (form.elements.botcheck && form.elements.botcheck.checked) {
      payload.botcheck = true;
    }

    try {
      const response = await fetch(WEB3FORMS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (result.success === true) {
        showContactStatus("Thank you! Your message has been submitted successfully.", false);
        form.reset();
      } else {
        // Web3Forms explains what went wrong in result.message.
        const reason = result.message ? " (" + result.message + ")" : "";
        showContactStatus("Sorry, your message could not be sent" + reason + ". Please try again.", true);
      }
    } catch (error) {
      // fetch() throws when offline; .json() throws on a non-JSON reply.
      showContactStatus("Could not reach the email service. Check your connection and try again.", true);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });

  form.addEventListener("reset", function () {
    ["contactName", "contactEmail", "contactPhone", "contactSubject", "contactMessage"]
      .forEach(clearContactError);
  });
});

// Shows a message in the box above the form. Success messages
// fade away after a few seconds; error messages stay put so the
// user can read them. textContent keeps it plain text.
function showContactStatus(text, isError) {
  const statusBox = document.getElementById("contact-success");
  if (!statusBox) return;

  clearTimeout(contactMessageTimer);
  statusBox.textContent = text;
  statusBox.classList.toggle("error", isError);
  statusBox.classList.add("show");

  if (!isError) {
    contactMessageTimer = setTimeout(hideContactStatus, SUCCESS_HIDE_MS);
  }
}

function hideContactStatus() {
  const statusBox = document.getElementById("contact-success");
  if (!statusBox) return;
  clearTimeout(contactMessageTimer);
  statusBox.classList.remove("show", "error");
}

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
