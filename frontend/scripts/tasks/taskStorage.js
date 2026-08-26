//logic ti render tasks
let TASKS_KEY = "duto_tasks";

function loadTasks() {
  return loadData(TASKS_KEY, []);
}

function saveTasks(tasks) {
  saveData(TASKS_KEY, tasks);
}