/**
 * Personal task CRUD — always tied to logged-in user
 */

function addTask(title, priority, dueDate, description) {
  let me = getCurrentUser();
  if (!me) return null;

  let tasks = loadTasks();
  let newTask = {
    id: makeId(),
    ownerId: me.id,
    title: title,
    description: description || "",
    priority: priority || "medium",
    dueDate: dueDate || "",
    completed: false,
    status: "todo",
    createdAt: new Date().toISOString()
  };
  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
}

function updateTask(taskId, fields) {
  let me = getCurrentUser();
  if (!me) return false;
  let all = loadAllTasks();
  for (let i = 0; i < all.length; i++) {
    if (all[i].id === taskId && all[i].ownerId === me.id) {
      let keys = Object.keys(fields);
      for (let k = 0; k < keys.length; k++) {
        all[i][keys[k]] = fields[keys[k]];
      }
      saveAllTasks(all);
      return true;
    }
  }
  return false;
}

function toggleTaskComplete(taskId) {
  let me = getCurrentUser();
  if (!me) return;
  let all = loadAllTasks();
  for (let i = 0; i < all.length; i++) {
    if (all[i].id === taskId && all[i].ownerId === me.id) {
      all[i].completed = !all[i].completed;
      all[i].status = all[i].completed ? "done" : "todo";
      saveAllTasks(all);
      return;
    }
  }
}

function deleteTask(taskId) {
  let me = getCurrentUser();
  if (!me) return;
  let all = loadAllTasks();
  let next = [];
  for (let i = 0; i < all.length; i++) {
    if (!(all[i].id === taskId && all[i].ownerId === me.id)) {
      // keep if not this user's task being deleted
      if (all[i].id !== taskId || all[i].ownerId !== me.id) {
        next.push(all[i]);
      }
    }
  }
  // clearer filter
  next = all.filter(function (t) {
    return !(t.id === taskId && t.ownerId === me.id);
  });
  saveAllTasks(next);
}

function getTaskById(taskId) {
  let me = getCurrentUser();
  let all = loadAllTasks();
  for (let i = 0; i < all.length; i++) {
    if (all[i].id === taskId && me && all[i].ownerId === me.id) {
      return all[i];
    }
  }
  return null;
}
