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
            parsedData.forEach((row, rowIndex) => {
                row.forEach((cell, colIndex) => {
                    const cellKey = String.fromCharCode(65 + colIndex) + (rowIndex + 1);
                    spreadsheet.setCellValue(cellKey, parseFloat(cell) || 0);
                });
            });
            
            printFormattedData(parsedData);
            resolve();
        });
    })
}

class Spreadsheet {
    constructor() {
        this.data = new Map()
    }

    setValue(cell, value) {
        this.data.set(cell, value);
    }

    getValue(cell) {
        this.data.get(cell);
    }

    getCellRange(start, end) {
        // columns get the letter
        // rows get the number
        const startCol = start.charAt(0);
        const endCol = end.charAt(0);
        const startRow = parseInt(start.charAt(1));
        const endRow = parseInt(end.charAt(1));

        let rangedOutput = []
        
        // turn letters into unicode to find range
        // acts as 2D array, adding each element to rangedOutput
        for(let col = startCol.charCodeAt(0); col <= endCol.charCodeAt(0); col++) {
            for(let row = startRow.charCodeAt(0); row <= endRow.charCodeAt(0); row++) {
                const cellKey = fromCharCode(col) + row;
                rangedOutput.push(getCellValue(cellKey));
            }
        }

        return rangedOutput;
    }
}

let spreadsheet = new Spreadsheet();

function sumFormula(start, end) {
    const range = spreadsheet.getCellRange(start, end);
    return range.reduce((sum, value) => sum + value, null);
}

function avgFunction(start, end) {
    const range = spreadsheet.getCellRange(start, end);
    const sum = sumFormula(start, end);
    return sum / range.length;
}

function minFunction(start, end) {
    const range = spreadsheet.getCellRange(start, end);
    return Math.min(...range);
}

function maxFunction(start, end) {
    const range = spreadsheet.getCellRange(start, end);
    return Math.max(...range);
}

function calcFormula(formula) {
    
}

class Spreadsheet {
    constructor() {
        this.data = new Map();
    }

    setCellValue(key, value) {
        this.data.set(key, value);
    }

    // if a cell is non-existent assume its value is null
    getCellValue(key) {
        return this.data.get(key) || 0;
    }

    getCellRange(start, end) {
        const startCol = start.charAt(0);
        const endCol = end.charAt(0);
        const startRow = parseInt(start.slice(1));
        const endRow = parseInt(end.slice(1));

        const range = [];
        for (let col = startCol.charCodeAt(0); col <= endCol.charCodeAt(0); col++) {
            for (let row = startRow; row <= endRow; row++) {
                const cellKey = String.fromCharCode(col) + row;
                range.push(this.getCellValue(cellKey));
            }
        }
        return range;
    }
}


function sumFormula(start, end) {
    const range = spreadsheet.getCellRange(start, end);
    return range.reduce((sum, value) => sum + value, null);
}

function avgFunction(start, end) {
    const range = spreadsheet.getCellRange(start, end);
    const sum = sumFormula(start, end);
    return sum / range.length;
}

function minFunction(start, end) {
    const range = spreadsheet.getCellRange(start, end);
    return Math.min(...range);
}

function maxFunction(start, end) {
    const range = spreadsheet.getCellRange(start, end);
    return Math.max(...range);
}

function calcFormula(formula) {
    let calc, range = [];
    if (formula.startsWith('=')) {
        calc = formula.split('=').pop().split('(')[0].toUpperCase();
        range = formula.split('(').pop().split(')')[0].split(':');
    }

    switch (calc) {
        case 'SUM':
            return sumFormula(range[0], range[1]);
        case 'AVG':
        case 'AVERAGE':
            return avgFunction(range[0], range[1]);
        case 'MIN':
            return minFunction(range[0], range[1]);
        case 'MAX':
            return maxFunction(range[0], range[1]);
        default:
            throw new Error('Unsupported formula');
    }
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

        while (true) {
            const spreadEquation = await promptForFilePath("Enter Spreadsheet Formula (or 'back' to load a new CSV): ");

            if (spreadEquation.toLowerCase() === 'back') {
                break;
            }

            if (spreadEquation.toLowerCase() === 'exit') {
                console.log('Exiting program.');
                return;
            }

            try {
                const result = calcFormula(spreadEquation);
                console.log(`Result: ${result}`);
            } catch (error) {
                console.error(`Error: ${error.message}`);
            }
        }
    }
}

// calling main function
main();

// exports for jasmine testing
module.exports = {
    promptForFilePath,
    readCSV,
    parseCSV,
    // printFormattedData,
};