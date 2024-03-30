const dropArea = document.getElementById("drop-area");
const inputFile = document.getElementById("input-file");
const imageView = document.getElementById("img-view");
const resolvedView = document.getElementById("resolved-img-view");
const cancelButton = document.getElementById("cancel-button");
const submitButton = document.getElementById("submit-button");

inputFile.addEventListener("change", uploadImage);
cancelButton.addEventListener("click", cancelUpload);
submitButton.addEventListener("click", submitImage);

function uploadImage() {
    let imgLink = URL.createObjectURL(inputFile.files[0]);
    imageView.style.backgroundImage = `url(${imgLink})`;
    imageView.textContent = "";
    imageView.style.border = 0;
}

function cancelUpload() {
    if (imageView.style.backgroundImage === 'none') {
        alert("There is no uploaded image to cancel.");
    } else {
        imageView.style.backgroundImage = 'none';
        resolvedView.style.backgroundImage = 'none';
        imageView.innerHTML = `
            <img src="public/upload.png">
            <p>Drag and drop or click here<br> to upload image</p>
            <span>Upload any images from desktop</span>
        `;
        imageView.style.border = "2px dashed #bbb5ff";
    }
}

function submitImage() {
    if (imageView.style.backgroundImage === 'none') {
        alert("There's no uploaded image to submit.");
    } else {
        const imgLink = imageView.style.backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
        resolvedView.style.backgroundImage = `url(${imgLink})`;
        resolvedView.style.border = "2px solid #bbb5ff";
    }
}

dropArea.addEventListener("dragover", function (e) {
    e.preventDefault();
});

dropArea.addEventListener("drop", function (e) {
    e.preventDefault();
    inputFile.files = e.dataTransfer.files;
    uploadImage();
});

window.onload = function () {
    if (!inputFile.files.length) {
        cancelUpload();
    }
};
