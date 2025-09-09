# FAU News Scraper

This project is a simple web scraper that fetches the latest news headlines from the Florida Atlantic University (FAU) news page and outputs them in JSON or CSV format.

## Project Structure

```
fau-news-scraper
├── src
│   ├── index.js          # Entry point of the application
│   ├── scraper.js        # Contains the Scraper class for fetching headlines
│   ├── parser.js         # Parses HTML content to extract headlines
│   └── utils
│       ├── fileWriter.js  # Utility for writing data to files
│       └── logger.js      # Utility for logging messages
├── output                 # Directory for output files
│   ├── .gitkeep           # Keeps the output directory tracked by Git
├── package.json           # Project dependencies and scripts
├── .gitignore             # Files and directories to ignore by Git
└── README.md              # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/fau-news-scraper.git
   cd fau-news-scraper
   ```

2. Install the dependencies:
   ```
   npm install
   ```

## Usage

To run the scraper, execute the following command:
```
node src/index.js
```

The scraper will fetch the latest headlines from the FAU news page and save them to the `output` directory in the specified format (JSON or CSV).

## Contributing

Feel free to submit issues or pull requests if you have suggestions or improvements for the project.

## License

This project is licensed under the MIT License.