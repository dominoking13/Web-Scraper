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

module.exports = parseHeadlines;