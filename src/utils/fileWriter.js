const fs = require('fs-extra');
const path = require('path');

async function writeToJson(data, filename) {
  const outputPath = path.join(__dirname, '../../output', filename);
  
  // Ensure the output folder exists
  await fs.ensureDir(path.dirname(outputPath));
  
  await fs.writeJson(outputPath, data, { spaces: 2 });
  console.log(`Data written to ${outputPath}`);
}

async function writeToCsv(data, filename) {
  const outputPath = path.join(__dirname, '../../output', filename);
  
  // Ensure the output folder exists
  await fs.ensureDir(path.dirname(outputPath));
  
  // Handle different data formats
  const csvContent = data.map(item => {
    if (typeof item === 'string') {
      // Old format: just headline
      return `"${item.replace(/"/g, '""')}"`;
    } else if (item.type === 'current' || item.type === 'today' || item.type === 'forecast') {
      // Weather data format
      const type = `"${item.type || ''}"`;
      const temperature = `"${(item.temperature || '').replace(/"/g, '""')}"`;
      const condition = `"${(item.condition || '').replace(/"/g, '""')}"`;
      const high = `"${(item.high || '').replace(/"/g, '""')}"`;
      const low = `"${(item.low || '').replace(/"/g, '""')}"`;
      const realFeel = `"${(item.realFeel || '').replace(/"/g, '""')}"`;
      const wind = `"${(item.wind || '').replace(/"/g, '""')}"`;
      const precipitation = `"${(item.precipitation || '').replace(/"/g, '""')}"`;
      const day = `"${(item.day || '').replace(/"/g, '""')}"`;
      const date = `"${(item.date || '').replace(/"/g, '""')}"`;
      const timestamp = `"${(item.timestamp || '').replace(/"/g, '""')}"`;
      return `${type},${temperature},${condition},${high},${low},${realFeel},${wind},${precipitation},${day},${date},${timestamp}`;
    } else {
      // News data format: object with headline, content, and link
      const headline = `"${(item.headline || '').replace(/"/g, '""')}"`;
      const content = `"${(item.content || '').replace(/"/g, '""')}"`;
      const link = `"${(item.link || '').replace(/"/g, '""')}"`;
      return `${headline},${content},${link}`;
    }
  }).join('\n');
  
  await fs.writeFile(outputPath, csvContent);
  console.log(`Data written to ${outputPath}`);
}

module.exports = { writeToJson, writeToCsv };