let NOTES_KEY = "duto_notes";
let activeNoteId = null;

function loadNotes() {
  let notes = loadData(NOTES_KEY, []);
  if (!Array.isArray(notes)) return [];
  return notes;
}

function saveNotes(notes) {
  saveData(NOTES_KEY, notes);
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
  let i;
  for (i = 0; i < notes.length; i++) {
    if (notes[i].id === id) return notes[i];
  }
  return null;
}

function createNote() {
  let notes = loadNotes();
  let note = {
    id: makeNoteId(),
    title: "Untitled note",
    body: "",
    updatedAt: new Date().toISOString()
  };
  notes.unshift(note); // newest first
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
  let i;
  for (i = 0; i < notes.length; i++) {
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
  let notes = loadNotes();
  let newList = [];
  let i;
  for (i = 0; i < notes.length; i++) {
    if (notes[i].id !== id) {
      newList.push(notes[i]);
    }
  }
  saveNotes(newList);

  if (activeNoteId === id) {
    activeNoteId = null;
    let titleInput = document.getElementById("study-note-editor-title");
    let bodyInput = document.getElementById("study-note-editor");
    if (titleInput) titleInput.value = "";
    if (bodyInput) bodyInput.value = "";
  }

  renderNotesList();

  if (newList.length > 0) {
    openNote(newList[0].id);
  }
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
  let i;
  for (i = 0; i < items.length; i++) {
    if (items[i].getAttribute("data-note-id") === id) {
      items[i].classList.add("active");
    } else {
      items[i].classList.remove("active");
    }
  }
}

function renderNotesList(filterText) {
  let listEl = document.getElementById("notes-list");
  if (!listEl) return;

  let notes = loadNotes();
  let q = (filterText || "").toLowerCase().trim();

  listEl.innerHTML = "";

  let shown = 0;
  let i;
  for (i = 0; i < notes.length; i++) {
    let n = notes[i];
    if (q) {
      let hay = (n.title + " " + n.body).toLowerCase();
      if (hay.indexOf(q) === -1) continue;
    }

    let item = document.createElement("div");
    item.className = "note-list-item";
    if (n.id === activeNoteId) {
      item.className = "note-list-item active";
    }
    item.setAttribute("data-note-id", n.id);

    item.innerHTML =
      "<div class=\"note-list-item-title\">" + escapeHtml(n.title) + "</div>" +
      "<div class=\"note-list-item-date\">" + formatNoteDate(n.updatedAt) + "</div>";

    item.addEventListener("click", function (event) {
      let id = event.currentTarget.getAttribute("data-note-id");
      // Save current before switching
      saveActiveNote();
      openNote(id);
    });

    listEl.appendChild(item);
    shown++;
  }

  if (shown === 0) {
    listEl.innerHTML = "<p class=\"text-sm text-muted p-4\">No notes yet.</p>";
  }
}

function escapeHtml(text) {
  let div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function setupNotesPage() {
  if (!document.getElementById("notes-list")) return;

  // New note
  let newBtn = document.getElementById("new-note-button");
  if (newBtn) {
    newBtn.addEventListener("click", function () {
      saveActiveNote();
      createNote();
    });
  }

  // Save note
  let saveBtn = document.getElementById("save-note-button");
  if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      saveActiveNote();
      alert("Note saved.");
    });
  }

  // Search
  let search = document.getElementById("notes-search-input");
  if (search) {
    search.addEventListener("input", function () {
      renderNotesList(search.value);
    });
  }

  // Auto-save when typing
  let titleInput = document.getElementById("study-note-editor-title");
  let bodyInput = document.getElementById("study-note-editor");

  if (titleInput) {
    titleInput.addEventListener("blur", saveActiveNote);
  }
  if (bodyInput) {
    bodyInput.addEventListener("blur", saveActiveNote);
  }

  // Initial render
  let notes = loadNotes();
  renderNotesList();

  if (notes.length > 0) {
    openNote(notes[0].id);
  } else {
    // Empty editor
    if (titleInput) titleInput.value = "";
    if (bodyInput) bodyInput.value = "";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  setupNotesPage();
});