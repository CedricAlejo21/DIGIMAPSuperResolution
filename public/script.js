const dropArea = document.getElementById("drop-area");
const inputFile = document.getElementById("input-file");
const imageView = document.getElementById("img-view");
const resolvedView = document.getElementById("resolved-img-view");
const cancelButton = document.getElementById("cancel-button");
const submitButton = document.getElementById("submit-button");
const downloadButton = document.getElementById("download-button");

inputFile.addEventListener("change", uploadImage);
cancelButton.addEventListener("click", cancelUpload);
submitButton.addEventListener("click", submitImage);
downloadButton.addEventListener("click", downloadImage);

function uploadImage() {
    console.log('Uploading image...');
    let imgLink = URL.createObjectURL(inputFile.files[0]);
    imageView.style.backgroundColor = "ghostwhite";
    imageView.style.border = "2px solid #bbb5ff";
    imageView.innerHTML = `
        <img src="${imgLink}" style="width: auto; height: 100%; margin: 0;">
    `;

    console.log('Image uploaded.');
}

function cancelUpload() {
    console.log('Cancelling upload...');
    if (imageView.style.backgroundColor != 'ghostwhite') {
        alert("There is no uploaded image to cancel.");
    } else {
        imageView.style.backgroundColor = '#f7f8ff';
        imageView.innerHTML = `
            <img src="img/upload.png">
            <p>Drag and drop or click here<br> to upload image</p>
            <span>Upload any images from desktop</span>
        `;
        imageView.style.border = "2px dashed #bbb5ff";

        resolvedView.style.backgroundColor = 'f7f8ff';
        resolvedView.innerHTML = `
            <img src="">
        `;
        
        console.log('Upload cancelled.');
        inputFile.value = '';
        clearFolder();
    }    
}

function submitImage() {
    console.log('Submitting image...');
    if (imageView.style.backgroundColor === '#f7f8ff') {
        alert("There's no uploaded image to submit.");
    } else {
        resolvedView.textContent = "Generating Image...";

        const imgData = inputFile.files[0];
        
        const formData = new FormData();
        formData.append('image', imgData);

        const serverUrl = window.location.origin; // Get the server URL

        console.log('Sending image to server...');
        console.log('Request details:', `${serverUrl}/process_image`, {
            method: 'POST',
            body: formData
        });
        fetch(`${serverUrl}/process_image`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            const processedImageUrl = `${serverUrl}/processed_images/${inputFile.files[0].name.replace('.png', '')}_rlt.png`; // Construct URL for processed image
            resolvedView.style.backgroundColor = "ghostwhite";
            resolvedView.style.border = "2px solid #bbb5ff";
            resolvedView.innerHTML = `
                <img src="${processedImageUrl}" style="width: auto; height: 100%; margin: 0;">
            `;
            console.log('Image processed and displayed.');
        })
        .catch(error => {
            console.error('Error:', error);
            resolvedView.innerHTML = `
                <p style="color: red;">Failed to process image.</p>
            `;
        });
    }
}

function downloadImage() {
    console.log('Downloading image...');

    const imgElement = resolvedView.querySelector('img');
    const imageUrl = imgElement.src;

    if (!imageUrl || imageUrl === '') {
        alert("There's no processed image to download.");
        return;
    }

    const filename = imageUrl.split('/').pop();

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
}


function clearFolder() {
    const serverUrl = window.location.origin; // Get the server URL

    console.log('Request details:', `${serverUrl}/clear_folder`, {
        method: 'GET'
    });
    fetch(`${serverUrl}/clear_folder`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        // Folder cleared
    })
    .catch(error => console.error('Error:', error));
}

dropArea.addEventListener("dragover", function (e) {
    e.preventDefault();
});

dropArea.addEventListener("drop", function (e) {
    e.preventDefault();
    inputFile.files = e.dataTransfer.files;
    console.log('Image dropped into drop area.');
    uploadImage();
});

window.onload = function () {
    console.log('Window loaded.');
    if (!inputFile.files) {
        cancelUpload();
    }
};