const fs = require('fs');
const path = require('path');
const { isDate } = require('util/types');

// Function to recursively get all files in a directory
function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    });

    return arrayOfFiles;
}

// Function to combine all files
function combineFiles(directoryPath, outputFileName) {
    const allFiles = getAllFiles(directoryPath);
    let combinedContent = '';

    allFiles.forEach(file => {
        const extname = path.extname(file);
        if (['.html', '.css', '.js'].includes(extname)) {
            const content = fs.readFileSync(file, 'utf8');
            combinedContent += `\n\n// File: ${file}\n\n${content}`;
        }
    });

    fs.writeFileSync(outputFileName, combinedContent);
    console.log(`Combined file created: ${outputFileName}`);
}

// Usage
const directoryPath = './'; // Current directory
const currentDate = new Date();
const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
const formattedTime = `${String(currentDate.getHours()).padStart(2, '0')}-${String(currentDate.getMinutes()).padStart(2, '0')}-${String(currentDate.getSeconds()).padStart(2, '0')}`;
const outputFileName = `combined_code_${formattedDate}_${formattedTime}.txt`;
combineFiles(directoryPath, outputFileName);



// type into terminal "node combine-files.js"