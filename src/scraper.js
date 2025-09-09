const axios = require('axios');

async function fetchFauNews() {
  try {
    const response = await axios.get('https://www.fau.edu/newsdesk/');
    console.log('HTML fetched successfully. Length:', response.data.length);
    return response.data;
  } catch (error) {
    console.error('Error fetching FAU news:', error);
    throw error;
  }
}

module.exports = fetchFauNews;