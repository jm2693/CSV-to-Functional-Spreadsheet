const fs = require('node:fs');
const readline = require('node:readline');

// the main logic this program follows is as such:
// 1. receives and verifies csv pathname (calls main and potentially promptForFilePath)
// 2. reads csv file (calls readCSV)
// 3. parses csv file for true delimiters and true newlines (calls parseCSV)
// 4. prints a formatted version (table-like) to the node console (calls printFormattedData)

function printFormattedData(parsedData) {
    if (parsedData.length === 0) return;

    // used as a limiter for table size
    // will print an error if table is bigger than certain size
    const MAX_ROW_LENGTH = 130; 
    const CELL_PADDING = 2; 
    const PIPE_CHARS = 2; 

    // calculate column widths and check total row length
    let columnWidths = [];
    let isTooLong = false;

    parsedData.forEach(row => {
        let rowLength = PIPE_CHARS; 
        row.forEach((cell, index) => {
            const cellStr = String(cell);
            columnWidths[index] = Math.max(columnWidths[index] || 0, cellStr.length);
            rowLength += cellStr.length + CELL_PADDING;
        });
        rowLength += (row.length - 1) * 3; // add length for ' | ' between cells

        if (rowLength > MAX_ROW_LENGTH) {
            isTooLong = true;
        }
    });

    if (isTooLong) {
        console.log("Warning: CSV file may be too long for proper display!");
        return;
    }

    let paddedData = parsedData.map(row =>
        row.map((cell, index) => String(cell).padEnd(columnWidths[index]))
    );

    const printRow = row => {
        let formattedRow = row.join(' | ');
        console.log('| ' + formattedRow + ' |');
    }

    // print top border
    console.log('+' + columnWidths.map(width => '-'.repeat(width + 2)).join('+') + '+');

    // print rows
    paddedData.forEach((row, index) => {
        printRow(row);
        // print separator after header
        if (index === 0) {
            console.log('+' + columnWidths.map(width => '-'.repeat(width + 2)).join('+') + '+');
        }
    });

    // print bottom border
    console.log('+' + columnWidths.map(width => '-'.repeat(width + 2)).join('+') + '+');
}

function parseCSV(data, delimiter, newline) {
    let output = [];
    let currentRow = [];
    let currentField = '';
    let inQuote = false;

    for (let i = 0; i < data.length; i++) {
        let char = data[i];

        if (char === '"') {
            if (inQuote && data[i + 1] === '"') {
                // escaped quote inside a quoted field
                currentField += char;
                i++; // skip next quote
            } else {
                inQuote = !inQuote;
            }
        } else if (!inQuote && char === delimiter) {
            currentRow.push(currentField);
            currentField = '';
        } else if (!inQuote && (char === newline || (char === '\r' && data[i + 1] === '\n'))) {
            currentRow.push(currentField);
            output.push(currentRow);
            currentRow = [];
            currentField = '';
            if (char === '\r' && data[i + 1] === '\n') {
                i++; // Skip \n in CRLF
            }
        } else {
            // inside a quoted field, preserve newlines
            if (inQuote && (char === newline || char === '\r')) {
                currentField += ' '; // replace newline with space
            } else {
                currentField += char;
            }
        }
    }

    // handle last field and row
    if (currentField !== '' || currentRow.length > 0) {
        currentRow.push(currentField);
        output.push(currentRow);
    }

    // standardize table cell lengths
    const maxLength = Math.max(...output.map(row => row.length));
    return output.map(row => {
        while (row.length < maxLength) {
            row.push('');
        }
        return row;
    });
}

// for each file, reads and parses the csv data
// writes out to console 
function readCSV(file) {
    return new Promise((resolve, reject) => {
        if (!file.toLowerCase().endsWith('.csv')) {
            reject(new Error('Not a \'.csv\' file!'));
            return;
        }

        fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
                reject(new Error(`Error reading file ${file}: ${err.message}`));
                return;
            }

            let parsedData = parseCSV(data, ',', '\n');
            printFormattedData(parsedData);
            resolve();
        });
    })
}

// function to prompt user if no CLA was given
function promptForFilePath(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    // outputs the question, before taking the input as a string
    // splits string to an array of non white-space strings
    return new Promise(resolve => rl.question(question, filePath => {
        rl.close();
        resolve(filePath.trim());
    }));
}

// main function to get the CLAs and run the conversion function
async function main() {
    // takes in command line arg(s) for file names
    while (true) {
        const filePath = await promptForFilePath("Enter CSV file path: ");

        if (filePath.toLowerCase() === 'exit') {
            console.log('Exiting program.');
            break;
        }
        try {
            await readCSV(filePath);
        } catch (error) {
            console.error(error.message);
        }
        // blank line for 
        console.log('\n');
    }
}

// calling main function
main();

// exports for jasmine testing
module.exports = {
    promptForFilePath,
    readCSV,
    parseCSV,
    printFormattedData,
};