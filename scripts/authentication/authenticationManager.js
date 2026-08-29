/**
 * Auth with localStorage (class demo)
 * Users: id, fullName, username, email, password, bio
 */
const USERS_KEY = "duto_users";
const CURRENT_USER_KEY = "duto_current_user";

function getAllUsers() {
  return loadData(USERS_KEY, []);
}

function saveAllUsers(users) {
  saveData(USERS_KEY, users);
}

function findUserByEmail(email) {
  let users = getAllUsers();
  let q = (email || "").toLowerCase().trim();
  for (let i = 0; i < users.length; i++) {
    if ((users[i].email || "").toLowerCase() === q) return users[i];
  }
  return null;
}

function findUserByUsername(username) {
  let users = getAllUsers();
  let q = (username || "").toLowerCase().trim();
  for (let i = 0; i < users.length; i++) {
    if ((users[i].username || "").toLowerCase() === q) return users[i];
  }
  return null;
}

function findUserById(id) {
  let users = getAllUsers();
  for (let i = 0; i < users.length; i++) {
    if (users[i].id === id) return users[i];
  }
  return null;
}

/** Login with email OR username */
function findUserByLogin(login) {
  let byEmail = findUserByEmail(login);
  if (byEmail) return byEmail;
  return findUserByUsername(login);
}

function searchUsers(query) {
  let users = getAllUsers();
  let q = (query || "").toLowerCase().trim();
  if (!q) return users;
  let out = [];
  for (let i = 0; i < users.length; i++) {
    let u = users[i];
    let hay =
      (u.fullName || "") +
      " " +
      (u.username || "") +
      " " +
      (u.email || "");
    if (hay.toLowerCase().indexOf(q) !== -1) out.push(u);
  }
  return out;
}

function registerUser(fullName, username, email, password) {
  username = (username || "").trim().toLowerCase();
  email = (email || "").trim().toLowerCase();
  fullName = (fullName || "").trim();

  if (!fullName || !username || !email || !password) {
    return { ok: false, message: "All fields are required." };
  }
  if (username.length < 3) {
    return { ok: false, message: "Username must be at least 3 characters long." };
  }
  if (password.length < 4) {
    return { ok: false, message: "Password must be at least 4 characters long." };
  }
  if (findUserByEmail(email)) {
    return { ok: false, message: "An account with this email already exists." };
  }
  if (findUserByUsername(username)) {
    return { ok: false, message: "This username is already in use." };
  }

  let users = getAllUsers();
  let newUser = {
    id: makeId(),
    fullName: fullName,
    username: username,
    email: email,
    password: password,
    bio: "",
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  saveAllUsers(users);
  return { ok: true, message: "Account created." };
}

function loginUser(login, password) {
  let user = findUserByLogin(login);
  if (!user) {
    return { ok: false, message: "No account matches that email or username." };
  }
  if (user.password !== password) {
    return { ok: false, message: "Incorrect password." };
  }
  let sessionUser = {
    id: user.id,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    bio: user.bio || ""
  };
  saveData(CURRENT_USER_KEY, sessionUser);
  return { ok: true, message: "Signed in." };
}

function getCurrentUser() {
  return loadData(CURRENT_USER_KEY, null);
}

function isLoggedIn() {
  return getCurrentUser() !== null;
}

function logoutUser() {
  removeData(CURRENT_USER_KEY);
}

function requireLogin() {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
  }
}

function updateProfile(fields) {
  let session = getCurrentUser();
  if (!session) return { ok: false, message: "Not logged in." };
  let users = getAllUsers();
  for (let i = 0; i < users.length; i++) {
    if (users[i].id === session.id) {
      if (fields.fullName) users[i].fullName = fields.fullName.trim();
      if (fields.bio !== undefined) users[i].bio = fields.bio;
      if (fields.username) {
        let un = fields.username.trim().toLowerCase();
        let other = findUserByUsername(un);
        if (other && other.id !== session.id) {
          return { ok: false, message: "Username taken." };
        }
        users[i].username = un;
      }
      if (fields.email) {
        let em = fields.email.trim().toLowerCase();
        let otherE = findUserByEmail(em);
        if (otherE && otherE.id !== session.id) {
          return { ok: false, message: "Email already used." };
        }
        users[i].email = em;
      }
      saveAllUsers(users);
      saveData(CURRENT_USER_KEY, {
        id: users[i].id,
        fullName: users[i].fullName,
        username: users[i].username,
        email: users[i].email,
        bio: users[i].bio || ""
      });
      return { ok: true, message: "Profile updated." };
    }
  }
  return { ok: false, message: "User not found." };
}

function changePassword(currentPassword, newPassword) {
  let session = getCurrentUser();
  if (!session) return { ok: false, message: "Not logged in." };
  let users = getAllUsers();
  for (let i = 0; i < users.length; i++) {
    if (users[i].id === session.id) {
      if (users[i].password !== currentPassword) {
        return { ok: false, message: "Current password is wrong." };
      }
      if (!newPassword || newPassword.length < 4) {
        return { ok: false, message: "New password too short." };
      }
      users[i].password = newPassword;
      saveAllUsers(users);
      return { ok: true, message: "Password changed." };
    }
  }
  return { ok: false, message: "User not found." };
}
