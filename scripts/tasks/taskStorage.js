/**
 * Tasks stored for ALL users in one list, but each has ownerId.
 * loadTasks() returns ONLY the logged-in user's personal tasks.
 */
const TASKS_KEY = "duto_tasks";

function loadAllTasks() {
  let tasks = loadData(TASKS_KEY, []);
  return Array.isArray(tasks) ? tasks : [];
}

function saveAllTasks(tasks) {
  saveData(TASKS_KEY, tasks);
}

/** Personal tasks for the current user only */
function loadTasks() {
  let me = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  let all = loadAllTasks();
  if (!me) return [];
  let mine = [];
  for (let i = 0; i < all.length; i++) {
    // New tasks have ownerId; old tasks without ownerId are hidden (not shared)
    if (all[i].ownerId === me.id) {
      mine.push(all[i]);
    }
  }
  return mine;
}

function saveTasks(userTasks) {
  // Merge current user's tasks back into the full list
  let me = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  if (!me) return;
  let all = loadAllTasks();
  let others = [];
  for (let i = 0; i < all.length; i++) {
    if (all[i].ownerId !== me.id) {
      others.push(all[i]);
    }
  }
  // ensure ownerId on each
  for (let j = 0; j < userTasks.length; j++) {
    userTasks[j].ownerId = me.id;
  }
  saveAllTasks(others.concat(userTasks));
}
