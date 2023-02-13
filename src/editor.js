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
  render()
  update()
}

function update() {
  document.getElementById("save").innerHTML = ""
  createJson()
  document.getElementById("save").append(document.createElement("br"))
  createTxt()
}

function set(pages) {
  _pages = pages
  render()
  update()
}

function render() {
  content.innerHTML = ""
  _pages.forEach((page, i) => content.appendChild(renderPage(page, i)))
}

function renderPage(data, pageIndex) {
  const page = document.createElement("div")
  page.classList.add("page")
  const addSectionButton = document.createElement("button")
  addSectionButton.innerText = "Přidat sekci"
  addSectionButton.onclick = (e) => {
    addSection(pageIndex, "")
  }

  page.appendChild(
    createInput(_pages[pageIndex], "title", "text", "Název stránky")
  )
  page.appendChild(addSectionButton)

  data.sections.forEach((sectionData, i) =>
    renderSection(pageIndex, sectionData, i, page)
  )

  const deleteButton = document.createElement("button")
  deleteButton.innerText = "X"
  deleteButton.onclick = (e) => {
    _pages.splice(pageIndex, 1)
    update()
    render()
  }

  page.prepend(deleteButton)
  return page
}

function renderSection(pageIndex, data, sectionIndex, page) {
  const section = document.createElement("div")

  section.classList.add("section")

  section.appendChild(
    createInput(
      _pages[pageIndex].sections[sectionIndex],
      "title",
      "text",
      "Název sekce"
    )
  )
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
  beforeIsServing.checked = data.beforeAsServing
  beforeIsServing.onchange = (e) => {
    _pages[pageIndex].sections[sectionIndex].beforeAsServing = e.target.checked
    update()
  }
  section.appendChild(beforeIsServingContainer)

  const deleteButton = document.createElement("button")
  deleteButton.innerText = "X"
  deleteButton.onclick = (e) => {
    _pages[pageIndex].sections.splice(sectionIndex, 1)
    update()
    render()
  }

  section.appendChild(deleteButton)

  data.items.forEach((itemData, i) =>
    page.appendChild(renderItem(pageIndex, sectionIndex, i, itemData))
  )
}

function renderItem(pageIndex, sectionIndex, index, data) {
  const item = document.createElement("div")
  item.classList.add("item")

  Object.keys(data).forEach((key) =>
    item.appendChild(
      createInput(
        _pages[pageIndex].sections[sectionIndex].items[index],
        FIELDS[key].name,
        FIELDS[key].type,
        FIELDS[key].placeholder || ""
      )
    )
  )

  const deleteButton = document.createElement("button")
  deleteButton.innerText = "X"
  deleteButton.onclick = (e) => {
    _pages[pageIndex].sections[sectionIndex].items.splice(index, 1)
    update()
    render()
  }

  item.appendChild(deleteButton)
  return item
}

function createInput(obj, prop, type = "text", placeholder = "") {
  const input = document.createElement("input")
  input.type = type
  input.value = obj[prop]
  input.classList.add(prop)
  input.placeholder = placeholder
  input.oninput = (e) => {
    obj[prop] = e.target.value
    update()
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
    update()
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

  document.getElementById("save").appendChild(link)
}

function createTxt() {
  const link = document.createElement("a")
  let data = ""
  link.innerText = "TXT"

  _pages.forEach((page, i) => {
    data += (i > 0 ? "\n\n\n" : "") + page.title + "\n\n"
    page.sections.forEach((section, j) => {
      data += (j > 0 ? "\n\n" : "") + section.title + "\n\n"
      section.items.forEach((item) => {
        data += `${item.before} ${item.title} ${item.alergens}\n`
      })
    })
  })
  data +=
    "\n\n\nAlergeny: 1.Lepek, 2.Korýši, 3.Vejce, 4.Ryby, 5.Arašídy, 6.Sója, 7.Mléko, 8.Skořábkové plody,\n"
  data +=
    "9.Celer, 10. hořčice, 11.Sezam, 12.Oxid siřičitý a siřičitany, 13.Vlčí bob,14.Měkkýši"

  const file = new Blob([data], { type: "text/plain" })

  url = window.URL.createObjectURL(file)

  link.setAttribute("href", url)
  link.setAttribute("download", "menu")
  link.innerText = "Txt"

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
