document.addEventListener("DOMContentLoaded", function () {
  let form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    let login = document.getElementById("login-email").value.trim();
    let password = document.getElementById("login-password").value;

    if (!login || !password) {
      showError("Enter your email or username and password.");
      return;
    }

    let result = loginUser(login, password);
    if (result.ok) {
      window.location.href = "dashboard.html";
    } else {
      showError(result.message);
    }
  });
});
