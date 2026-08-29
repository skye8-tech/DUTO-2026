document.addEventListener("DOMContentLoaded", function () {
  let form = document.getElementById("signup-form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    let fullName = document.getElementById("signup-fullname").value.trim();
    let usernameEl = document.getElementById("signup-username");
    let username = usernameEl ? usernameEl.value.trim() : "";
    let email = document.getElementById("signup-email").value.trim();
    let password = document.getElementById("signup-password").value;
    let confirmPassword = document.getElementById("signup-confirm-password").value;
    let terms = document.getElementById("signup-terms");

    if (!fullName || !username || !email || !password) {
      showError("Please complete all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      showError("Passwords do not match.");
      return;
    }
    if (password.length < 4) {
      showError("Password must be at least 4 characters.");
      return;
    }
    if (terms && !terms.checked) {
      showError("Please accept the terms to continue.");
      return;
    }

    let result = registerUser(fullName, username, email, password);
    if (result.ok) {
      showSuccess("Account created.");
      setTimeout(function () {
        window.location.href = "login.html";
      }, 800);
    } else {
      showError(result.message);
    }
  });
});
