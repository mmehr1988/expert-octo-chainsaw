let noteTitle;
let noteText;
let saveNoteBtn;
let newNoteBtn;
let noteList;
let recentList;

var m1 = moment().format('MM/DD/YYYY  h:mmA');

if (window.location.pathname === '/notes') {
  noteTitle = document.querySelector('.note-title');
  noteText = document.querySelector('.note-textarea');
  saveNoteBtn = document.querySelector('.save-note');
  newNoteBtn = document.querySelector('.new-note');
  noteList = document.querySelectorAll('.list-group');
  recentList = document.getElementById('recent-notes');
}

/////////////////////////////////////////////////////////////////
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

/////////////////////////////////////////////////////////////////
// ASYNC: GET
const getNotes = async () => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const response = await fetch('/api/notes', options);
  // console.log(response);
  return response;
};

// ASYNC: POST
const saveNote = async (note) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  };
  const response = await fetch('/api/notes', options);
  const data = await response.json();
  // console.log(data);
};

// ASYNC: DELETE
const deleteNote = async (id) => {
  const options = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const response = await fetch(`/api/notes/${id}`, options);
  const data = await response.json();
  // console.log(data);
};

/////////////////////////////////////////////////////////////////
const renderActiveNote = () => {
  hide(saveNoteBtn);

  if (!activeNote.id) {
    noteTitle.removeAttribute('readonly');
    noteText.removeAttribute('readonly');
    noteTitle.value = '';
    noteText.value = '';
  } else {
    noteTitle.setAttribute('readonly', true);
    noteText.setAttribute('readonly', true);
    noteTitle.value = activeNote.title;
    noteText.value = activeNote.text;
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
/////////////////////////////////////////////////////////////////
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
/////////////////////////////////////////////////////////////////
// Sets the activeNote and displays it
const handleNoteView = (e) => {
  e.preventDefault();
  const note = e.target;
  const noteJSON = JSON.parse(note.offsetParent.getAttribute('data-note'));

  activeNote = noteJSON;
  renderActiveNote();
};
/////////////////////////////////////////////////////////////////
// Sets the activeNote to and empty object and allows the user to enter a new note
const handleNewNoteView = (e) => {
  activeNote = {};
  renderActiveNote();
};
/////////////////////////////////////////////////////////////////
const handleRenderSaveBtn = () => {
  if (!noteTitle.value.trim() || !noteText.value.trim()) {
    hide(saveNoteBtn);
  } else {
    show(saveNoteBtn);
  }
};
/////////////////////////////////////////////////////////////////
// RECENT NOTE TITLE -------------------------------------------------
// click event to recognize which note was clicked to delete
const recentNoteClick = (e) => {
  const localNameEl = e.target.localName;
  const noNotes = e.target.innerText;

  if (localNameEl !== 'ion-icon' && noNotes !== 'No saved Notes') {
    handleNoteView(e);
  } else if (localNameEl === 'ion-icon' && noNotes !== 'No saved Notes') {
    handleNoteDelete(e);
  }
};

/////////////////////////////////////////////////////////////////
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
    liEl.classList.add('list-group-item', 'my-2', 'py-3', 'lh-tight', 'mt-0', 'rounded', 'recent-notes');

    // RECENT NOTE TITLE -------------------------------------------------
    const titleEl = document.createElement('div');
    titleEl.classList.add('d-flex', 'flex-column', 'flex-md-row', 'align-items-center', 'justify-content-between');
    liEl.append(titleEl);

    const spanEl = document.createElement('span');
    spanEl.classList.add('list-item-title', 'recent-title');
    spanEl.innerText = text;

    titleEl.append(spanEl);

    if (jsonNotes.length > 0) {
      const delBtnEl = document.createElement('i');
      delBtnEl.innerHTML = `<ion-icon name="trash-outline" class="icon-delete"></ion-icon>`;
      titleEl.append(delBtnEl);
    }

    // RECENT DATE -------------------------------------------------------
    const dateEl = document.createElement('div');
    dateEl.classList.add('recent-date');
    dateEl.innerText = date;
    liEl.append(dateEl);

    // TEXT SNIPPET ------------------------------------------------------
    const textSnipEl = document.createElement('div');
    textSnipEl.innerText = textSnip;
    liEl.append(textSnipEl);

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
/////////////////////////////////////////////////////////////////
// Gets notes from the db and renders them to the sidebar
const getAndRenderNotes = () => getNotes().then(renderNoteList);

if (window.location.pathname === '/notes') {
  saveNoteBtn.addEventListener('click', handleNoteSave);
  newNoteBtn.addEventListener('click', handleNewNoteView);
  noteTitle.addEventListener('keyup', handleRenderSaveBtn);
  noteText.addEventListener('keyup', handleRenderSaveBtn);
  recentList.addEventListener('click', recentNoteClick);
}

getAndRenderNotes();

/////////////////////////////////////////////////////////////////
