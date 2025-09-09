const cheerio = require('cheerio');
const axios = require('axios');

async function parseHeadlines(html) {
    const $ = cheerio.load(html);
    const headlines = [];

    // Get all headline elements
    const headlineElements = $('h3.widget-content__title');

    // Process each headline sequentially to avoid overwhelming the server
    for (let i = 0; i < headlineElements.length; i++) {
        const element = headlineElements[i];
        const $headline = $(element);
        const headline = $headline.text().trim();
        const teaserContent = $headline.next('div.widget-content__content').text().trim();

        // Find the link
        const $parent = $headline.parent();
        const $link = $parent.find('a').first();
        const link = $link.length > 0 ? $link.attr('href') : '';

        if (headline && link) {
            // Fetch full article content
            let fullContent = teaserContent; // Fallback to teaser
            try {
                console.log(`Fetching full content for: ${headline.substring(0, 50)}...`);
                const articleResponse = await axios.get(link);
                const $article = cheerio.load(articleResponse.data);

                // Try different selectors for article content
                const articleSelectors = [
                    '.article-content',
                    '.content-body',
                    '.news-content',
                    '.story-content',
                    'article',
                    '.main-content p',
                    '.entry-content'
                ];

                for (const selector of articleSelectors) {
                    const contentElement = $article(selector);
                    if (contentElement.length > 0) {
                        const rawText = contentElement.text().trim();

                        // Filter out navigation and header text
                        if (!rawText.includes('HOME') && !rawText.includes('NEWS DESK') && rawText.length > teaserContent.length) {
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
                        let cleanContent = '';
                        articleParagraphs.each((i, el) => {
                            const text = $article(el).text().trim();
                            if (text) {
                                cleanContent += text + '\n\n';
                            }
                        });
                        if (cleanContent.length > teaserContent.length) {
                            fullContent = cleanContent.trim();
                        }
                    }
                }

                // If we couldn't find better content, keep the teaser
                if (fullContent === teaserContent) {
                    console.log(`Using teaser content for: ${headline.substring(0, 50)}...`);
                }

            } catch (error) {
                console.log(`Could not fetch full content for: ${headline.substring(0, 50)}... - ${error.message}`);
            }

            // Add small delay to be respectful to the server
            await new Promise(resolve => setTimeout(resolve, 500));

            headlines.push({
                headline: headline,
                content: fullContent,
                link: link
            });
        }
    }

    console.log('Parsed headlines with full content:', headlines.length);
    return headlines;
}

module.exports = parseHeadlines;