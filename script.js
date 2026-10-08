const newNoteBtn = document.getElementById("newNoteBtn");
const editorView = document.getElementById("editorView");
const mainView = document.getElementById("main");
const backNavigationBtn = document.querySelectorAll(".editor-view-nav-btn");
const savedNotesContainer = document.getElementById("savedNotesContainer");
const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const eachNoteContainer = document.querySelectorAll(".each-note-container");
let uniqueNoteId = "";
const deleteBtn = document.getElementById("deleteBtn");
const search = document.getElementById("searchInput");

// Phase 1: App initialization
function updateButtonText(theme) {
  themeToggleBtn.textContent = theme === "dark" ? "☀️" : "🌙";
}

const savedTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-bs-theme", savedTheme);
updateButtonText(savedTheme);

themeToggleBtn.addEventListener("click", function () {
  const currentTheme = document.documentElement.getAttribute("data-bs-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  document.documentElement.setAttribute("data-bs-theme", newTheme);
  localStorage.setItem("theme", newTheme);

  updateButtonText(newTheme);
});

const notes = JSON.parse(localStorage.getItem("notes")) || [];
if (!localStorage.getItem("hasSeededNote")) {
  notes.push({ id: Date.now(), title: "New note", content: "Tap to edit" });
  localStorage.setItem("notes", JSON.stringify(notes));
  localStorage.setItem("hasSeededNote", "true");
}
renderNotes();

// Phase 2: Opening the editor
newNoteBtn.addEventListener("click", function () {
  uniqueNoteId = "";
  editorView.classList.add("active");
  mainView.classList.add("not-active");

  noteTitle.value = "";
  noteContent.value = "";
  noteTitle.focus();
  autoResizeTextarea();
  renderNotes();
});


// Phase 4: Back / Save
function closeEditor() {
  editorView.classList.remove("active");
  mainView.classList.remove("not-active");
  uniqueNoteId = "";
}

for (let i = 0; i < backNavigationBtn.length; i++) {
  backNavigationBtn[i].addEventListener("click", function () {
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();

    if (title || content) {
      if (uniqueNoteId === "") {
        const note = { id: Date.now(), title, content };
        notes.push(note);
        cardCreator(title, content, note.id);
        renderNotes();
      } else {
        const card = document.getElementById(uniqueNoteId);
        card.querySelector("h3").textContent = title || "Untitled Note";
        card.querySelector("p").textContent =
          content.length > 30 ? content.slice(0, 30) + "..." : content || "...";

        const matched = notes.find(n => n.id === Number(uniqueNoteId));
        matched.title = title;
        matched.content = content;
      }
      localStorage.setItem("notes", JSON.stringify(notes));
      renderNotes();
    }
    closeEditor();
  });
}


function cardCreator(title, description, uniqueId) {
  const newNote = document.createElement("div");
  newNote.classList.add("each-note-container");
  newNote.id = uniqueId;
  newNote.addEventListener("click", openNote)
  
  const newTitle = document.createElement("h3");
  newTitle.classList.add("note-title")
  newTitle.textContent = title || "Untitled Note";
  
  const newDesc = document.createElement("p");
  newDesc.classList.add("note-description");
  const previewText = description.length > 30 ? description.slice(0, 30) + "..." : description; 
  newDesc.textContent = previewText || "...";
  
  newNote.appendChild(newTitle);
  newNote.appendChild(newDesc);
  savedNotesContainer.appendChild(newNote);
}

function openNote() {
  editorView.classList.add("active");
  mainView.classList.add("not-active");
  uniqueNoteId = this.id;
  const matchedNote = notes.find(note => note.id === Number(uniqueNoteId));
  const title = matchedNote.title;
  const content = matchedNote.content;
  noteTitle.value = title;
  noteContent.value = content;
  autoResizeTextarea();
}

deleteBtn.addEventListener("click", () => {
  if (uniqueNoteId === "") { closeEditor(); return; }
  const itemToDelete = document.getElementById(uniqueNoteId);
  itemToDelete.remove();
  editorView.classList.remove("active");
  mainView.classList.remove("not-active");
  const targetId = Number(uniqueNoteId);
  const index = notes.findIndex(note => note.id === targetId);
  if (index !== -1) {
  notes.splice(index, 1);
  }
  localStorage.setItem("notes", JSON.stringify(notes));
  renderNotes();
  closeEditor();
});

function autoResizeTextarea() {
  noteContent.style.height = "auto";
  noteContent.style.height = noteContent.scrollHeight + "px";
}

noteContent.addEventListener("input", autoResizeTextarea);


search.addEventListener("input", () => {
  const everyNote = document.querySelectorAll(".each-note-container");
  const query = search.value.trim().toLowerCase();

  for (let i = 0; i < everyNote.length; i++) {
    const titleText = everyNote[i].querySelector("h3").textContent.toLowerCase();
    const bodyText = everyNote[i].querySelector("p").textContent.toLowerCase();

  
    if (titleText.includes(query) || bodyText.includes(query)) {
      everyNote[i].style.display = "flex";
    } else {
      everyNote[i].style.display = "none";
    }
  }
});
search.addEventListener("focus", () => {
  newNoteBtn.style.display = "none";
});

search.addEventListener("blur", () => {
  newNoteBtn.style.display = "block";
});

function renderNotes() {
  savedNotesContainer.innerHTML = "";
  notes.sort((a, b) => b.id - a.id);
  if (notes.length === 0) {
  showEmptyState();
  }
  for (let i = 0; i < notes.length; i++) {
    cardCreator(notes[i].title, notes[i].content, notes[i].id);
  }
}

function showEmptyState() {
  savedNotesContainer.innerHTML = `
    <div class="empty-state">
      <p>No notes yet</p>
      <p class="empty-subtitle">Tap "New Note" to create your first one</p>
    </div>
  `;
}