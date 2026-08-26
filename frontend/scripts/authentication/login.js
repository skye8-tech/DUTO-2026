document.addEventListener("DOMContentLoaded", function () {
  let form = document.getElementById("login-form");

  if (!form) {
    return; // not on the login page
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    let email = document.getElementById("login-email").value.trim();
    let password = document.getElementById("login-password").value;

    if (email === "" || password === "") {
      alert("Please enter email and password.");
      return;
    }

    let result = loginUser(email, password);

    if (result.ok === true) {
      // Go to the app
      window.location.href = "dashboard.html";
    } else {
      alert(result.message);
    }
  });
});