const content = document.getElementById("content")
const statusBar = document.getElementById("status")
const AUTOSAVE = 10000

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
  load()
  update()
  setInterval(save, AUTOSAVE)
}

function update(observer = true) {
  createJson()
  createTxt()
  observer && render()
}

function set(pages) {
  _pages = pages
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
  deleteButton.innerText = "x"
  deleteButton.onclick = (e) => {
    _pages.splice(pageIndex, 1)
    update()
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
  deleteButton.innerText = "x"
  deleteButton.onclick = (e) => {
    _pages[pageIndex].sections.splice(sectionIndex, 1)
    update()
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
  deleteButton.innerText = "x"
  deleteButton.onclick = (e) => {
    _pages[pageIndex].sections[sectionIndex].items.splice(index, 1)
    update()
  }

  item.appendChild(deleteButton)
  return item
}

function createInput(obj, prop, type, placeholder) {
  const input = document.createElement("input")
  input.type = type
  input.value = obj[prop]
  input.classList.add(prop)
  input.placeholder = placeholder
  input.oninput = (e) => {
    obj[prop] = e.target.value
    update(false)
  }

  return input
}

function addPage(title) {
  _pages.push({ title, sections: [] })
  update()
  render()
}

function addSection(pageIndex, title) {
  _pages[pageIndex].sections.push({ title, beforeAsServing: false, items: [] })
  update()
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
  update()
}

function setGlobalPrice() {
  const id = document.getElementById("global-price-id").value
  const price = document.getElementById("global-price").value

  _pages.forEach((page) =>
    page.sections.forEach((section) =>
      section.items.forEach((item) => {
        if (
          item.before &&
          item.before.toString().trim().toLowerCase() ==
            id.toString().trim().toLowerCase()
        ) {
          item.price = parseFloat(price)
        }
      })
    )
  )

  update()
}

;(function () {
  function onChange(event) {
    const reader = new FileReader()
    reader.onload = onReaderLoad
    reader.readAsText(event.target.files[0])
  }

  function onReaderLoad(event) {
    _pages = JSON.parse(event.target.result)
    update()
  }

  document.getElementById("import").addEventListener("change", onChange)
})()

function createJson() {
  save()
  blob = new Blob([JSON.stringify(_pages)], {
    type: "application/json;charset=utf-8;",
  })
  url = window.URL.createObjectURL(blob)
  document.getElementById("export-json").href = url
}

function createTxt() {
  save()
  let data = ""
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
  document.getElementById("export-txt").href = url
}

function createPDF() {
  save()
  fetch("menu.php", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      pages: _pages,
      requestId: "create",
    }),
  })
    .then((res) => {
      if (res.status == 200) {
        window.open(
          `${window.location.protocol}//${window.location.host}/menu.pdf`,
          "_blank"
        )
      }
    })
    .catch((error) => console.log(error))
}

function save() {
  fetch("state.php", {
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
    .then((res) => {
      if (res == "success") {
        statusBar.classList.remove("error")
        statusBar.classList.add("success")

        statusBar.innerText = "Proběhlo automatické uložení."
      } else {
        statusBar.classList.remove("success")
        statusBar.classList.add("error")
        statusBar.innerText = "Nepovedlo se provést automatické uložení."
      }
      setTimeout(() => {
        statusBar.innerText = ""
      }, 3000)
    })
    .catch((error) => console.log(error))
}

function load() {
  fetch("state.php", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      requestId: "download",
    }),
  })
    .then((res) => res.json())
    .then((res) => set(res))
    .catch((error) => console.log(error))
}
