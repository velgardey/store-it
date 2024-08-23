const express = require('express');
const multer = require('multer'); // Middleware for handling multipart/form-data
const path = require('path');
const child_process = require('child_process');
const app = express();
const port = 3000;
const uploadDir = path.join(__dirname, 'uploads'); // Directory to store uploaded files

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Create a storage engine with the filename option
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Use the original filename
    }
});

// Pass the storage engine to the multer constructor
const upload = multer({ storage: storage });


app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ success: true, filename: req.file.originalname });

    const fileName = req.file.originalname;
    if(fileName.length > 1024)
    {
        //TODO: Send user the error tht file name is too long
        console.error("IMPLEMENT ERROR: FILENAME TOO LONG!");
        return;
    }
    // Construct the command to run the executable with the file name as an argument
    const command = `catalyst.exe ${__dirname}\\uploads\\${fileName} -chunk 24 -o ${__dirname}\\chunks\\${fileName}`;

    // Spawn a new process and execute the command
    const child = child_process.spawn(command, {
        cwd: __dirname, // Set the working directory to the upload directory
        shell: true // Use the shell to run the command
    });

    // Handle the output and error of the child process
    child.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    child.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    child.on('error', (error) => {
        console.error(`Failed to start child process: ${error}`);
    });
    
    child.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
});
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
