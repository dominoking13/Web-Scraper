const fs = require('fs-extra');
const path = require('path');

async function writeToJson(data, filename) {
  const outputPath = path.join(__dirname, '../../output', filename);
  await fs.writeJson(outputPath, data, { spaces: 2 });
  console.log(`Data written to ${outputPath}`);
}

async function writeToCsv(data, filename) {
  const outputPath = path.join(__dirname, '../../output', filename);
  // Handle both array of strings (old format) and array of objects (new format)
  const csvContent = data.map(item => {
    if (typeof item === 'string') {
      // Old format: just headline
      return `"${item.replace(/"/g, '""')}"`;
    } else {
      // New format: object with headline, content, and link
      const headline = `"${item.headline.replace(/"/g, '""')}"`;
      const content = `"${item.content.replace(/"/g, '""')}"`;
      const link = `"${item.link.replace(/"/g, '""')}"`;
      return `${headline},${content},${link}`;
    }
  }).join('\n');
  await fs.writeFile(outputPath, csvContent);
  console.log(`Data written to ${outputPath}`);
}

module.exports = { writeToJson, writeToCsv };