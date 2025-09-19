const cheerio = require('cheerio');
const axios = require('axios');

async function parseHeadlines(html, siteConfig) {
    const $ = cheerio.load(html);
    const headlines = [];

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
        const teaserContent = $content.length > 0 ? $content.text().trim() : '';

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
                            const rawText = contentElement.text().trim();

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

                } catch (error) {
                    console.log(`Could not fetch full content for: ${headline.substring(0, 50)}... - ${error.message}`);
                }
            }

            // Add small delay to be respectful to the server
            await new Promise(resolve => setTimeout(resolve, 500));

            headlines.push({
                headline: headline,
                content: fullContent,
                link: link.startsWith('http') ? link : siteConfig.url + link
            });
        }
    }

    console.log(`Parsed ${headlines.length} headlines for ${siteConfig.name}`);
    return headlines;
}

module.exports = parseHeadlines;