/***********************
 * DOM ELEMENTS
 ***********************/
const container = document.getElementById("puzzle-container");
const fileInput = document.getElementById("file-input");
const unsplashBtn = document.getElementById("unsplash-btn");
const contextMenu = document.getElementById("context-menu");
const menuGrid = document.getElementById("menu-grid");
const toggleBtn = document.getElementById("togglePanelBtn");
const controlsPanel = document.getElementById("controlsPanel");
const helpBtn = document.getElementById("helpBtn");
const helpModal = document.getElementById("helpModal");
const helpContent = document.getElementById("helpContent");

/***********************
 * STATE
 ***********************/
let pieces = [];
let currentImageUrl = "";
let panelVisible = true;

/***********************
 * AUDIO
 ***********************/
const clickSound = new Audio("click.wav");
clickSound.preload = "auto";

function playClickSound() {
  clickSound.currentTime = 0;
  clickSound.play().catch(() => {});
}

/***********************
 * CONFIG
 ***********************/
const SIZE = 200;

const unsplashImages = [
  "https://images.unsplash.com/photo-1753287532682-884f023c5544?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1753286437247-49ae106b6334?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1752302112804-428ddd5a89e7?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1751732347302-1c87062321b2?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1751732347274-684f46a48468?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1751730739594-9d016ed468b5?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1750922179522-36b534c0ce54?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1748287443626-872bd20346e8?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1748287443710-54d45b1a7545?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1745175129822-f4eab6fc7327?w=600&h=600&fit=crop"
];

/***********************
 * INIT
 ***********************/
function init() {
  currentImageUrl = unsplashImages[0];
  createPieces(currentImageUrl);

  setTimeout(shufflePieces, 300);
}

/***********************
 * PUZZLE CREATION
 ***********************/
function createPieces(imageUrl) {
  container.innerHTML = "";
  pieces = [];

  for (let i = 0; i < 9; i++) {
    const piece = document.createElement("div");
    piece.className = "puzzle-piece";

    const row = Math.floor(i / 3);
    const col = i % 3;

    piece.style.backgroundImage = `url('${imageUrl}')`;
    piece.style.backgroundPosition = `-${col * SIZE}px -${row * SIZE}px`;
    piece.style.backgroundSize = "600px 600px";

    piece.dataset.index = i;

    piece.addEventListener("mousedown", onDragStart);

    container.appendChild(piece);
    pieces.push(piece);
  }
}

/***********************
 * SHUFFLE
 ***********************/
function shufflePieces() {
  const order = [...pieces];

  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  order.forEach(piece => container.appendChild(piece));

  pieces = Array.from(container.children);
}

/***********************
 * DRAG SYSTEM
 ***********************/
let dragged = null;
let clone = null;
let offsetX = 0;
let offsetY = 0;
let dragging = false;

function onDragStart(e) {
  if (e.button !== 0) return;

  dragged = e.currentTarget;
  dragging = true;

  const rect = dragged.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;

  clone = dragged.cloneNode(true);
  clone.id = "drag-clone";
  clone.style.position = "fixed";
  clone.style.left = `${e.clientX - offsetX}px`;
  clone.style.top = `${e.clientY - offsetY}px`;
  clone.style.zIndex = 9999;
  clone.style.pointerEvents = "none";

  document.body.appendChild(clone);

  dragged.style.opacity = "0.5";

  document.addEventListener("mousemove", onDragMove);
  document.addEventListener("mouseup", onDragEnd);
}

function onDragMove(e) {
  if (!dragging) return;

  clone.style.left = `${e.clientX - offsetX}px`;
  clone.style.top = `${e.clientY - offsetY}px`;

  const el = document.elementsFromPoint(e.clientX, e.clientY);
  const target = el.find(x =>
    x.classList.contains("puzzle-piece") && x !== dragged
  );

  pieces.forEach(p => p.classList.remove("drag-over"));

  if (target) target.classList.add("drag-over");
}

function onDragEnd(e) {
  if (!dragging) return;

  const el = document.elementsFromPoint(e.clientX, e.clientY);
  const target = el.find(x =>
    x.classList.contains("puzzle-piece") && x !== dragged
  );

  if (target) {
    const rect = target.getBoundingClientRect();
    const before = e.clientX < rect.left + rect.width / 2;

    before ? target.before(dragged) : target.after(dragged);

    pieces = Array.from(container.children);
    checkSolved();
  }

  cleanupDrag();
}

function cleanupDrag() {
  dragging = false;

  if (clone) clone.remove();
  if (dragged) dragged.style.opacity = "";

  pieces.forEach(p => p.classList.remove("drag-over"));

  document.removeEventListener("mousemove", onDragMove);
  document.removeEventListener("mouseup", onDragEnd);

  dragged = null;
  clone = null;
}

/***********************
 * CHECK WIN
 ***********************/
function checkSolved() {
  const solved = pieces.every(
    (p, i) => Number(p.dataset.index) === i
  );

  if (!solved) return;

  pieces.forEach(p => {
    p.style.transform = "scale(1.02)";
    p.style.boxShadow = "0 0 20px #4CAF50";
  });

  setTimeout(() => {
    alert("🎉 Puzzle solved!");
    pieces.forEach(p => {
      p.style.transform = "";
      p.style.boxShadow = "";
    });
  }, 100);
}

/***********************
 * MENU
 ***********************/
function openMenu(e) {
  e.preventDefault();

  menuGrid.innerHTML = "";

  unsplashImages.forEach(url => {
    const div = document.createElement("div");
    div.className = "menu-item";

    div.innerHTML = `<img src="${url}">`;

    div.onclick = () => {
      currentImageUrl = url;
      createPieces(url);
      setTimeout(shufflePieces, 300);
      closeMenu();
    };

    menuGrid.appendChild(div);
  });

  const rect = unsplashBtn.getBoundingClientRect();

  contextMenu.style.display = "block";
  contextMenu.style.left = rect.left + "px";
  contextMenu.style.top = rect.bottom + "px";
}

function closeMenu() {
  contextMenu.style.display = "none";
}

/***********************
 * HELP MODAL
 ***********************/
function openHelp() {
  helpModal.classList.add("active");
}

function closeHelp(e) {
  if (e.target === helpModal) {
    helpModal.classList.remove("active");
  }
}

/***********************
 * FILE UPLOAD
 ***********************/
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (ev) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 600;

      const ctx = canvas.getContext("2d");
      const ratio = Math.max(600 / img.width, 600 / img.height);

      const x = (600 - img.width * ratio) / 2;
      const y = (600 - img.height * ratio) / 2;

      ctx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        x,
        y,
        img.width * ratio,
        img.height * ratio
      );

      currentImageUrl = canvas.toDataURL("image/jpeg");
      createPieces(currentImageUrl);
      setTimeout(shufflePieces, 300);
    };

    img.src = ev.target.result;
  };

  reader.readAsDataURL(file);
});

/***********************
 * EVENTS (GLOBAL)
 ***********************/
document.addEventListener("click", (e) => {
  playClickSound();

  if (!unsplashBtn.contains(e.target) &&
      !contextMenu.contains(e.target)) {
    closeMenu();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

unsplashBtn.addEventListener("click", openMenu);
unsplashBtn.addEventListener("contextmenu", openMenu);

toggleBtn.addEventListener("click", () => {
  panelVisible = !panelVisible;
  controlsPanel.classList.toggle("hidden", !panelVisible);
});

helpBtn.addEventListener("click", openHelp);
helpModal.addEventListener("click", closeHelp);

/***********************
 * START
 ***********************/
init();