const xlsx = require('xlsx');
const path = require('path');
const filePath = path.join(__dirname, '..', 'crawling', 'Marthys_Catalog_Import_Ready.xlsx');
const workbook = xlsx.readFile(filePath);
const catSheet = workbook.Sheets['Categories'];
const categories = xlsx.utils.sheet_to_json(catSheet);
console.log("Categories Sheet Data:", categories.map(c => ({ id: c.category_id, name: c.category_name, img: c.image_url || c.image_file })));
