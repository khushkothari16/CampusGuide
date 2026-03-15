import axios from 'axios';
import * as cheerio from 'cheerio';
import Database from 'better-sqlite3';

const db = new Database('campus.db');

async function scrapeWebsite() {
  try {
    console.log("Fetching techno njr homepage...");
    const { data } = await axios.get('https://technonjr.org/');
    const $ = cheerio.load(data);
    
    // Create a new general knowledge table to store scraped snippets
    db.exec(`
      CREATE TABLE IF NOT EXISTS scraped_knowledge (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_url TEXT,
        content TEXT
      );
    `);
    
    // Clear old scraped data to avoid duplicates
    db.prepare('DELETE FROM scraped_knowledge').run();
    
    const insertStmt = db.prepare('INSERT INTO scraped_knowledge (source_url, content) VALUES (?, ?)');
    
    // Simple scraping logic: grab paragraphs, headings
    let snippetsAdded = 0;
    $('p, h1, h2, h3, h4, li').each((i, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (text.length > 50) { // Only grab meaningful chunks > 50 chars
        insertStmt.run('https://technonjr.org/', text);
        snippetsAdded++;
      }
    });
    
    console.log(`Successfully scraped and added ${snippetsAdded} snippets to the database from the homepage.`);
    db.close();
  } catch (error) {
    console.error("Error scraping website:", error);
  }
}

scrapeWebsite();
