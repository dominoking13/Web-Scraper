# FAU News Scraper

A comprehensive web scraper that fetches news headlines from multiple sources including Florida Atlantic University (FAU) main news, FAU Research news, and WPTV Local news. The scraper outputs clean, formatted data in both JSON and CSV formats.

## Features

- 📰 **Multi-site scraping**: Scrapes from FAU main news, FAU Research, and WPTV Local
- 📊 **Dual output formats**: Generates both JSON and CSV files for each news source
- 🧹 **Content cleaning**: Automatically removes HTML tags, JavaScript, and unwanted content
- ⚡ **Configurable limits**: Set custom headline limits per news source
- 🔄 **Automated scheduling**: GitHub Actions workflow for daily automated scraping
- 📁 **Organized output**: Separate files for each news source in dedicated output directory

## Project Structure

```
fau-news-scraper/
├── src/
│   ├── index.js              # Main application entry point - orchestrates multi-site scraping
│   ├── scraper.js            # HTTP client for fetching web content from configured URLs
│   ├── parser.js             # HTML parsing and content extraction with cleaning functions
│   ├── config/
│   │   └── sites.js          # Configuration file defining news sources, selectors, and limits
│   └── utils/
│       ├── fileWriter.js     # Utility functions for writing JSON/CSV output files
│       └── logger.js         # Logging utilities for debugging and monitoring
├── output/                   # Generated output files directory
│   ├── fau-headlines.json    # FAU main news headlines (JSON format)
│   ├── fau-headlines.csv     # FAU main news headlines (CSV format)
│   ├── fau-research-headlines.json  # FAU Research news headlines (JSON format)
│   ├── fau-research-headlines.csv   # FAU Research news headlines (CSV format)
│   ├── wptv-local-headlines.json    # WPTV Local news headlines (JSON format)
│   ├── wptv-local-headlines.csv     # WPTV Local news headlines (CSV format)
│   └── .gitkeep              # Keeps output directory tracked by Git
├── .github/
│   └── workflows/
│       └── daily-scrape.yml  # GitHub Actions workflow for automated daily scraping
├── package.json              # Project dependencies and npm scripts
├── .gitignore                # Files and directories to ignore by Git
└── README.md                 # This documentation file
```

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/dominoking13/Web-Scraper.git
   cd fau-news-scraper
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## Usage

### Manual Execution

Run the scraper manually:
```bash
npm start
# or
node src/index.js
```

This will:
- Scrape all configured news sources
- Generate clean output files in the `output/` directory
- Display progress and results in the console

### Automated Execution

The project includes GitHub Actions automation that runs daily at 5:00 AM EST:

- Located in `.github/workflows/daily-scrape.yml`
- Automatically commits and pushes updated output files
- Runs on schedule and can be triggered manually

## Configuration

### Adding New News Sources

Edit `src/config/sites.js` to add new news sources:

```javascript
const sites = [
  {
    name: 'example-site',
    url: 'https://example.com/news',
    selectors: {
      headline: 'h2.article-title',
      content: 'div.article-content',
      link: 'h2.article-title a'
    },
    limit: 10  // Optional: limit number of headlines
  }
];
```

### Adjusting Headline Limits

Modify the `limit` property in `src/config/sites.js`:
- Remove the `limit` property to scrape all available headlines
- Set `limit: N` to scrape only the first N headlines

## Output Files

Each news source generates two output files:

### JSON Format (`*-headlines.json`)
```json
[
  {
    "id": 1,
    "headline": "Article Headline",
    "content": "Full article content with HTML cleaned...",
    "link": "https://source.com/article-url"
  }
]
```

### CSV Format (`*-headlines.csv`)
```csv
"Article Headline","Full article content...","https://source.com/article-url"
```

## Dependencies

- **axios**: HTTP client for fetching web content
- **cheerio**: jQuery-like library for HTML parsing
- **fs-extra**: Enhanced file system operations

## Development

### Code Quality

- Modular architecture with separation of concerns
- Comprehensive error handling
- Respectful scraping with delays between requests
- Content cleaning to remove unwanted HTML/JavaScript

### Adding New Features

1. **New scraper functionality**: Add to `src/scraper.js`
2. **New parsing logic**: Modify `src/parser.js`
3. **New output formats**: Extend `src/utils/fileWriter.js`
4. **New news sources**: Update `src/config/sites.js`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source. Please respect the terms of service of the websites being scraped and use responsibly.

## Troubleshooting

### Common Issues

- **Empty output files**: Check if website structure has changed - update selectors in `sites.js`
- **Network errors**: Verify internet connection and website availability
- **Permission errors**: Ensure write permissions for the `output/` directory

### Debug Mode

Add console logging to see detailed scraping progress:
```javascript
console.log('Scraping progress...');
```

## Future Enhancements

- [ ] Add more news sources
- [ ] Implement caching to avoid re-scraping unchanged content
- [ ] Add web interface for configuration
- [ ] Support for additional output formats (XML, RSS)
- [ ] Email notifications for new headlines

This project is licensed under the MIT License.