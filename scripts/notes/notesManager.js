const NOTES_KEY = "duto_notes";
let activeNoteId = null;

function loadAllNotes() {
  let notes = loadData(NOTES_KEY, []);
  return Array.isArray(notes) ? notes : [];
}

/** Only current user's notes */
function loadNotes() {
  let me = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  let all = loadAllNotes();
  if (!me) return [];
  return all.filter(function (n) {
    return n.ownerId === me.id;
  });
}

function saveNotes(userNotes) {
  let me = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  if (!me) return;
  let all = loadAllNotes();
  let others = all.filter(function (n) {
    return n.ownerId !== me.id;
  });
  for (let i = 0; i < userNotes.length; i++) {
    userNotes[i].ownerId = me.id;
  }
  saveData(NOTES_KEY, others.concat(userNotes));
}

function makeNoteId() {
  return makeId();
}

function formatNoteDate(iso) {
  if (!iso) return "";
  let d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function getNoteById(id) {
  let notes = loadNotes();
  for (let i = 0; i < notes.length; i++) {
    if (notes[i].id === id) return notes[i];
  }
  return null;
}

function createNote() {
  let me = getCurrentUser();
  if (!me) return null;
  let notes = loadNotes();
  let note = {
    id: makeNoteId(),
    ownerId: me.id,
    title: "Untitled note",
    body: "",
    updatedAt: new Date().toISOString()
  };
  notes.unshift(note);
  saveNotes(notes);
  activeNoteId = note.id;
  renderNotesList();
  openNote(note.id);
  return note;
}

function saveActiveNote() {
  if (!activeNoteId) return;
  let titleInput = document.getElementById("study-note-editor-title");
  let bodyInput = document.getElementById("study-note-editor");
  if (!titleInput || !bodyInput) return;
  let notes = loadNotes();
  for (let i = 0; i < notes.length; i++) {
    if (notes[i].id === activeNoteId) {
      notes[i].title = titleInput.value.trim() || "Untitled note";
      notes[i].body = bodyInput.value;
      notes[i].updatedAt = new Date().toISOString();
      break;
    }
  }
  saveNotes(notes);
  renderNotesList();
}

function deleteNote(id) {
  let notes = loadNotes().filter(function (n) {
    return n.id !== id;
  });
  saveNotes(notes);
  if (activeNoteId === id) {
    activeNoteId = null;
    let titleInput = document.getElementById("study-note-editor-title");
    let bodyInput = document.getElementById("study-note-editor");
    if (titleInput) titleInput.value = "";
    if (bodyInput) bodyInput.value = "";
  }
  renderNotesList();
  if (notes.length > 0) openNote(notes[0].id);
}

function openNote(id) {
  let note = getNoteById(id);
  if (!note) return;
  activeNoteId = id;
  let titleInput = document.getElementById("study-note-editor-title");
  let bodyInput = document.getElementById("study-note-editor");
  if (titleInput) titleInput.value = note.title;
  if (bodyInput) bodyInput.value = note.body;
  let items = document.querySelectorAll(".note-list-item");
  for (let i = 0; i < items.length; i++) {
    if (items[i].getAttribute("data-note-id") === id) {
      items[i].classList.add("active");
    } else {
      items[i].classList.remove("active");
    }
  }
}

function renderNotesList() {
  let list = document.getElementById("notes-list");
  if (!list) return;
  let notes = loadNotes();
  list.innerHTML = "";
  if (notes.length === 0) {
    list.innerHTML = '<p class="text-muted">No notes yet.</p>';
    return;
  }
  for (let i = 0; i < notes.length; i++) {
    let n = notes[i];
    let item = document.createElement("div");
    item.className = "note-list-item" + (n.id === activeNoteId ? " active" : "");
    item.setAttribute("data-note-id", n.id);
    item.innerHTML =
      "<strong>" +
      (n.title || "Untitled") +
      '</strong><div class="text-sm text-muted">' +
      formatNoteDate(n.updatedAt) +
      "</div>";
    item.addEventListener("click", function (e) {
      openNote(e.currentTarget.getAttribute("data-note-id"));
    });
    list.appendChild(item);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  if (typeof requireLogin === "function") requireLogin();
  renderNotesList();
  let addBtn = document.getElementById("add-note-button") || document.getElementById("new-note-button");
  if (addBtn) addBtn.addEventListener("click", createNote);
  let saveBtn = document.getElementById("save-note-button");
  if (saveBtn) saveBtn.addEventListener("click", saveActiveNote);
  let delBtn = document.getElementById("delete-note-button");
  if (delBtn) {
    delBtn.addEventListener("click", function () {
      if (!activeNoteId) return;
      showConfirmModal({
        title: "Delete note",
        message: "This note will be permanently removed.",
        confirmLabel: "Delete",
        onConfirm: function () {
          deleteNote(activeNoteId);
          if (typeof showSuccess === "function") showSuccess("Note deleted.");
        }
      });
    });
  }
});
