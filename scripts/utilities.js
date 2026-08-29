
function saveData(key, value) {
  //Convert the value to text so localStorage can store it
  let text = JSON.stringify(value);
  localStorage.setItem(key, text);
}

function loadData(key, defaultValue) {
  let text = localStorage.getItem(key);

  // If nothing was saved yet, return the default
  if (text === null) {
    return defaultValue; // themeManagerline 12
  }

  // Convert the text back to a normal value
  return JSON.parse(text);
}

function removeData(key) {
  localStorage.removeItem(key);
}

// Make a simple unique id (for tasks, schedules, etc. later)
function makeId() {
  return Date.now().toString();
}