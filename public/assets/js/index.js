let noteTitle;
let noteText;
let saveNoteBtn;
let newNoteBtn;
let noteList;

var m1 = moment().format('MM/DD/YYYY  h:mmA');

if (window.location.pathname === '/notes') {
  noteTitle = document.querySelector('.note-title');
  noteText = document.querySelector('.note-textarea');
  saveNoteBtn = document.querySelector('.save-note');
  newNoteBtn = document.querySelector('.new-note');
  noteList = document.querySelectorAll('.list-group');
}

// Return Specific # Of Words From Notes To Preview In Recent Side Bar
function getWords(str) {
  return str.split(' ').slice(0, 10).join(' ') + '...';
}

// Show an element
const show = (elem) => {
  elem.style.display = 'inline';
};

// Hide an element
const hide = (elem) => {
  elem.style.display = 'none';
};

// activeNote is used to keep track of the note in the textarea
let activeNote = {};

/////////////////////////////////////
const getNotes = () =>
  fetch('/api/notes', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

const saveNote = (note) =>
  fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  });

const deleteNote = (id) =>
  fetch(`/api/notes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

/////////////////////////////////////
const renderActiveNote = () => {
  hide(saveNoteBtn);

  if (activeNote.id) {
    noteTitle.setAttribute('readonly', true);
    noteText.setAttribute('readonly', true);
    noteTitle.value = activeNote.title;
    noteText.value = activeNote.text;
  } else {
    noteTitle.removeAttribute('readonly');
    noteText.removeAttribute('readonly');
    noteTitle.value = '';
    noteText.value = '';
  }
};

const handleNoteSave = () => {
  const newNote = {
    title: noteTitle.value,
    text: noteText.value,
    textSnip: getWords(noteText.value),
    date: m1,
  };
  saveNote(newNote).then(() => {
    getAndRenderNotes();
    renderActiveNote();
  });
};

/////////////////////////////////////
// Delete the clicked note
const handleNoteDelete = (e) => {
  e.stopPropagation();
  const note = e.target;
  const noteId = JSON.parse(note.offsetParent.getAttribute('data-note')).id;

  if (activeNote.id === noteId) {
    activeNote = {};
  }

  deleteNote(noteId).then(() => {
    getAndRenderNotes();
    renderActiveNote();
  });
};

/////////////////////////////////////
// Sets the activeNote and displays it
const handleNoteView = (e) => {
  e.preventDefault();
  const note = e.target;
  const noteJSON = JSON.parse(note.offsetParent.getAttribute('data-note'));

  activeNote = noteJSON;
  renderActiveNote();
};

/////////////////////////////////////
// Sets the activeNote to and empty object and allows the user to enter a new note
const handleNewNoteView = (e) => {
  activeNote = {};
  renderActiveNote();
};

/////////////////////////////////////
const handleRenderSaveBtn = () => {
  if (!noteTitle.value.trim() || !noteText.value.trim()) {
    hide(saveNoteBtn);
  } else {
    show(saveNoteBtn);
  }
};

// Render the list of note titles
const renderNoteList = async (notes) => {
  let jsonNotes = await notes.json();
  if (window.location.pathname === '/notes') {
    noteList.forEach((el) => (el.innerHTML = ''));
  }

  let noteListItems = [];

  // Returns HTML element with or without a delete button
  const createLi = (text, date, textSnip, delBtn = true) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item');
    liEl.classList.add('my-1');
    liEl.classList.add('py-3');
    liEl.classList.add('lh-tight');
    liEl.classList.add('mt-0');
    liEl.classList.add('recent-notes');

    // RECENT NOTE TITLE ------------------------------------------------------
    const titleEl = document.createElement('div');
    titleEl.classList.add('d-flex');
    titleEl.classList.add('flex-column');
    titleEl.classList.add('flex-md-row');
    titleEl.classList.add('align-items-center');
    titleEl.classList.add('justify-content-between');
    liEl.append(titleEl);

    const spanEl = document.createElement('span');
    spanEl.classList.add('list-item-title');
    spanEl.classList.add('recent-title');
    spanEl.innerText = text;

    titleEl.append(spanEl);

    if (jsonNotes.length > 0) {
      const delBtnEl = document.createElement('i');
      delBtnEl.innerHTML = `<ion-icon name="trash-outline" class="icon-delete"></ion-icon>`;
      titleEl.append(delBtnEl);
    }

    // RECENT DATE ------------------------------------------------------
    const dateEl = document.createElement('div');
    dateEl.classList.add('recent-date');
    dateEl.innerText = date;
    liEl.append(dateEl);

    // TEXT SNIPPET ------------------------------------------------------
    const textSnipEl = document.createElement('div');
    textSnipEl.innerText = textSnip;
    liEl.append(textSnipEl);

    // RECENT NOTE TITLE ------------------------------------------------------
    // click event to recognize which note was clicked to delete
    $('#recent-notes').click(function (e) {
      const localNameEl = e.target.localName;

      if (localNameEl !== 'ion-icon') {
        handleNoteView(e);
      } else if (localNameEl === 'ion-icon') {
        handleNoteDelete(e);
      }
    });

    return liEl;
  };

  if (jsonNotes.length === 0) {
    noteListItems.push(createLi('No saved Notes', '', '', false));
  }

  jsonNotes.forEach((note) => {
    const li = createLi(note.title, note.date, note.textSnip);

    li.dataset.note = JSON.stringify(note);

    noteListItems.push(li);
  });

  if (window.location.pathname === '/notes') {
    noteListItems.forEach((note) => noteList[0].append(note));
  }
};

// Gets notes from the db and renders them to the sidebar
const getAndRenderNotes = () => getNotes().then(renderNoteList);

if (window.location.pathname === '/notes') {
  saveNoteBtn.addEventListener('click', handleNoteSave);
  newNoteBtn.addEventListener('click', handleNewNoteView);
  noteTitle.addEventListener('keyup', handleRenderSaveBtn);
  noteText.addEventListener('keyup', handleRenderSaveBtn);
}

getAndRenderNotes();
