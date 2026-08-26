//logic ti render tasks
function priorityClass(priority) {
  if (priority === "high") {
    return "priority-high";
  }
  if (priority === "medium") {
    return "priority-medium";
  }
  return "priority-low";
}

function priorityLabel(priority) {
  if (priority === "high") {
    return "High";
  }
  if (priority === "medium") {
    return "Medium";
  }
  return "Low";
}

function renderTasks() {
  let container = document.getElementById("task-list-container");

  if (!container) {
    return;
  }

  let tasks = loadTasks();

  container.innerHTML = "";

  if (tasks.length === 0) {
    container.innerHTML = "<p class=\"text-muted\">No tasks yet. Add one above.</p>";
    return;
  }

  let i;
  for (i = 0; i < tasks.length; i++) {
    let task = tasks[i];

    let card = document.createElement("div");
    card.className = "task-card";
    if (task.completed === true) {
      card.className = "task-card completed";
    }
    card.setAttribute("data-task-id", task.id);

    let checked = "";
    if (task.completed === true) {
      checked = " checked";
    }

    let dueText = "No due date";
    if (task.dueDate) {
      dueText = "Due: " + task.dueDate;
    }

    card.innerHTML =
      "<input type=\"checkbox\" class=\"task-checkbox\" data-id=\"" + task.id + "\"" + checked + ">" +
      "<div class=\"task-content\">" +
        "<div class=\"task-title\">" + task.title + "</div>" +
        "<div class=\"task-meta\">" +
          "<span class=\"badge " + priorityClass(task.priority) + "\">" + priorityLabel(task.priority) + "</span> " +
          "<span>" + dueText + "</span>" +
        "</div>" +
      "</div>" +
      "<div class=\"task-actions\">" +
        "<button type=\"button\" class=\"btn btn-ghost btn-sm text-danger\" data-delete=\"" + task.id + "\">Delete</button>" +
      "</div>";

    container.appendChild(card);
  }

  // Checkboxes
  let checkboxes = container.querySelectorAll(".task-checkbox");
  for (i = 0; i < checkboxes.length; i++) {
    checkboxes[i].addEventListener("change", function (event) {
      let id = event.target.getAttribute("data-id");
      toggleTaskComplete(id);
      renderTasks();
    });
  }

  // Delete buttons
  let deleteButtons = container.querySelectorAll("[data-delete]");
  for (i = 0; i < deleteButtons.length; i++) {
    deleteButtons[i].addEventListener("click", function (event) {
      let id = event.target.getAttribute("data-delete");
      deleteTask(id);
      renderTasks();
    });
  }
}

function setupAddTaskButton() {
  let button = document.getElementById("add-task-button");

  if (!button) {
    return;
  }

  button.addEventListener("click", function () {
    let title = prompt("Task title:");
    if (!title || title.trim() === "") {
      return;
    }

    let priority = prompt("Priority: high, medium, or low?", "medium");
    if (priority !== "high" && priority !== "medium" && priority !== "low") {
      priority = "medium";
    }

    let dueDate = prompt("Due date (YYYY-MM-DD) or leave empty:", "");
    if (!dueDate) {
      dueDate = "";
    }

    addTask(title.trim(), priority, dueDate.trim());
    renderTasks();
  });
}

document.addEventListener("DOMContentLoaded", function () {
  renderTasks();
  setupAddTaskButton();
});