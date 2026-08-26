const xlsx = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', 'crawling', 'Marthys_Catalog_Import_Ready.xlsx');
const workbook = xlsx.readFile(filePath);
const prodSheet = workbook.Sheets['Products'];
const products = xlsx.utils.sheet_to_json(prodSheet);
console.log("First Product Row Headers:", Object.keys(products[0]));
console.log("First Product Row:", products[0]);
