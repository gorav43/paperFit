/* PaperFit - full client-side editor */
const $ = (s) => document.querySelector(s);
const uploadBtn = $("#uploadBtn"), fileInput = $("#fileInput"), cameraBtn = $("#cameraBtn"), cameraInput = $("#cameraInput");
const uploadCard = $("#uploadCard"), homeView = $("#homeView"), editorView = $("#editorView"), homeBtn = $("#homeBtn");
const menuBtn = $("#menuBtn"), newPhotoBtn = $("#newPhotoBtn"), a4Paper = $("#a4Paper"), paperContent = $("#paperContent");
const marginRange = $("#marginRange"), marginValue = $("#marginValue"), pdfBtn = $("#pdfBtn"), printBtn = $("#printBtn"), shareBtn = $("#shareBtn");

let state = {
    file: null, url: null, img: null, orientation: "portrait", fit: "fit", margin: 10, rotation: 0,
    mode: null, items: []
};

function openPicker(input) { input.value = ""; input.click() }
uploadBtn.addEventListener("click", () => openPicker(fileInput));
cameraBtn.addEventListener("click", () => openPicker(cameraInput));
fileInput.addEventListener("change", e => { if (e.target.files[0]) loadImage(e.target.files[0]) });
cameraInput.addEventListener("change", e => { if (e.target.files[0]) loadImage(e.target.files[0]) });
uploadCard.addEventListener("dragover", e => { e.preventDefault(); uploadCard.classList.add("dragging") });
uploadCard.addEventListener("dragleave", () => uploadCard.classList.remove("dragging"));
uploadCard.addEventListener("drop", e => { e.preventDefault(); uploadCard.classList.remove("dragging"); const f = e.dataTransfer.files[0]; if (f) loadImage(f) });

async function loadImage(file) {
    if (!file.type.startsWith("image/")) return alert("Please select an image file.");
    if (file.size > 20 * 1024 * 1024) return alert("Please choose an image below 20 MB.");
    if (state.url) URL.revokeObjectURL(state.url);
    state.file = file; state.url = URL.createObjectURL(file); state.rotation = 0; state.mode = null;
    const img = new Image();
    img.onload = () => { state.img = img; state.items = [{ id: Date.now(), url: state.url, rotation: 0, fit: state.fit, mode: null }]; showEditor(); render() };
    img.src = state.url;
}
function showEditor() { homeView.classList.add("hidden"); editorView.classList.remove("hidden"); window.scrollTo({ top: 0, behavior: "smooth" }) }
function showHome() { editorView.classList.add("hidden"); homeView.classList.remove("hidden"); window.scrollTo({ top: 0, behavior: "smooth" }) }
homeBtn.addEventListener("click", showHome);
newPhotoBtn.addEventListener("click", () => openPicker(fileInput));
menuBtn.addEventListener("click", () => alert("PaperFit\n\nA4 photo layout tool\nVersion 1.0"));

document.querySelectorAll("[data-orientation]").forEach(b => b.addEventListener("click", () => {
    state.orientation = b.dataset.orientation; document.querySelectorAll("[data-orientation]").forEach(x => x.classList.toggle("active", x === b)); render();
}));
document.querySelectorAll("[data-fit]").forEach(b => b.addEventListener("click", () => {
    state.fit = b.dataset.fit; state.items.forEach(x => x.fit = state.fit); document.querySelectorAll("[data-fit]").forEach(x => x.classList.toggle("active", x === b)); render();
}));
marginRange.addEventListener("input", () => { state.margin = +marginRange.value; marginValue.textContent = state.margin + " mm"; render() });

$("#rotateLeft").addEventListener("click", () => rotate(-90));
$("#rotateRight").addEventListener("click", () => rotate(90));
function rotate(deg) { state.items.forEach(x => x.rotation = (x.rotation + deg + 360) % 360); render() }
$("#resetPhoto").addEventListener("click", () => { state.rotation = 0; state.mode = null; state.margin = 10; marginRange.value = 10; marginValue.textContent = "10 mm"; state.orientation = "portrait"; state.fit = "fit"; state.items = [{ id: Date.now(), url: state.url, rotation: 0, fit: "fit", mode: null }]; syncButtons(); render() });
$("#duplicatePhoto").addEventListener("click", () => { if (!state.items.length) return; const base = state.items[state.items.length - 1]; state.items.push({ ...base, id: Date.now() + Math.random(), mode: null }); state.mode = null; render() });

document.querySelectorAll("[data-idmode]").forEach(b => b.addEventListener("click", () => applyIdMode(b.dataset.idmode)));
$("#clearMode").addEventListener("click", () => { state.mode = null; state.items = [{ id: Date.now(), url: state.url, rotation: state.items[0]?.rotation || 0, fit: state.fit, mode: null }]; render() });

