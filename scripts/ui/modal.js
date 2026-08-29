/**
 * Professional modals (forms + confirm). Success/error stay as toasts.
 */

function ensureModalRoot() {
  let root = document.getElementById("app-modal-root");
  if (root) return root;
  root = document.createElement("div");
  root.id = "app-modal-root";
  document.body.appendChild(root);
  return root;
}

function closeAppModal() {
  let root = document.getElementById("app-modal-root");
  if (root) root.innerHTML = "";
}

/**
 * showConfirmModal({ title, message, confirmLabel, cancelLabel, onConfirm })
 */
function showConfirmModal(options) {
  options = options || {};
  let root = ensureModalRoot();
  root.innerHTML =
    '<div class="modal-backdrop" id="modal-backdrop">' +
    '<div class="modal-panel" role="dialog" aria-modal="true">' +
    "<h3 class=\"modal-title\">" +
    escapeModal(options.title || "Confirm") +
    "</h3>" +
    "<p class=\"modal-message\">" +
    escapeModal(options.message || "Are you sure?") +
    "</p>" +
    '<div class="modal-actions">' +
    '<button type="button" class="btn btn-ghost btn-sm" id="modal-cancel">' +
    escapeModal(options.cancelLabel || "Cancel") +
    "</button>" +
    '<button type="button" class="btn btn-primary btn-sm" id="modal-confirm">' +
    escapeModal(options.confirmLabel || "Confirm") +
    "</button></div></div></div>";

  document.getElementById("modal-cancel").onclick = closeAppModal;
  document.getElementById("modal-backdrop").onclick = function (e) {
    if (e.target.id === "modal-backdrop") closeAppModal();
  };
  document.getElementById("modal-confirm").onclick = function () {
    closeAppModal();
    if (typeof options.onConfirm === "function") options.onConfirm();
  };
}

/**
 * showFormModal({ title, fields: [{id,label,type,value,options}], submitLabel, onSubmit })
 * fields type: text | textarea | select | date | password
 */
function showFormModal(options) {
  options = options || {};
  let fields = options.fields || [];
  let fieldsHtml = "";
  for (let i = 0; i < fields.length; i++) {
    let f = fields[i];
    fieldsHtml += '<div class="form-group">';
    fieldsHtml += '<label for="modal-field-' + f.id + '">' + escapeModal(f.label) + "</label>";
    if (f.type === "textarea") {
      fieldsHtml +=
        '<textarea id="modal-field-' +
        f.id +
        '" class="form-control" rows="3">' +
        escapeModal(f.value || "") +
        "</textarea>";
    } else if (f.type === "select") {
      fieldsHtml += '<select id="modal-field-' + f.id + '" class="form-control">';
      let opts = f.options || [];
      for (let o = 0; o < opts.length; o++) {
        let selected = opts[o].value === f.value ? " selected" : "";
        fieldsHtml +=
          "<option value=\"" +
          escapeModal(opts[o].value) +
          "\"" +
          selected +
          ">" +
          escapeModal(opts[o].label) +
          "</option>";
      }
      fieldsHtml += "</select>";
    } else {
      fieldsHtml +=
        '<input type="' +
        escapeModal(f.type || "text") +
        '" id="modal-field-' +
        f.id +
        '" class="form-control" value="' +
        escapeModal(f.value || "") +
        '">';
    }
    fieldsHtml += "</div>";
  }

  let root = ensureModalRoot();
  root.innerHTML =
    '<div class="modal-backdrop" id="modal-backdrop">' +
    '<div class="modal-panel" role="dialog" aria-modal="true">' +
    "<h3 class=\"modal-title\">" +
    escapeModal(options.title || "Form") +
    "</h3>" +
    '<form id="modal-form">' +
    fieldsHtml +
    '<div class="modal-actions">' +
    '<button type="button" class="btn btn-ghost btn-sm" id="modal-cancel">Cancel</button>' +
    '<button type="submit" class="btn btn-primary btn-sm">' +
    escapeModal(options.submitLabel || "Save") +
    "</button></div></form></div></div>";

  document.getElementById("modal-cancel").onclick = closeAppModal;
  document.getElementById("modal-backdrop").onclick = function (e) {
    if (e.target.id === "modal-backdrop") closeAppModal();
  };
  document.getElementById("modal-form").onsubmit = function (e) {
    e.preventDefault();
    let data = {};
    for (let j = 0; j < fields.length; j++) {
      let el = document.getElementById("modal-field-" + fields[j].id);
      data[fields[j].id] = el ? el.value : "";
    }
    if (typeof options.onSubmit === "function") {
      let ok = options.onSubmit(data);
      if (ok === false) return;
    }
    closeAppModal();
  };
}

function escapeModal(text) {
  if (text === null || text === undefined) return "";
  let d = document.createElement("div");
  d.textContent = String(text);
  return d.innerHTML;
}
