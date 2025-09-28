const cheerio = require('cheerio');
const axios = require('axios');

// Function to clean HTML content and remove unwanted elements
function cleanContent(text) {
    if (!text) return '';

    // Remove HTML tags
    let cleaned = text.replace(/<[^>]*>/g, '');

    // Remove extra whitespace and newlines
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    // Remove common unwanted patterns
    cleaned = cleaned.replace(/\n+/g, ' ');
    cleaned = cleaned.replace(/\t+/g, ' ');
    cleaned = cleaned.replace(/\r+/g, ' ');

    // Remove image alt text patterns
    cleaned = cleaned.replace(/img alt[^"]*"[^"]*"/gi, '');
    cleaned = cleaned.replace(/alt="[^"]*"/gi, '');

    // Remove script content and JavaScript
    cleaned = cleaned.replace(/document\.getElementById\([^)]+\)\.addEventListener\([^)]+\)/g, '');
    cleaned = cleaned.replace(/fetch\([^)]+\)/g, '');
    cleaned = cleaned.replace(/let [^=]+=\{[^}]+\};/g, '');
    cleaned = cleaned.replace(/ns\.classList\.toggle\([^)]+\)/g, '');
    cleaned = cleaned.replace(/nsu\.classList\.toggle\([^)]+\)/g, '');
    cleaned = cleaned.replace(/document\.getElementById\([^)]+\)\.innerHTML[^;]+;/g, '');
    cleaned = cleaned.replace(/event\.preventDefault\(\);/g, '');
    cleaned = cleaned.replace(/let [^=]+=\s*document\.getElementById\([^)]+\)\.value;/g, '');
    cleaned = cleaned.replace(/let [^=]+=\s*document\.getElementById\([^)]+\);/g, '');
    cleaned = cleaned.replace(/Authorization:\s*'[^']*'/g, '');
    cleaned = cleaned.replace(/Content-Type:\s*'[^']*'/g, '');
    cleaned = cleaned.replace(/method:\s*'[^']*'/g, '');
    cleaned = cleaned.replace(/console\.log\([^)]+\)/g, '');
    cleaned = cleaned.replace(/;\s*\}\)\.then\(function\([^}]+\}\);/g, '');
    cleaned = cleaned.replace(/function\([^)]+\)\s*\{[^}]*\}/g, '');
    cleaned = cleaned.replace(/JSON\.stringify\([^)]+\)/g, '');

    // Remove newsletter signup text
    cleaned = cleaned.replace(/Sign up for the[^}]*}/gi, '');
    cleaned = cleaned.replace(/now signed up to receive[^}]*}/gi, '');
    cleaned = cleaned.replace(/Click here to manage all Newsletters/gi, '');

    // Remove copyright notices and boilerplate
    cleaned = cleaned.replace(/Copyright \d{4} [^.]*\./gi, '');
    cleaned = cleaned.replace(/All rights reserved\./gi, '');
    cleaned = cleaned.replace(/This material may not be published[^.]*\./gi, '');

    // Remove common website footer text
    cleaned = cleaned.replace(/At WPTV, It Starts with Listening/gi, '');
    cleaned = cleaned.replace(/Protecting Paradise/gi, '');

    // Remove action buttons text
    cleaned = cleaned.replace(/Actions Facebook Tweet Email/gi, '');

    // Remove navigation text
    cleaned = cleaned.replace(/Prev Next/gi, '');

    // Clean up multiple spaces again
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
}

