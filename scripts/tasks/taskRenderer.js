function priorityClass(priority) {
  if (priority === "high") return "priority-high";
  if (priority === "medium") return "priority-medium";
  return "priority-low";
}

function priorityLabel(priority) {
  if (priority === "high") return "High";
  if (priority === "medium") return "Medium";
  return "Low";
}

function escapeText(t) {
  let d = document.createElement("div");
  d.textContent = t || "";
  return d.innerHTML;
}

function getTaskSearchQuery() {
  let input = document.getElementById("task-search-input");
  return input ? input.value.trim().toLowerCase() : "";
}

function renderTasks(filter) {
  let container = document.getElementById("task-list-container");
  if (!container) return;

  filter = filter || window.__taskFilter || "all";
  window.__taskFilter = filter;

  let tasks = loadTasks();
  let query = getTaskSearchQuery();
  let filtered = [];

  for (let i = 0; i < tasks.length; i++) {
    if (filter === "active" && tasks[i].completed) continue;
    if (filter === "completed" && !tasks[i].completed) continue;
    if (query) {
      let hay =
        (tasks[i].title || "") +
        " " +
        (tasks[i].description || "") +
        " " +
        (tasks[i].priority || "");
      if (hay.toLowerCase().indexOf(query) === -1) continue;
    }
    filtered.push(tasks[i]);
  }

  container.innerHTML = "";
  if (filtered.length === 0) {
    container.innerHTML = query
      ? '<p class="text-muted">No tasks match your search.</p>'
      : '<p class="text-muted">No tasks yet. Add one above.</p>';
    return;
  }

  for (i = 0; i < filtered.length; i++) {
    let task = filtered[i];
    let card = document.createElement("div");
    card.className = "task-card" + (task.completed ? " completed" : "");
    card.setAttribute("data-task-id", task.id);
    let dueText = task.dueDate ? "Due: " + task.dueDate : "No due date";
    card.innerHTML =
      '<input type="checkbox" class="task-checkbox" data-id="' +
      task.id +
      '"' +
      (task.completed ? " checked" : "") +
      ">" +
      '<div class="task-content">' +
      '<div class="task-title">' +
      escapeText(task.title) +
      "</div>" +
      '<div class="task-meta">' +
      '<span class="badge ' +
      priorityClass(task.priority) +
      '">' +
      priorityLabel(task.priority) +
      "</span> " +
      "<span>" +
      escapeText(dueText) +
      "</span></div></div>" +
      '<div class="task-actions">' +
      '<button type="button" class="btn btn-ghost btn-sm" data-edit="' +
      task.id +
      '">Edit</button>' +
      '<button type="button" class="btn btn-ghost btn-sm text-danger" data-delete="' +
      task.id +
      '">Delete</button></div>';
    container.appendChild(card);
  }

  let checkboxes = container.querySelectorAll(".task-checkbox");
  for (i = 0; i < checkboxes.length; i++) {
    checkboxes[i].addEventListener("change", function (event) {
      toggleTaskComplete(event.target.getAttribute("data-id"));
      renderTasks(window.__taskFilter || "all");
    });
  }

  let deleteButtons = container.querySelectorAll("[data-delete]");
  for (i = 0; i < deleteButtons.length; i++) {
    deleteButtons[i].addEventListener("click", function (event) {
      let id = event.target.getAttribute("data-delete");
      showConfirmModal({
        title: "Delete task",
        message: "This task will be removed from your list.",
        confirmLabel: "Delete",
        onConfirm: function () {
          deleteTask(id);
          renderTasks(window.__taskFilter || "all");
          if (typeof showSuccess === "function") showSuccess("Task deleted.");
        }
      });
    });
  }

  let editButtons = container.querySelectorAll("[data-edit]");
  for (i = 0; i < editButtons.length; i++) {
    editButtons[i].addEventListener("click", function (event) {
      let id = event.target.getAttribute("data-edit");
      let task = getTaskById(id);
      if (!task) return;
      showFormModal({
        title: "Edit task",
        submitLabel: "Save changes",
        fields: [
          { id: "title", label: "Title", type: "text", value: task.title },
          {
            id: "priority",
            label: "Priority",
            type: "select",
            value: task.priority || "medium",
            options: [
              { value: "high", label: "High" },
              { value: "medium", label: "Medium" },
              { value: "low", label: "Low" }
            ]
          },
          { id: "dueDate", label: "Due date", type: "date", value: task.dueDate || "" }
        ],
        onSubmit: function (data) {
          if (!data.title || !data.title.trim()) {
            if (typeof showError === "function") showError("Title is required.");
            return false;
          }
          updateTask(id, {
            title: data.title.trim(),
            priority: data.priority || "medium",
            dueDate: (data.dueDate || "").trim()
          });
          renderTasks(window.__taskFilter || "all");
          if (typeof showSuccess === "function") showSuccess("Task updated.");
        }
      });
    });
  }
}

function setupAddTaskButton() {
  let button = document.getElementById("add-task-button");
  if (!button) return;

  button.addEventListener("click", function () {
    showFormModal({
      title: "Add task",
      submitLabel: "Add task",
      fields: [
        { id: "title", label: "Title", type: "text", value: "" },
        {
          id: "priority",
          label: "Priority",
          type: "select",
          value: "medium",
          options: [
            { value: "high", label: "High" },
            { value: "medium", label: "Medium" },
            { value: "low", label: "Low" }
          ]
        },
        { id: "dueDate", label: "Due date", type: "date", value: "" }
      ],
      onSubmit: function (data) {
        if (!data.title || !data.title.trim()) {
          if (typeof showError === "function") showError("Title is required.");
          return false;
        }
        addTask(data.title.trim(), data.priority || "medium", (data.dueDate || "").trim());
        renderTasks(window.__taskFilter || "all");
        if (typeof showSuccess === "function") showSuccess("Task added.");
      }
    });
  });
}

function setupFilters() {
  let tabs = document.querySelectorAll("[data-filter]");
  window.__taskFilter = "all";
  for (let i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener("click", function (e) {
      let f = e.currentTarget.getAttribute("data-filter");
      window.__taskFilter = f;
      for (let j = 0; j < tabs.length; j++) tabs[j].classList.remove("active");
      e.currentTarget.classList.add("active");
      renderTasks(f);
    });
  }
}

function setupTaskSearch() {
  let input = document.getElementById("task-search-input");
  if (!input) return;
  input.addEventListener("input", function () {
    renderTasks(window.__taskFilter || "all");
  });
}

document.addEventListener("DOMContentLoaded", function () {
  if (typeof requireLogin === "function") requireLogin();
  renderTasks("all");
  setupAddTaskButton();
  setupFilters();
  setupTaskSearch();
});
