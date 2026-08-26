const xlsx = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', 'crawling', 'Marthys_Catalog_Import_Ready.xlsx');
const workbook = xlsx.readFile(filePath);

console.log('Sheet Names:', workbook.SheetNames);

workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet).slice(0, 2);
    console.log(`\n--- ${sheetName} ---`);
    console.log(JSON.stringify(data, null, 2));
});