async function parseHeadlines(html, siteConfig) {
    const $ = cheerio.load(html);
    const headlines = [];

    // Handle weather sites differently
    if (siteConfig.type === 'weather') {
        return parseWeatherData($, siteConfig);
    }

    // Get all headline elements based on site configuration
    const headlineElements = $(siteConfig.selectors.headline);

    // Process each headline sequentially to avoid overwhelming servers
    const maxHeadlines = siteConfig.limit || headlineElements.length;
    for (let i = 0; i < headlineElements.length && headlines.length < maxHeadlines; i++) {
        const element = headlineElements[i];
        const $headline = $(element);
        const headline = $headline.text().trim();

        // Get content using site-specific selector
        const $content = $headline.next(siteConfig.selectors.content);
        const teaserContent = $content.length > 0 ? cleanContent($content.text().trim()) : '';

        // Get link using site-specific selector
        const $link = $headline.closest('a').length > 0 ? $headline.closest('a') :
                     $headline.find('a').first();
        const link = $link.length > 0 ? $link.attr('href') : '';

        if (headline) {
            // Fetch full article content if link exists
            let fullContent = teaserContent;
            if (link) {
                try {
                    console.log(`Fetching full content for: ${headline.substring(0, 50)}...`);
                    const fullUrl = link.startsWith('http') ? link : siteConfig.url + link;
                    const articleResponse = await axios.get(fullUrl);
                    const $article = cheerio.load(articleResponse.data);

                    // Try different selectors for article content
                    const articleSelectors = [
                        '.article-content',
                        '.content-body',
                        '.news-content',
                        '.story-content',
                        'article',
                        '.main-content p',
                        '.entry-content',
                        '.article-body',
                        '.story-body'
                    ];

                    for (const selector of articleSelectors) {
                        const contentElement = $article(selector);
                        if (contentElement.length > 0) {
                            const rawText = cleanContent(contentElement.text().trim());

                            // Filter out navigation and header text
                            if (!rawText.includes('HOME') && !rawText.includes('NEWS DESK') &&
                                !rawText.includes('Tags:') && !rawText.includes('Categories') &&
                                rawText.length > teaserContent.length) {
                                fullContent = rawText;
                                break;
                            }
                        }
                    }

                    // If we still have navigation text, try extracting just paragraphs
                    if (fullContent.includes('HOME') || fullContent.includes('NEWS DESK') || fullContent === teaserContent) {
                        const paragraphs = $article('p');
                        const articleParagraphs = paragraphs.filter((i, el) => {
                            const text = $article(el).text().trim();
                            // Skip paragraphs that are clearly navigation or metadata
                            return text.length > 20 &&
                                   !text.includes('HOME') &&
                                   !text.includes('NEWS DESK') &&
                                   !text.includes('Tags:') &&
                                   !text.includes('Categories') &&
                                   !text.match(/^\s*By\s+[a-zA-Z]/) && // Skip author bylines
                                   !text.match(/^\s*\d{1,2}\/\d{1,2}\/\d{4}/) && // Skip dates
                                   text.length < 1000; // Skip very long paragraphs that might be metadata
                        });

                        if (articleParagraphs.length > 0) {
                            let articleText = '';
                            articleParagraphs.each((i, el) => {
                                const text = cleanContent($article(el).text().trim());
                                if (text) {
                                    articleText += text + '\n\n';
                                }
                            });
                            if (articleText.length > teaserContent.length) {
                                fullContent = articleText.trim();
                            }
                        }
                    }

                } catch (error) {
                    console.log(`Could not fetch full content for: ${headline.substring(0, 50)}... - ${error.message}`);
                }
            }

            // Add small delay to be respectful to the server
            await new Promise(resolve => setTimeout(resolve, 500));

            headlines.push({
                headline: headline,
                content: cleanContent(fullContent),
                link: link.startsWith('http') ? link : siteConfig.url + link
            });
        }
    }

    console.log(`Parsed ${headlines.length} headlines for ${siteConfig.name}`);
    return headlines;
}

