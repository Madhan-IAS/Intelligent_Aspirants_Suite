const axios = require('axios');
const cheerio = require('cheerio');
const Parser = require('rss-parser');
const { GoogleGenAI } = require('@google/genai');
const CurrentAffair = require('../models/CurrentAffair');

const parser = new Parser();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// User-Agent pool to ensure reliable access to GOI portals
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0'
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const getRandomUserAgent = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

// Secure Request Helper
const secureFetch = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 15000 // 15 seconds timeout
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error.message);
    return null;
  }
};

// AI Tagger for UPSC Relevance & GS Paper Classification
const autoTagArticle = async (title, contentSnippet) => {
  try {
    const prompt = `Analyze this news item from an official Government of India portal for UPSC Civil Services Examination relevance.
    Title: ${title}
    Snippet: ${contentSnippet}
    
    Task: Output a JSON array of 1 to 3 relevant UPSC tags (e.g. ["GS II", "Polity", "Governance"] or ["GS III", "Economy"] or ["GS III", "Environment"]). If not relevant to UPSC, output ["Not Relevant"].
    Output ONLY valid JSON array of strings.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    let text = response.text;
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (err) {
    console.error("AI Tagging fallback:", err.message);
    return ["UPSC Relevant", "Government Schemes"];
  }
};

// Official Government of India Sources List
const GOI_SOURCES = [
  {
    name: 'Press Information Bureau (PIB)',
    type: 'rss',
    url: 'https://pib.gov.in/newsite/rssenglish.aspx',
    defaultTags: ['PIB', 'GS II', 'Government Schemes']
  },
  {
    name: 'Reserve Bank of India (RBI)',
    type: 'rss',
    url: 'https://rbi.org.in/pressreleases_rss.xml',
    defaultTags: ['RBI', 'GS III', 'Economy']
  },
  {
    name: 'The Hindu - National',
    type: 'rss',
    url: 'https://www.thehindu.com/news/national/feeder/default.rss',
    defaultTags: ['The Hindu', 'Current Affairs']
  },
  {
    name: 'Indian Express',
    type: 'rss',
    url: 'https://indianexpress.com/feed/',
    defaultTags: ['Indian Express', 'Current Affairs']
  }
];

// Direct Scraping Targets for Portals Without Open Public RSS
const GOI_HTML_TARGETS = [
  {
    name: 'Ministry of External Affairs (MEA)',
    url: 'https://mea.gov.in/press-releases.htm',
    baseUrl: 'https://mea.gov.in/',
    defaultTags: ['MEA', 'GS II', 'IR'],
    selector: '#innerContent .resultList li',
    titleSel: 'h3 a',
    linkSel: 'h3 a',
    attr: 'href'
  },
  {
    name: 'National Portal of India',
    url: 'https://india.gov.in/news/national',
    baseUrl: 'https://india.gov.in',
    defaultTags: ['India Portal', 'Governance'],
    selector: '.view-content .views-row',
    titleSel: 'a',
    linkSel: 'a',
    attr: 'href'
  },
  {
    name: 'Union Budget (Ministry of Finance)',
    url: 'https://indiabudget.gov.in/',
    baseUrl: 'https://indiabudget.gov.in/',
    defaultTags: ['Budget', 'GS III', 'Economy'],
    selector: 'a',
    titleSel: '',
    linkSel: '',
    attr: 'href'
  },
  {
    name: 'Ministry of Environment (MoEFCC)',
    url: 'https://moef.gov.in/en/',
    baseUrl: 'https://moef.gov.in',
    defaultTags: ['MoEFCC', 'GS III', 'Environment'],
    selector: '.news-ticker li, .press-release-item',
    titleSel: 'a',
    linkSel: 'a',
    attr: 'href'
  },
  {
    name: 'Ministry of Home Affairs (MHA)',
    url: 'https://mha.gov.in/en',
    baseUrl: 'https://mha.gov.in',
    defaultTags: ['MHA', 'GS III', 'Internal Security'],
    selector: '.press-release-item, .whats-new-item',
    titleSel: 'a',
    linkSel: 'a',
    attr: 'href'
  },
  {
    name: 'Ministry of Law and Justice',
    url: 'https://lawmin.gov.in/',
    baseUrl: 'https://lawmin.gov.in',
    defaultTags: ['Law Ministry', 'GS II', 'Polity'],
    selector: '.news-updates li, a',
    titleSel: '',
    linkSel: '',
    attr: 'href'
  },
  {
    name: 'Ministry of Social Justice & Empowerment',
    url: 'https://socialjustice.gov.in/',
    baseUrl: 'https://socialjustice.gov.in',
    defaultTags: ['Social Justice', 'GS II', 'Welfare Schemes'],
    selector: '.latest-news li, a',
    titleSel: '',
    linkSel: '',
    attr: 'href'
  }
];

// Clean up unsaved articles older than 48 hours to keep feed strictly fresh & daily
const purgeOldUnsavedArticles = async () => {
  try {
    const cutoffDate = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const result = await CurrentAffair.deleteMany({
      isSaved: { $ne: true },
      date: { $lt: cutoffDate }
    });
    console.log(`[Auto-Purge] Cleaned up ${result.deletedCount} old unsaved articles.`);
    return result.deletedCount;
  } catch (err) {
    console.error('[Auto-Purge] Failed to purge old articles:', err.message);
    return 0;
  }
};

const runScraper = async () => {
  console.log('--- Starting Official Government Portals & Daily Current Affairs Scraper ---');
  await purgeOldUnsavedArticles();
  let totalNewArticles = 0;
  const sourceResults = [];

  // 1. Process Official RSS Feeds (PIB, RBI, News Outlets)
  for (const feed of GOI_SOURCES) {
    let feedNewCount = 0;
    const feedTags = new Set(feed.defaultTags);
    
    try {
      console.log(`Fetching RSS Feed: ${feed.name}`);
      const feedData = await parser.parseURL(feed.url);
      
      const items = feedData.items ? feedData.items.slice(0, 5) : [];
      for (const item of items) {
        if (!item.title) continue;
        const exists = await CurrentAffair.findOne({ title: item.title });
        if (!exists) {
          const aiTags = await autoTagArticle(item.title, item.contentSnippet || item.content || '');
          
          if (!aiTags.includes('Not Relevant')) {
            const combinedTags = Array.from(new Set([...feed.defaultTags, ...aiTags]));
            await CurrentAffair.create({
              title: item.title,
              content: item.contentSnippet || item.content || '',
              link: item.link || feed.url,
              source: feed.name,
              tags: combinedTags,
              date: new Date(item.pubDate || Date.now())
            });
            feedNewCount++;
            totalNewArticles++;
            combinedTags.forEach(t => feedTags.add(t));
          }
          await sleep(1500); // Respectful pause
        }
      }
    } catch (err) {
      console.error(`RSS Error [${feed.name}]:`, err.message);
    }
    
    sourceResults.push({
      source: feed.name,
      count: feedNewCount,
      tags: Array.from(feedTags)
    });
  }

  // 2. Process HTML Scraping Targets (MEA, MoEFCC, MHA, Law, Social Justice, India.gov.in, Budget)
  for (const target of GOI_HTML_TARGETS) {
    let targetNewCount = 0;
    const targetTags = new Set(target.defaultTags);

    try {
      console.log(`Scraping GOI Portal: ${target.name}`);
      const html = await secureFetch(target.url);
      if (html) {
        const $ = cheerio.load(html);
        const articlesFound = [];

        $(target.selector).slice(0, 4).each((_, el) => {
          const titleEl = target.titleSel ? $(el).find(target.titleSel) : $(el);
          const linkEl = target.linkSel ? $(el).find(target.linkSel) : $(el);
          
          const title = titleEl.text().trim();
          let link = linkEl.attr(target.attr) || '';
          
          if (link && !link.startsWith('http')) {
            link = target.baseUrl + (link.startsWith('/') ? '' : '/') + link;
          }

          if (title && title.length > 15 && title.length < 250) {
            articlesFound.push({ title, link });
          }
        });

        for (const item of articlesFound) {
          const exists = await CurrentAffair.findOne({ title: item.title });
          if (!exists) {
            const aiTags = await autoTagArticle(item.title, `${target.name} official release`);
            if (!aiTags.includes('Not Relevant')) {
              const combinedTags = Array.from(new Set([...target.defaultTags, ...aiTags]));
              await CurrentAffair.create({
                title: item.title,
                content: `Official Update from ${target.name}`,
                link: item.link || target.url,
                source: target.name,
                tags: combinedTags,
                date: new Date()
              });
              targetNewCount++;
              totalNewArticles++;
              combinedTags.forEach(t => targetTags.add(t));
            }
            await sleep(1500);
          }
        }
      }
    } catch (err) {
      console.error(`HTML Scraping Error [${target.name}]:`, err.message);
    }

    sourceResults.push({
      source: target.name,
      count: targetNewCount,
      tags: Array.from(targetTags)
    });
  }

  console.log(`--- GOI Scraper Completed. ${totalNewArticles} fresh articles ingested across 9 official portals. ---`);
  
  return {
    totalNewArticles,
    sourceResults
  };
};

module.exports = { runScraper, purgeOldUnsavedArticles };
