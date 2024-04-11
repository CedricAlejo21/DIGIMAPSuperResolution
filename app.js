const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());

console.log('Configuring multer storage...');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('Setting file destination...');
        cb(null, 'ESRGAN_trial/LR/');
    },
    filename: function (req, file, cb) {
        console.log('Setting file name...');
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

app.post('/process_image', upload.single('image'), (req, res) => {
    console.log('Processing image...');
    if (!req.file) {
        console.log('No file uploaded.');
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const imagePath = req.file.path;
    console.log(`Image path: ${imagePath}`);
    const pythonProcess = spawn('python', ['ESRGAN_trial/test.py', imagePath]);

    pythonProcess.stdout.on('data', (data) => {
        console.log('Received data from Python process...');
        console.log(`Python process stdout: ${data}`);
        const imagePath = data.toString().trim(); // Assuming data is the path to the processed image
        const resultsFileName = `${path.basename(imagePath)}_rlt.png`; // Append '_rlt.png' to the filename
        const resultsPath = path.join('ESRGAN_trial', 'results', resultsFileName); // Construct the full path to the processed image
        console.log(`Results path: ${resultsPath}`);
        res.json({ resultsPath });
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python process stderr: ${data}`);
        console.error(`Error: ${data}`);
        res.status(500).json({ message: 'Internal server error' });
    });
});

app.get('/processed_images/:imageName', (req, res) => {
    console.log('Getting processed image...');
    const imageName = req.params.imageName;
    const imagePath = path.join(__dirname, 'ESRGAN_trial', 'results', imageName);
    res.sendFile(imagePath);
});

app.get('/', (req, res) => {
    console.log('Serving index.html...');
    res.sendFile(path.join(__dirname,'public', 'index.html'));
});

app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});