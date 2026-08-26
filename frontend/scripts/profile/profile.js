// Protecting this page
requireLogin();


document.addEventListener("DOMContentLoaded", initializeProfilePage);

function initializeProfilePage() {

    // Get the logged in user
    let currentUser = getCurrentUser();

    if (currentUser === null) {
        window.location.href = "login.html";
        return;
    }

    // Get the complete user object
    let user = findUserByEmail(currentUser.email);

    if (user === null) {
        logoutUser();
        window.location.href = "login.html";
        return;
    }

    displayProfile(user);
    setupButtons();
}


// DISPLAY PROFILE

function displayProfile(user) {

    // Header
    document.getElementById("profile-full-name").textContent =
        user.fullName;

    document.getElementById("profile-email").textContent =
        user.email;

    // Academic information
    document.getElementById("detail-full-name").textContent =
        user.fullName;

    document.getElementById("detail-email").textContent =
        user.email;

    document.getElementById("detail-university").textContent =
        user.university || "Not provided";

    document.getElementById("detail-major").textContent =
        user.major || "Not provided";

    document.getElementById("detail-year").textContent =
        user.year || "Not provided";

    document.getElementById("detail-member-since").textContent =
        user.memberSince || "July 2026";

    // Short academic summary
    let summary = "";

    if (user.major) {
        summary += user.major;
    } else {
        summary += "Major not set";
    }

    summary += " · ";

    if (user.year) {
        summary += "Year " + user.year;
    } else {
        summary += "Year not set";
    }

    document.getElementById("profile-major").textContent =
        summary;

    // Avatar letter
    let avatar = document.getElementById("profile-picture-placeholder");

    avatar.textContent =
        user.fullName.charAt(0).toUpperCase();

    // Placeholder statistics
    document.getElementById("profile-tasks-completed").textContent =
        user.tasksCompleted || 0;

    document.getElementById("profile-study-hours").textContent =
        user.studyHours || 0;

    document.getElementById("profile-streak").textContent =
        user.studyStreak || 0;
}


// BUTTONS

function setupButtons() {

    let editButton =
        document.getElementById("edit-profile-button");

    if (editButton) {

        editButton.addEventListener("click", function () {

            alert(
                "Profile editing will be added later."
            );

        });

    }


    let logoutButton =
        document.getElementById("logout-button");

    if (logoutButton) {

        logoutButton.addEventListener("click", function (event) {

            event.preventDefault();

            logoutUser();

            window.location.href = "login.html";

        });

    }

}