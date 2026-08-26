//logic ti render tasks

function addTask(title, priority, dueDate) {
  let tasks = loadTasks();

  let newTask = {
    id: makeId(),
    title: title,
    priority: priority,
    dueDate: dueDate,
    completed: false
  };

  tasks.push(newTask);
  saveTasks(tasks);

  return newTask;
}

function toggleTaskComplete(taskId) {
  let tasks = loadTasks();
  let i;

  for (i = 0; i < tasks.length; i++) {
    if (tasks[i].id === taskId) {
      tasks[i].completed = !tasks[i].completed;
      break;
    }
  }

  saveTasks(tasks);
}

function deleteTask(taskId) {
  let tasks = loadTasks();
  let newList = [];
  let i;

  for (i = 0; i < tasks.length; i++) {
    if (tasks[i].id !== taskId) {
      newList.push(tasks[i]);
    }
  }

  saveTasks(newList);
}