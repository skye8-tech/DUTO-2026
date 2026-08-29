requireLogin();

document.addEventListener("DOMContentLoaded", initializeProfilePage);

function initializeProfilePage() {
  let currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }
  let user = findUserById(currentUser.id) || findUserByEmail(currentUser.email);
  if (!user) {
    logoutUser();
    window.location.href = "login.html";
    return;
  }
  displayProfile(user);
  setupButtons(user);
}

function displayProfile(user) {
  let set = function (id, val) {
    let el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  set("profile-full-name", user.fullName);
  set("profile-email", user.email + (user.username ? " · @" + user.username : ""));
  set("detail-full-name", user.fullName);
  set("detail-email", user.email);
  let uni = document.getElementById("detail-university");
  if (uni) uni.textContent = user.university || user.bio || "Not provided";
  set("detail-major", user.major || "Not provided");
  set("detail-year", user.year || "Not provided");
  set(
    "detail-member-since",
    user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"
  );
  let major = document.getElementById("profile-major");
  if (major) {
    major.textContent = user.username
      ? "@" + user.username + (user.bio ? " · " + user.bio : "")
      : user.bio || "No bio yet";
  }
  let avatar = document.getElementById("profile-picture-placeholder");
  if (avatar) avatar.textContent = (user.fullName || "?").charAt(0).toUpperCase();

  let tasks = typeof loadTasks === "function" ? loadTasks() : loadData("duto_tasks", []);
  let done = 0;
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].completed && (!tasks[i].ownerId || (getCurrentUser() && tasks[i].ownerId === getCurrentUser().id))) {
      done++;
    }
  }
  set("profile-tasks-completed", String(done));
  set("profile-study-hours", String(user.studyHours || 0));
  set("profile-streak", String(user.studyStreak || 0));
}

function setupButtons(user) {
  let editButton = document.getElementById("edit-profile-button");
  if (editButton) {
    editButton.addEventListener("click", function () {
      showFormModal({
        title: "Edit profile",
        submitLabel: "Save changes",
        fields: [
          { id: "fullName", label: "Full name", type: "text", value: user.fullName || "" },
          { id: "username", label: "Username", type: "text", value: user.username || "" },
          { id: "email", label: "Email", type: "text", value: user.email || "" },
          { id: "bio", label: "Bio", type: "textarea", value: user.bio || "" }
        ],
        onSubmit: function (data) {
          if (!data.fullName.trim() || !data.username.trim() || !data.email.trim()) {
            showError("Name, username and email are required.");
            return false;
          }
          let result = updateProfile({
            fullName: data.fullName,
            username: data.username,
            email: data.email,
            bio: data.bio
          });
          if (result.ok) {
            showSuccess(result.message);
            user = findUserById(getCurrentUser().id);
            displayProfile(user);
            setupButtons(user);
          } else {
            showError(result.message);
            return false;
          }
        }
      });
    });
  }

  let logoutBtn = document.getElementById("profile-logout-button");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (event) {
      event.preventDefault();
      logoutUser();
      window.location.href = "login.html";
    });
  }
}