function syncButtons() {
    document.querySelectorAll("[data-orientation]").forEach(x => x.classList.toggle("active", x.dataset.orientation === state.orientation));
    document.querySelectorAll("[data-fit]").forEach(x => x.classList.toggle("active", x.dataset.fit === state.fit));
}
function applyIdMode(mode) {
    if (!state.url) return;
    state.mode = mode; state.items = [];
    const count = mode === "1x1" ? 1 : mode === "2x2" ? 4 : 8;
    for (let i = 0; i < count; i++)state.items.push({ id: Date.now() + i, url: state.url, rotation: 0, fit: "fill", mode });
    render();
}
function mmToPct(mm, axis) { const size = axis === "x" ? (state.orientation === "portrait" ? 210 : 297) : (state.orientation === "portrait" ? 297 : 210); return (mm / size) * 100 }
function render() {
    a4Paper.classList.toggle("landscape", state.orientation === "landscape");
    paperContent.innerHTML = "";
    const marginX = mmToPct(state.margin, "x"), marginY = mmToPct(state.margin, "y");
    const usableW = 100 - marginX * 2, usableH = 100 - marginY * 2;
    if (!state.items.length) return;
    if (state.mode) {
        let cols = state.mode === "1x1" ? 1 : 2, rows = state.mode === "1x1" ? 1 : state.mode === "2x2" ? 2 : 4;
        const gap = 2;
        const w = (usableW - gap * (cols - 1)) / cols, h = (usableH - gap * (rows - 1)) / rows;
        state.items.forEach((item, i) => addItem(item, (marginX + (i % cols) * (w + gap)), (marginY + Math.floor(i / cols) * (h + gap)), w, h));
    } else {
        const item = state.items[0];
        addItem(item, marginX, marginY, usableW, usableH);
    }
}
function addItem(item, left, top, width, height) {
    const wrap = document.createElement("div"); wrap.className = "photo-item " + (item.fit || "fit") + (item.mode ? " id-mode" : "");
    Object.assign(wrap.style, { left: left + "%", top: top + "%", width: width + "%", height: height + "%" });
    const img = document.createElement("img"); img.src = item.url; img.alt = "Photo"; img.draggable = false;
    img.style.transform = `rotate(${item.rotation || 0}deg)`;
    wrap.appendChild(img); paperContent.appendChild(wrap);
}
function canvasFromImage(item) {
    const img = state.img;
    const canvas = document.createElement("canvas");
    const landscape = state.orientation === "landscape";
    const outW = landscape ? 3508 : 2480, outH = landscape ? 2480 : 3508;
    canvas.width = outW; canvas.height = outH;
    const ctx = canvas.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, outW, outH);
    const mx = outW * (state.margin / (landscape ? 297 : 210)), my = outH * (state.margin / (landscape ? 210 : 297));
    const uw = outW - 2 * mx, uh = outH - 2 * my;
    if (state.mode) {
        const cols = state.mode === "1x1" ? 1 : 2, rows = state.mode === "1x1" ? 1 : state.mode === "2x2" ? 2 : 4;
        const gap = Math.round(Math.min(uw, uh) * .008), cellW = (uw - gap * (cols - 1)) / cols, cellH = (uh - gap * (rows - 1)) / rows;
        state.items.forEach((it, i) => drawImage(ctx, img, mx + (i % cols) * (cellW + gap), my + Math.floor(i / cols) * (cellH + gap), cellW, cellH, it.fit || "fill", it.rotation || 0));
    } else drawImage(ctx, img, mx, my, uw, uh, item.fit || "fit", item.rotation || 0);
    return canvas;
}
function drawImage(ctx, img, x, y, w, h, fit, rotation) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(rotation * Math.PI / 180);
    const iw = img.naturalWidth, ih = img.naturalHeight, ir = iw / ih, br = w / h;
    let dw, dh; if ((fit === "fill" && ir > br) || (fit === "fill" && ir <= br)) { dh = h; dw = dh * ir; if (dw < w) { dw = w; dh = dw / ir } } else { dw = ir > br ? w : h * ir; dh = ir > br ? w / ir : h }
    ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh); ctx.restore();
}
function exportBlob() { return new Promise((resolve, reject) => canvasFromImage(state.items[0]).toBlob(b => b ? resolve(b) : reject(new Error("Export failed")), "image/png", 1)) }

pdfBtn.addEventListener("click", async () => {
    if (!state.img) return;
    const blob = await exportBlob(); const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "PaperFit-A4.png"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    alert("A4 layout exported as PNG. You can choose 'Save as PDF' from the print dialog for a PDF.");
});
printBtn.addEventListener("click", async () => {
    if (!state.img) return;
    const blob = await exportBlob(); const url = URL.createObjectURL(blob);
    const w = window.open("", "_blank"); if (!w) { return alert("Please allow pop-ups for PaperFit.") };
    w.document.write(`<html><head><title>PaperFit Print</title><style>@page{size:A4;margin:0}html,body{margin:0;padding:0;background:#fff}img{width:100vw;height:100vh;object-fit:contain;display:block}</style></head><body><img src="${url}"></body></html>`);
    w.document.close(); w.focus(); setTimeout(() => w.print(), 600);
});
shareBtn.addEventListener("click", async () => {
    if (!state.img) return;
    const blob = await exportBlob(); const file = new File([blob], "PaperFit-A4.png", { type: "image/png" });
    if (navigator.share && navigator.canShare?.({ files: [file] })) { try { await navigator.share({ title: "PaperFit A4", text: "A4 print layout", files: [file] }) } catch { } }
    else alert("Sharing is not available on this device. Use Save / Export PDF first.");
});
window.addEventListener("beforeunload", () => { if (state.url) URL.revokeObjectURL(state.url) });
