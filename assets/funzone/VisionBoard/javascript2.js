const board = document.getElementById("board");
const addNoteBtn = document.getElementById("addNoteBtn");
const addImageBtn = document.getElementById("addImageBtn");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const saveBtn = document.getElementById("saveBtn");
const clearBtn = document.getElementById("clearBtn");


const clearModal = document.getElementById("clearModal");
const clearYes = document.getElementById("clearYes");
const clearNo = document.getElementById("clearNo");

const colors = ["color1", "color2", "color3", "color4", "color5", "color6"];

const sampleImages = [
  "slike/slika1.png",
  "slike/slika2.png",
  "slike/slika3.png",
  "slike/slika4.png"
];

const sampleQuotes = [
  "Svaka dovoljno napredna tehnologija jednaka je magiji.“Arthur C. Clarke ",
  "Tehnologija je rijec koja opisuje nesto sto jos ne funkcionira. - Douglas Adams",
  "Ne osnivate zajednice. Zajednice vec postoje. Pitanje koje treba postaviti je kako im mozete pomoci da budu bolje.“ Mark Zuckerberg"
];

function makeDraggable(el) {
  let offsetX, offsetY;

  const delBtn = document.createElement("button");
  delBtn.textContent = "Izbrisi";
  delBtn.className = "delete-btn";
  el.appendChild(delBtn);

  delBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    el.remove();
  });

  el.addEventListener("mousedown", dragStart);

  function dragStart(e) {
    if (e.target === delBtn) return;
    offsetX = e.clientX - el.offsetLeft;
    offsetY = e.clientY - el.offsetTop;
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", dragEnd);
  }

  function drag(e) {
    e.preventDefault();
    el.style.left = e.clientX - offsetX + "px";
    el.style.top = e.clientY - offsetY + "px";
  }

  function dragEnd() {
    document.removeEventListener("mousemove", drag);
    document.removeEventListener("mouseup", dragEnd);
  }
}

addNoteBtn.addEventListener("click", () => {
  const note = document.createElement("div");
  note.className = "note " + colors[Math.floor(Math.random() * colors.length)];
  note.contentEditable = "true";
  note.style.left = Math.random() * 500 + "px";
  note.style.top = Math.random() * 300 + "px";
  note.textContent = "Napisi nesto...";
  makeDraggable(note);
  board.appendChild(note);
});

addImageBtn.addEventListener("click", () => {
  const div = document.createElement("div");
  div.className = "pinned-img";
  div.style.left = Math.random() * 400 + "px";
  div.style.top = Math.random() * 250 + "px";
  const img = document.createElement("img");
  img.src = sampleImages[Math.floor(Math.random() * sampleImages.length)];
  div.appendChild(img);
  makeDraggable(div);
  board.appendChild(div);
});

addQuoteBtn.addEventListener("click", () => {
  const q = document.createElement("div");
  q.className = "quote";
  q.textContent = sampleQuotes[Math.floor(Math.random() * sampleQuotes.length)];
  q.style.left = Math.random() * 400 + "px";
  q.style.top = Math.random() * 250 + "px";
  q.contentEditable = "true";
  makeDraggable(q);
  board.appendChild(q);
});

saveBtn.addEventListener("click", saveBoard);

function saveBoard() {
  const items = [];
  document.querySelectorAll("#board > div").forEach((el) => {
    const data = {
      type: el.classList.contains("note")
        ? "note"
        : el.classList.contains("quote")
        ? "quote"
        : "image",
      className: el.className,
      html: el.innerHTML,
      left: el.style.left,
      top: el.style.top,
    };
    items.push(data);
  });
  localStorage.setItem("visionBoardItems", JSON.stringify(items));
  alert("Board saved!");
}

function loadBoard() {
  const data = localStorage.getItem("visionBoardItems");
  if (!data) return;
  const items = JSON.parse(data);
  items.forEach((item) => {
    const div = document.createElement("div");
    div.className = item.className;
    div.style.left = item.left;
    div.style.top = item.top;
    div.innerHTML = item.html;
    if (item.type !== "image") div.contentEditable = "true";
    makeDraggable(div);
    board.appendChild(div);
  });
}
loadBoard();

clearBtn.addEventListener("click", () => {
  clearModal.style.display = "block";
});

clearYes.addEventListener("click", () => {
  board.innerHTML = "";
  localStorage.removeItem("visionBoardItems");
  clearModal.style.display = "none";
});

clearNo.addEventListener("click", () => {
  clearModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === clearModal) {
    clearModal.style.display = "none";
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    clearModal.style.display = "none";
  }
});