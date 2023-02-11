const content = document.getElementById("content")

const backupSelect = document.getElementById("backup")
const autobackup = document.getElementById("autobackup")
let backuper = null
const BACKUP_DELAY = 300000

autobackup.onchange = () => {
  if (autobackup.checked) {
    backuper = setInterval(() => {
      createBackup()
    }, BACKUP_DELAY)
  } else {
    clearInterval(backuper)
  }
}

const FIELDS = {
  before: {
    name: "before",
    placeholder: "Před",
  },
  title: { name: "title", placeholder: "Název" },
  alergens: { name: "alergens", placeholder: "Alergeny" },
  price: { name: "price", placeholder: "Cena", type: "number" },
  unit: { name: "unit", placeholder: "" },
}

let _pages = []

init()

function init() {
  fetch("menu.json")
    .then((response) => response.json())
    .then((v) => set(v))

  loadBackups()
}

function set(pages) {
  _pages = pages
  render()
}

function render() {
  content.innerHTML = ""

  _pages.forEach((page, i) => content.appendChild(renderPage(page, i)))
  createJson()
}

function renderPage(data, pageIndex) {
  const page = document.createElement("div")
  page.classList.add("page")
  const addSectionButton = document.createElement("button")
  addSectionButton.innerText = "Přidat sekci"
  addSectionButton.onclick = (e) => {
    addSection(pageIndex, "")
  }

  page.appendChild(createInput(data, "title", "text", "Název stránky"))
  page.appendChild(addSectionButton)

  data.sections.forEach((sectionData, i) =>
    renderSection(pageIndex, sectionData, i, page)
  )

  return page
}

function renderSection(pageIndex, data, sectionIndex, page) {
  const section = document.createElement("div")

  section.classList.add("section")

  section.appendChild(createInput(data, "title", "text", "Název sekce"))
  page.appendChild(section)

  const addItemButton = document.createElement("button")
  addItemButton.innerText = "Přidat položku"
  addItemButton.onclick = (e) =>
    addItem(pageIndex, sectionIndex, "", "", "", "", "Kč")

  section.appendChild(addItemButton)
  const beforeIsServingContainer = document.createElement("div")
  const beforeIsServing = document.createElement("input")
  const beforeIsServingLabel = document.createElement("label")
  beforeIsServingContainer.append(beforeIsServing, beforeIsServingLabel)
  beforeIsServingLabel.innerText = "První sloupec je porce"
  beforeIsServing.type = "checkbox"
  beforeIsServing.onchange = (e) => {
    _pages[pageIndex].sections[sectionIndex].beforeAsServing = e.target.checked
  }
  section.appendChild(beforeIsServingContainer)

  data.items.forEach((itemData) => page.appendChild(renderItem(itemData, page)))
}

function renderItem(data) {
  const item = document.createElement("div")
  item.classList.add("item")

  Object.keys(data).forEach((key) =>
    item.appendChild(
      createInput(
        data,
        FIELDS[key].name,
        FIELDS[key].type,
        FIELDS[key].placeholder || ""
      )
    )
  )

  return item
}

function createInput(obj, prop, type = "text", placeholder = "") {
  const input = document.createElement("input")
  input.type = type
  input.value = obj[prop]
  input.classList.add(prop)
  input.placeholder = placeholder
  input.onchange = function (e) {
    obj[prop] = e.target.value
    render()
  }
  return input
}

function addPage(title) {
  _pages.push({ title, sections: [] })
  render()
}

function addSection(pageIndex, title) {
  _pages[pageIndex].sections.push({ title, beforeAsServing: false, items: [] })
  render()
}

function addItem(
  pageIndex,
  sectionIndex,
  before,
  title,
  alergens,
  price,
  unit
) {
  _pages[pageIndex].sections[sectionIndex].items.push({
    before,
    title,
    alergens,
    price,
    unit,
  })
  render()
}

;(function () {
  function onChange(event) {
    const reader = new FileReader()
    reader.onload = onReaderLoad
    reader.readAsText(event.target.files[0])
  }

  function onReaderLoad(event) {
    _pages = JSON.parse(event.target.result)
    render()
  }

  document.getElementById("import").addEventListener("change", onChange)
})()

function createJson(filename = "menu") {
  blob = new Blob([JSON.stringify(_pages)], {
    type: "application/json;charset=utf-8;",
  })
  url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.innerText = "Export"

  document.getElementById("save").innerHTML = ""
  document.getElementById("save").appendChild(link)
}

function createText() {
  blob = new Blob([JSON.stringify(_pages)], {
    type: "text/plain;charset=utf-8;",
  })
  url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.setAttribute("href", url)
  link.setAttribute("download", "menu")
  link.innerText = "Export"

  document.getElementById("save").innerHTML = ""
  document.getElementById("save").appendChild(link)
}

function createPDF() {
  fetch("src/menu.php", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      pages: _pages,
    }),
  })
    .then((res) => {
      if (res.status == 200) {
        window.open("../menu.pdf", "_blank")
      }
    })
    .catch((error) => console.log(error))
}

function createBackup() {
  fetch("src/backup.php", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      requestId: "upload",
      pages: _pages,
    }),
  })
    .then((res) => res.json())
    .then((res) => console.log(res))
    .catch((error) => console.log(error))

  loadBackups()
}

function restoreFromBackup() {
  const filename = backupSelect.options[backupSelect.selectedIndex].text
  if (!filename || backupSelect.selectedIndex == 0) {
    return
  }

  fetch("src/backup.php", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      requestId: "download",
      filename: filename,
    }),
  })
    .then((res) => res.json())
    .then((res) => set(res))
    .catch((error) => console.log(error))
}

function loadBackups() {
  fetch("src/backup.php", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      requestId: "list",
    }),
  })
    .then((res) => res.json())
    .then((res) => {
      backupSelect.innerHTML =
        "<option disabled selected value>Nezvoleno</option>"

      Object.values(res).forEach((o) => {
        const option = document.createElement("option")
        option.value = o
        option.text = o
        backupSelect.appendChild(option)
      })
    })
    .catch((error) => console.log(error))
}
