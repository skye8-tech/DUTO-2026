document.addEventListener("DOMContentLoaded", function () {
  let form = document.getElementById("signup-form");

  if (!form) {
    return; // if not on the signup page
  }

  form.addEventListener("submit", function (event) {
    // Stop the browser from reloading the page
    event.preventDefault();

    let fullName = document.getElementById("signup-fullname").value.trim();
    let email = document.getElementById("signup-email").value.trim();
    let password = document.getElementById("signup-password").value;
    let confirmPassword = document.getElementById("signup-confirm-password").value;
    let terms = document.getElementById("signup-terms");

    if (fullName === "" || email === "" || password === "") {
      alert("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      alert("Password should be at least 6 characters.");
      return;
    }

    if (terms && terms.checked === false) {
      alert("Please agree to the Terms of Service.");
      return;
    }

    // Try to register
    let result = registerUser(fullName, email, password);

    if (result.ok === true) {
      alert(result.message);
      // Go to login page
      window.location.href = "login.html";
    } else {
      alert(result.message);
    }
  });
});