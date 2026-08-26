var USERS_KEY = "duto_users";      // list of all signed-up users
var CURRENT_USER_KEY = "duto_current_user";  // CURRENTLY LOGGEDin now

// function to Get all users 
function getAllUsers() {
  return loadData(USERS_KEY, []);
}

// Save the list of users
function saveAllUsers(users) {
  saveData(USERS_KEY, users);
}

// FFind users by email
function findUserByEmail(email) {
  var users = getAllUsers();
  var i;
  for (i = 0; i < users.length; i++) {
    if (users[i].email === email) {
      return users[i];
    }
  }
  return null;
}

// Create a new user on signup)
function registerUser(fullName, email, password) {
  // Check if email already exists
  if (findUserByEmail(email) !== null) {
    return { ok: false, message: "This email is already registered." };
  }

  var users = getAllUsers();

  var newUser = {
    id: makeId(),
    fullName: fullName,
    email: email,
    password: password   
  };

  users.push(newUser);
  saveAllUsers(users);

  return { ok: true, message: "Account created successfully." };
}

//  to log in
function loginUser(email, password) {
  var user = findUserByEmail(email);

  if (user === null) {
    return { ok: false, message: "No account found with this email." };
  }

  if (user.password !== password) {
    return { ok: false, message: "Wrong password." };
  }

  //Save who is logged in (without password)
  var sessionUser = {
    id: user.id,
    fullName: user.fullName,
    email: user.email
  };

  saveData(CURRENT_USER_KEY, sessionUser);

  return { ok: true, message: "Login successful." };
}

//Who is logged in right now?
function getCurrentUser() {
  return loadData(CURRENT_USER_KEY, null);
}

//Is someone logged in?
function isLoggedIn() {
  return getCurrentUser() !== null;
}

//Log out
function logoutUser() {
  removeData(CURRENT_USER_KEY);
}

function requireLogin() {
  if (isLoggedIn() === false) {
    window.location.href = "login.html";
  }
}