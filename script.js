const addBtn = document.getElementById('new-note-btn')
const board = document.getElementById('board')
const clearBtn = document.getElementById('clear-all')
const topBar = document.querySelector('.top-bar')

let myNotes = JSON.parse(localStorage.getItem('sticky_data_v3')) || []
let searchVal = ''

function createSearch () {
  const search = document.createElement('input')
  search.type = 'text'
  search.placeholder = 'Search notes...'
  search.className = 'search-input'

  search.oninput = e => {
    searchVal = e.target.value.toLowerCase()
    refresh()
  }

  topBar.insertBefore(search, topBar.lastElementChild)
}

function save () {
  localStorage.setItem('sticky_data_v3', JSON.stringify(myNotes))
}

function createNote (id, content, color, date) {
  const card = document.createElement('div')
  card.className = `note-card ${color}`

  card.innerHTML = `
        <textarea class="text-area" placeholder="Write here...">${content}</textarea>
        <div class="note-info">
            Characters: <span class="char-count">${content.length}</span>
        </div>
        <div class="note-footer">
            <div class="color-dots">
                <div class="dot yellow" onclick="changeColor(${id}, 'yellow')"></div>
                <div class="dot pink" onclick="changeColor(${id}, 'pink')"></div>
                <div class="dot blue" onclick="changeColor(${id}, 'blue')"></div>
            </div>
            <div class="note-actions">
                <button title="Download" class="btn-download" onclick="downloadNote(${id})">💾</button>
                <button class="btn-del" onclick="removeNote(${id})">🗑</button>
            </div>
        </div>
    `

  const area = card.querySelector('textarea')
  const countSpan = card.querySelector('.char-count')

  area.oninput = e => {
    const val = e.target.value
    countSpan.innerText = val.length
    updateText(id, val)
  }

  board.appendChild(card)
}

function downloadNote (id) {
  const n = myNotes.find(x => x.id === id)
  const blob = new Blob([n.text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `note_${id}.txt`
  link.click()
}

function updateText (id, val) {
  myNotes = myNotes.map(n => (n.id === id ? { ...n, text: val } : n))
  save()
}

function changeColor (id, col) {
  myNotes = myNotes.map(n => (n.id === id ? { ...n, color: col } : n))
  save()
  refresh()
}

function removeNote (id) {
  if (confirm('Permanently delete this?')) {
    myNotes = myNotes.filter(n => n.id !== id)
    save()
    refresh()
  }
}

function addBlank () {
  const n = {
    id: Date.now(),
    text: '',
    color: 'yellow',
    date: new Date().toLocaleDateString()
  }
  myNotes.push(n)
  save()
  refresh()
}

function refresh () {
  board.innerHTML = ''
  const filtered = myNotes.filter(n => n.text.toLowerCase().includes(searchVal))

  if (filtered.length === 0 && searchVal !== '') {
    board.innerHTML = `<p class="no-match-msg">No match found...</p>`
  } else {
    filtered.forEach(n => createNote(n.id, n.text, n.color, n.date))
  }
}

function importNotes (event) {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = function(e) {
    try {
      if (file.name.endsWith('.json')) {
        const imported = JSON.parse(e.target.result)
        if (Array.isArray(imported)) {
          const isValid = imported.every(n => n.id && typeof n.text === 'string' && n.color)
          if (isValid) {
            myNotes = [...imported, ...myNotes]
            save()
            refresh()
            alert('Success: All notes restored perfectly!')
          } else {
            alert('Invalid backup file format.')
          }
        } else {
          alert('Invalid file format. File must contain an array of notes.')
        }
      } else {
        const text = e.target.result
        const n = {
          id: Date.now(),
          text: text,
          color: 'yellow',
          date: new Date().toLocaleDateString()
        }
        myNotes.push(n)
        save()
        refresh()
        alert('Success: Note imported from text file!')
      }
    } catch (err) {
      alert('Failed to parse file content.')
    }
  }
  reader.readAsText(file)
}

function addBackupButtons () {
  const btnGroup = document.querySelector('.action-buttons')
  if (!btnGroup) return

  const impBtn = document.createElement('button')
  impBtn.innerText = 'Import'
  impBtn.className = 'btn-clear'
  impBtn.style.color = '#3b82f6'
  impBtn.style.cursor = 'pointer'

  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.accept = '.json,.txt'
  fileInput.style.display = 'none'
  fileInput.onchange = importNotes

  impBtn.onclick = () => fileInput.click()

  btnGroup.insertBefore(impBtn, btnGroup.firstChild)
}

clearBtn.onclick = () => {
  if (confirm('Delete every single note?')) {
    myNotes = []
    save()
    refresh()
  }
}

addBtn.onclick = addBlank

document.addEventListener('DOMContentLoaded', () => {
  createSearch()
  addBackupButtons()
  if (myNotes.length === 0) {
    addBlank()
  } else {
    refresh()
  }
})