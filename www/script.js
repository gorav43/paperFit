// ==========================================
// PAPERFIT - HOME SCREEN
// ==========================================


// Elements
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");

const cameraBtn = document.getElementById("cameraBtn");
const cameraInput = document.getElementById("cameraInput");

const uploadCard = document.getElementById("uploadCard");

const previewOverlay = document.getElementById("previewOverlay");
const previewImage = document.getElementById("previewImage");

const closePreview = document.getElementById("closePreview");
const continueBtn = document.getElementById("continueBtn");

const menuBtn = document.getElementById("menuBtn");


// Store selected image
let selectedFile = null;
let selectedImageURL = null;


// ==========================================
// OPEN GALLERY
// ==========================================

uploadBtn.addEventListener("click", () => {
    fileInput.click();
});


// ==========================================
// OPEN CAMERA
// ==========================================

cameraBtn.addEventListener("click", () => {
    cameraInput.click();
});


// ==========================================
// FILE INPUT
// ==========================================

fileInput.addEventListener("change", (event) => {

    const file = event.target.files[0];

    if (file) {
        handleImage(file);
    }

});


// ==========================================
// CAMERA INPUT
// ==========================================

cameraInput.addEventListener("change", (event) => {

    const file = event.target.files[0];

    if (file) {
        handleImage(file);
    }

});


// ==========================================
// HANDLE IMAGE
// ==========================================

function handleImage(file) {

    // Check file type
    if (!file.type.startsWith("image/")) {

        alert("Please select an image file.");

        return;
    }


    // Maximum size: 20 MB
    const maxSize = 20 * 1024 * 1024;

    if (file.size > maxSize) {

        alert("Image is too large. Please choose an image below 20 MB.");

        return;
    }


    selectedFile = file;


    // Remove previous object URL
    if (selectedImageURL) {
        URL.revokeObjectURL(selectedImageURL);
    }


    // Create preview URL
    selectedImageURL = URL.createObjectURL(file);


    previewImage.src = selectedImageURL;


    // Show preview
    previewOverlay.classList.add("show");

}


// ==========================================
// CLOSE PREVIEW
// ==========================================

closePreview.addEventListener("click", () => {

    closeImagePreview();

});


function closeImagePreview() {

    previewOverlay.classList.remove("show");

}


// ==========================================
// CLICK OUTSIDE MODAL
// ==========================================

previewOverlay.addEventListener("click", (event) => {

    if (event.target === previewOverlay) {

        closeImagePreview();

    }

});


// ==========================================
// CONTINUE TO EDITOR
// ==========================================

continueBtn.addEventListener("click", () => {

    if (!selectedFile) {

        alert("Please select a photo first.");

        return;
    }


    /*
        Editor will be added in the next version.

        For now we show a message so that we know
        the button is working correctly.
    */

    alert("A4 Editor is coming next!");

});


// ==========================================
// DRAG & DROP
// ==========================================

uploadCard.addEventListener("dragover", (event) => {

    event.preventDefault();

    uploadCard.classList.add("dragging");

});


uploadCard.addEventListener("dragleave", () => {

    uploadCard.classList.remove("dragging");

});


uploadCard.addEventListener("drop", (event) => {

    event.preventDefault();

    uploadCard.classList.remove("dragging");


    const file = event.dataTransfer.files[0];

    if (file) {

        handleImage(file);

    }

});


// ==========================================
// MENU
// ==========================================

menuBtn.addEventListener("click", () => {

    alert(
        "PaperFit\n\n" +
        "Version 1.0\n" +
        "Turn any photo into a print-ready page."
    );

});


// ==========================================
// CLEANUP
// ==========================================

window.addEventListener("beforeunload", () => {

    if (selectedImageURL) {

        URL.revokeObjectURL(selectedImageURL);

    }

});