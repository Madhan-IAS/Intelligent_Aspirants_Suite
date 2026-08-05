const axios = require('axios');
const cheerio = require('cheerio');
const Parser = require('rss-parser');
const { GoogleGenAI } = require('@google/genai');
const CurrentAffair = require('../models/CurrentAffair');

const parser = new Parser();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Array of User-Agents to prevent blocking
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0'
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

// AI Tagger
const autoTagArticle = async (title, contentSnippet) => {
  try {
    const prompt = `Analyze this news snippet for UPSC Civil Services Examination relevance.
    Title: ${title}
    Snippet: ${contentSnippet}
    
    Task: Output a JSON array of 1 to 3 relevant UPSC tags (e.g. ["GS II", "Polity", "Governance"]). If not relevant to UPSC, output ["Not Relevant"].
    Output ONLY valid JSON.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    let text = response.text;
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (err) {
    console.error("AI Tagging failed:", err.message);
    return ["General"];
  }
};

// Feed Sources
const RSS_FEEDS = [
  { name: 'The Hindu - National', url: 'https://www.thehindu.com/news/national/feeder/default.rss' },
  { name: 'PIB Delhi', url: 'https://pib.gov.in/newsite/rssenglish.aspx' },
  { name: 'Indian Express', url: 'https://indianexpress.com/feed/' },
  { name: 'RBI Press Releases', url: 'https://www.rbi.org.in/home.aspx' }
];

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
  console.log('--- Starting Secure Daily Current Affairs Scraper ---');
  await purgeOldUnsavedArticles();
  let totalNewArticles = 0;
  const sourceResults = []; // Track per-source results for notifications

  // 1. Process Official RSS Feeds (Safest)
  for (const feed of RSS_FEEDS) {
    let feedNewCount = 0;
    const feedTags = new Set();
    
    try {
      console.log(`Fetching RSS: ${feed.name}`);
      const feedData = await parser.parseURL(feed.url);
      
      for (const item of feedData.items) {
        // Check if exists
        const exists = await CurrentAffair.findOne({ title: item.title });
        if (!exists) {
          const tags = await autoTagArticle(item.title, item.contentSnippet || item.content || '');
          
          if (!tags.includes('Not Relevant')) {
            await CurrentAffair.create({
              title: item.title,
              content: item.contentSnippet || item.content || '',
              link: item.link,
              source: feed.name,
              tags: tags,
              date: new Date(item.pubDate || Date.now())
            });
            feedNewCount++;
            totalNewArticles++;
            tags.forEach(t => feedTags.add(t));
          }
          await sleep(2000); // Polite delay between AI calls
        }
      }
    } catch (err) {
      console.error(`Error processing feed ${feed.name}:`, err.message);
    }
    
    // Record this source's results
    sourceResults.push({
      source: feed.name,
      count: feedNewCount,
      tags: Array.from(feedTags)
    });
  }

  // 2. Custom HTML Scraping (Ministry of External Affairs - Press Releases)
  let meaNewCount = 0;
  const meaTags = new Set();
  
  console.log('Scraping HTML: Ministry of External Affairs');
  const meaHtml = await secureFetch('https://mea.gov.in/press-releases.htm');
  if (meaHtml) {
    const $ = cheerio.load(meaHtml);
    const releases = [];
    
    // MEA specific DOM traversal
    $('#innerContent .resultList li').slice(0, 3).each((i, el) => {
      const title = $(el).find('h3 a').text().trim();
      const link = 'https://mea.gov.in/' + $(el).find('h3 a').attr('href');
      const dateStr = $(el).find('.date').text().trim();
      if (title) releases.push({ title, link, dateStr });
    });

    for (const item of releases) {
      const exists = await CurrentAffair.findOne({ title: item.title });
      if (!exists) {
        const tags = await autoTagArticle(item.title, "Ministry of External Affairs Press Release");
        await CurrentAffair.create({
          title: item.title,
          content: `Link: ${item.link}`,
          source: 'Ministry of External Affairs',
          tags: [...tags, 'IR', 'GS II'],
          date: new Date()
        });
        meaNewCount++;
        totalNewArticles++;
        tags.forEach(t => meaTags.add(t));
        meaTags.add('IR');
        meaTags.add('GS II');
        await sleep(2000);
      }
    }
  }
  
  sourceResults.push({
    source: 'Ministry of External Affairs',
    count: meaNewCount,
    tags: Array.from(meaTags)
  });

  console.log(`--- Scraper Finished. Added ${totalNewArticles} new articles. ---`);
  
  // Return structured results for notification creation
  return {
    totalNewArticles,
    sourceResults
  };
};

module.exports = { runScraper, purgeOldUnsavedArticles };
