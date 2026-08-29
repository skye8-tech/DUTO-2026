function ensureToastStack() {
  let stack = document.getElementById("toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.id = "toast-stack";
    stack.className = "toast-stack";
    stack.setAttribute("aria-live", "polite");
    document.body.appendChild(stack);
  }
  return stack;
}

function showToast(message, type) {
  type = type || "info";
  let stack = ensureToastStack();
  let el = document.createElement("div");
  el.className = "toast toast-" + type;
  el.textContent = message;
  stack.appendChild(el);
  setTimeout(function () {
    if (el.parentNode) el.parentNode.removeChild(el);
  }, 3500);
}

function showError(message) {
  showToast(message, "error");
}
function showSuccess(message) {
  showToast(message, "success");
}
