const sites = [
  {
    name: 'fau',
    url: 'https://www.fau.edu/newsdesk/tags.php?tag=research',
    selectors: {
      headline: 'h3[itemprop="headline"]',
      content: 'p[itemprop="description"]',
      link: 'h3[itemprop="headline"] a'
    },
    limit: 12
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
  },
  {
    name: 'fau-academic-campus-life',
    url: 'https://www.fau.edu/newsdesk/academic-campus-life.php',
    selectors: {
      headline: 'h3',
      content: 'p',
      link: 'h3 a'
    },
    limit: 10
  },
  {
    name: 'fau-engineering',
    url: 'https://www.fau.edu/engineering/news/',
    selectors: {
      headline: 'a[href*="/engineering/news/"]:not([href$="/engineering/news/"]):not([href$="/engineering/news/phd-announcements/"]):not([href*="cms.omniupdate.com"])',
      content: 'a[href*="/engineering/news/"]:not([href$="/engineering/news/"]):not([href$="/engineering/news/phd-announcements/"]):not([href*="cms.omniupdate.com"])', // Using headline as content since there's no separate excerpt
      link: 'a[href*="/engineering/news/"]:not([href$="/engineering/news/"]):not([href$="/engineering/news/phd-announcements/"]):not([href*="cms.omniupdate.com"])'
    },
    limit: 10
  },
  {
    name: 'accuweather-boca-raton',
    url: 'https://www.accuweather.com/en/us/boca-raton/33432/weather-forecast/332347',
    type: 'weather',
    selectors: {
      currentWeather: '[data-qa="current-weather"]',
      todayWeather: '[data-qa="today-weather"]',
      forecast10Day: '[data-qa="10day"] .daily-list-item'
    }
  },
  {
    name: 'cnbc-economy',
    url: 'https://www.cnbc.com/economy/',
    selectors: {
      headline: 'div.Card-titleContainer a',
      content: 'div.Card-titleContainer a', // Using headline as content since there's no separate excerpt
      link: 'div.Card-titleContainer a'
    },
    limit: 10
  },
  {
    name: 'fau-sports',
    url: 'https://fausports.com/archives',
    selectors: {
      headline: 'a[href*="/news/"]:not([href*="student-ticket"]):not([href*="premium-tickets"]):not([href*="general-"])',
      content: 'a[href*="/news/"]:not([href*="student-ticket"]):not([href*="premium-tickets"]):not([href*="general-"])', // Using headline as content since there's no separate excerpt
      link: 'a[href*="/news/"]:not([href*="student-ticket"]):not([href*="premium-tickets"]):not([href*="general-"])'
    },
    limit: 15
  },
  {
    name: 'boca-current-affairs',
    url: 'https://www.myboca.us/CivicAlerts.aspx?CID=1',
    selectors: {
      headline: 'a[id^="alertTitle_"]',
      content: 'div.item.intro.fr-view p', // The paragraph following the headline
      link: 'a[id^="alertTitle_"]'
    },
    limit: 10
  },
  {
    name: 'nbc-sports',
    url: 'https://www.nbcsports.com/',
    selectors: {
      headline: 'div.PageListTopSearch-items-item div.PagePromo-title a.Link',
      content: 'div.PageListTopSearch-items-item div.PagePromo-title a.Link', // Using headline as content since there's no separate excerpt
      link: 'div.PageListTopSearch-items-item div.PagePromo-title a.Link'
    },
    limit: 10
  }
];

module.exports = sites;