function parseWeatherData($, siteConfig) {
    const weatherData = [];

    try {
        // First, try to find weather data in script tags (JSON data)
        const scripts = $('script');
        let weatherJsonData = null;

        scripts.each((i, script) => {
            const scriptContent = $(script).html();
            if (scriptContent && scriptContent.includes('current')) {
                // Look for JSON data containing weather information
                const jsonMatch = scriptContent.match(/({.*current.*})/s);
                if (jsonMatch) {
                    try {
                        weatherJsonData = JSON.parse(jsonMatch[1]);
                    } catch (e) {
                        // Try to find other patterns
                    }
                }
            }
        });

        // If we found JSON data, use it
        if (weatherJsonData) {
            // Parse JSON data here if needed
        }

        // Fallback: Try to find weather data in data attributes
        const weatherElements = $('[data-qa*="weather"], [class*="weather"], [class*="temp"], [class*="forecast"]');

        // Look for current weather
        const currentTemp = $('[data-temp], .temp, .current-temp').first().text().trim() ||
                           $('body').text().match(/(\d+)°F/)?.[1];
        const currentCondition = $('.condition, .phrase, .weather-phrase').first().text().trim();

        if (currentTemp) {
            // Clean up temperature (remove duplicate °F)
            const cleanTemp = currentTemp.replace('°F°F', '°F').replace('°°', '°');
            weatherData.push({
                type: 'current',
                temperature: cleanTemp.includes('°') ? cleanTemp : cleanTemp + '°F',
                condition: currentCondition || 'Unknown',
                timestamp: new Date().toISOString()
            });
        }

        // Look for today's forecast
        const todayHigh = $('body').text().match(/Hi:\s*(\d+)°/)?.[1];
        const todayLow = $('body').text().match(/Lo:\s*(\d+)°/)?.[1];

        if (todayHigh && todayLow) {
            weatherData.push({
                type: 'today',
                high: todayHigh + '°',
                low: todayLow + '°',
                date: new Date().toISOString().split('T')[0]
            });
        }

        // Look for 10-day forecast in any format - try multiple patterns
        const forecastText = $('body').text();

        // Pattern 1: "DAY DATE HIGH° LOW°" format
        const forecastMatches1 = forecastText.match(/([A-Z]{3,})\s+(\d+\/\d+)\s+(\d+)°\s+(\d+)°/g);

        // Pattern 2: "TONIGHT/SUN/MON etc. DATE HIGH° Lo LOW°" format
        const forecastMatches2 = forecastText.match(/(TONIGHT|MON|TUE|WED|THU|FRI|SAT|SUN)\s+(\d+\/\d+)\s+(\d+)°\s+(?:Lo\s+)?(\d+)°/g);

        // Pattern 3: Look for any temperature patterns in forecast sections
        const forecastSection = forecastText.match(/10-DAY WEATHER FORECAST[\s\S]*?(?=SUN & MOON|$)/);
        let forecastMatches3 = [];
        if (forecastSection) {
            forecastMatches3 = forecastSection[1].match(/(\d+)°/g) || [];
        }

        const allForecastMatches = forecastMatches1 || forecastMatches2 || [];
        console.log('Forecast matches pattern 1:', forecastMatches1?.length || 0);
        console.log('Forecast matches pattern 2:', forecastMatches2?.length || 0);
        console.log('Forecast matches pattern 3:', forecastMatches3?.length || 0);

        if (allForecastMatches.length > 0) {
            allForecastMatches.slice(0, 10).forEach((match, index) => {
                const parts = match.trim().split(/\s+/);
                if (parts.length >= 4) {
                    const forecastDate = new Date();
                    forecastDate.setDate(forecastDate.getDate() + index + 1);

                    weatherData.push({
                        type: 'forecast',
                        day: parts[0],
                        date: parts[1],
                        high: parts[2],
                        low: parts[3],
                        forecastDate: forecastDate.toISOString().split('T')[0]
                    });
                }
            });
        }

        // Try alternative forecast extraction from structured data
        const forecastElements = $('[data-qa*="forecast"], .forecast-card, .daily-forecast');
        forecastElements.slice(0, 10).each((index, element) => {
            const $el = $(element);
            const day = $el.find('.day, .date').text().trim();
            const high = $el.find('.high, .temp-h').text().trim();
            const low = $el.find('.low, .temp-l').text().trim();
            const condition = $el.find('.condition, .phrase').text().trim();

            if (day && (high || low)) {
                const forecastDate = new Date();
                forecastDate.setDate(forecastDate.getDate() + index + 1);

                weatherData.push({
                    type: 'forecast',
                    day: day,
                    high: high,
                    low: low,
                    condition: condition,
                    forecastDate: forecastDate.toISOString().split('T')[0]
                });
            }
        });

        console.log('Weather elements found:', weatherElements.length);
        console.log('Current temp found:', !!currentTemp);
        console.log('Today forecast found:', !!(todayHigh && todayLow));
        console.log('Forecast matches pattern 1:', forecastMatches1?.length || 0);
        console.log('Forecast matches pattern 2:', forecastMatches2?.length || 0);
        console.log('Forecast matches pattern 3:', forecastMatches3?.length || 0);

    } catch (error) {
        console.error(`Error parsing weather data for ${siteConfig.name}:`, error.message);
    }

    console.log(`Parsed ${weatherData.length} weather data items for ${siteConfig.name}`);
    return weatherData;
}

module.exports = parseHeadlines;