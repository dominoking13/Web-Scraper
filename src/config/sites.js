const sites = [
  {
    name: 'fau',
    url: 'https://www.fau.edu/newsdesk/',
    selectors: {
      headline: 'h3.widget-content__title',
      content: 'div.widget-content__content',
      link: 'h3.widget-content__title a'
    }
  },
  {
    name: 'fau-research',
    url: 'https://www.fau.edu/newsdesk/tags.php?tag=research',
    selectors: {
      headline: 'h3[itemprop="headline"]',
      content: 'p[itemprop="description"]',
      link: 'h3[itemprop="headline"] a'
    }
  },
  {
    name: 'wptv-local',
    url: 'https://www.wptv.com/news/local-news',
    selectors: {
      headline: 'h3.ListItem-title',
      content: 'p.ListItem-category', // Using category as content since there's no dedicated excerpt
      link: 'a.ListItem'
    },
    limit: 13
  }
];

module.exports = sites;