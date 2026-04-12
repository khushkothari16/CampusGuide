import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("campus.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS facilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location TEXT,
    description TEXT,
    hours TEXT
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date TEXT,
    location TEXT,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS clubs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    procedure TEXT,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT,
    rule_text TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admission_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT,
    title TEXT,
    content TEXT
  );
`);

// Seed data if empty
const facilitiesCount = db.prepare("SELECT count(*) as count FROM facilities").get() as { count: number };
if (facilitiesCount.count === 0) {
  const insertFacility = db.prepare("INSERT INTO facilities (name, location, description, hours) VALUES (?, ?, ?, ?)");
  insertFacility.run("Main Library", "Central Plaza, Building A", "Main resource center for students.", "Mon-Fri: 8 AM - 10 PM, Sat-Sun: 10 AM - 6 PM");
  insertFacility.run("Placement Cell", "Student Services Wing, 2nd Floor", "Career guidance and recruitment services.", "Mon-Fri: 9 AM - 5 PM");
  insertFacility.run("Health Center", "Near West Gate", "Basic medical services and counseling.", "24/7 for emergencies, Regular: 9 AM - 6 PM");
  insertFacility.run("Cafeteria", "Ground Floor, Admin Block", "Multi-cuisine food court.", "7 AM - 9 PM");

  const insertEvent = db.prepare("INSERT INTO events (name, date, location, description) VALUES (?, ?, ?, ?)");
  insertEvent.run("Annual Tech Fest", "2026-03-15", "Main Auditorium", "A celebration of technology and innovation.");
  insertEvent.run("Career Fair", "2026-04-10", "Exhibition Hall", "Meet top recruiters from various industries.");
  insertEvent.run("Freshers Welcome", "2026-09-05", "Campus Grounds", "Welcoming the new batch of students.");

  const insertClub = db.prepare("INSERT INTO clubs (name, procedure, description) VALUES (?, ?, ?)");
  insertClub.run("Drama Club", "Fill the online form on the student portal and attend auditions in October.", "For students interested in theater and performing arts.");
  insertClub.run("Coding Club", "Join the Discord server and participate in the weekly hackathons.", "Enhance your programming skills and work on cool projects.");
  insertClub.run("Photography Club", "Submit a portfolio of 5 photos to the club secretary.", "Capture the beauty of campus life.");

  const insertRule = db.prepare("INSERT INTO rules (category, rule_text) VALUES (?, ?)");
  insertRule.run("Attendance", "Minimum 75% attendance is required to appear for final examinations at Techno NJR.");
  insertRule.run("ID Cards", "Students must carry their Techno NJR ID cards at all times on campus.");
  insertRule.run("Library", "Silence must be maintained in the library. Fines apply for late book returns.");

  const insertAdm = db.prepare("INSERT INTO admission_info (category, title, content) VALUES (?, ?, ?)");

  // Contacts
  insertAdm.run("Contact", "Admission Office", "Mr. Rajkumar Soni: 8696932729; Dr. Rekha Lahoti: 8696932786; Mr. Abhishek Sharma: 8696932730; Account Department: 8696932738");

  // Documents
  insertAdm.run("Documents", "Required Documents for Admission", "1. 10th Mark sheet (Original + 2 photocopies); 2. 11th Mark sheet (Original + 2 photocopies); 3. 12th Mark sheet (Original + 2 photocopies); 4. Migration certificate (Original + 2 photocopies); 5. Transfer certificate (Original + 2 photocopies); 6. Medical fitness certificate RTU-2019 Format (Original + 2 photocopies); 7. Aadhar card (2 photocopies); 8. Domicile certificate (2 photocopies); 9. Caste certificate (Original + 2 photocopies) (For Reserved Category only); 10. Four latest passport size-coloured photographs; 11. JEE Main / Any entrance exam mark sheet (2 photocopies); 12. Gap certificate in case of year gap (Original + 2 photocopies); 13. Income certificate for TFWS candidates only (RTU Format original)");

  // Bank Details
  insertAdm.run("Bank", "Institution Bank Account Details", "Name of Account: Techno India NJR Institute of Technology; Bank Name: HDFC Bank Ltd, Awalo ki Bari, Jamar Kotda Main Road, Eklingpura, Udaipur-313003; Bank Account Number: 12731450000045; IFSC Code: HDFC0003426");

  // Fee Structure
  insertAdm.run("Fees", "Fee Structure (2025-26) - CSE & AI/DS", "One Time Admission Fee: 14,500 (Includes Registration: 1000, Caution Money: 7500, Development Fee: 2500, Enrolment: 500, Uniform: 3000). Semester Fee (Sem I & II): 38,200 per semester (Tuition: 35,000, Exam: 2200, Book Bank: 1000). Total I-Year: 90,900. II-Year: 76,900. III-Year: 76,900. IV-Year: 77,400. Bus Fee: 10,000 per semester. Hostel Fee: 40,000 (I Sem), 30,000 (II Sem).");
}

async function startServer() {
  const app = express();
  const PORT = 5000;

  app.use(express.json());

  // API Routes
  app.get("/api/knowledge", async (req, res) => {
    const query = req.query.q as string;
    if (!query) {
      return res.json({
        facilities: db.prepare("SELECT * FROM facilities").all(),
        events: db.prepare("SELECT * FROM events").get() ? db.prepare("SELECT * FROM events").all() : [],
        clubs: db.prepare("SELECT * FROM clubs").all(),
        rules: db.prepare("SELECT * FROM rules").all(),
        admission: db.prepare("SELECT * FROM admission_info").all(),
      });
    }

    // Improved search logic: search for the whole query AND individual keywords
    const searchTerms = query.split(/\s+/).filter(term => term.length > 3);
    const searchPattern = `%${query}%`;

    let facilities = db.prepare("SELECT * FROM facilities WHERE name LIKE ? OR description LIKE ?").all(searchPattern, searchPattern);
    let events = db.prepare("SELECT * FROM events WHERE name LIKE ? OR description LIKE ?").all(searchPattern, searchPattern);
    let clubs = db.prepare("SELECT * FROM clubs WHERE name LIKE ? OR description LIKE ?").all(searchPattern, searchPattern);
    let rules = db.prepare("SELECT * FROM rules WHERE category LIKE ? OR rule_text LIKE ?").all(searchPattern, searchPattern);
    let admission = db.prepare("SELECT * FROM admission_info WHERE category LIKE ? OR title LIKE ? OR content LIKE ?").all(searchPattern, searchPattern, searchPattern);
    
    // Add scraped data
    let scrapedData: any[] = [];
    try {
      scrapedData = db.prepare("SELECT * FROM scraped_knowledge WHERE content LIKE ?").all(searchPattern);
    } catch (e) {
      // Ignore if table doesn't exist yet
    }

    // Keyword fallback
    if (facilities.length === 0 && admission.length === 0 && scrapedData.length === 0 && searchTerms.length > 0) {
      for (const term of searchTerms) {
        const termPattern = `%${term}%`;
        const f = db.prepare("SELECT * FROM facilities WHERE name LIKE ? OR description LIKE ?").all(termPattern, termPattern);
        const a = db.prepare("SELECT * FROM admission_info WHERE category LIKE ? OR title LIKE ? OR content LIKE ?").all(termPattern, termPattern, termPattern);
        
        let s: any[] = [];
        try {
           s = db.prepare("SELECT * FROM scraped_knowledge WHERE content LIKE ?").all(termPattern);
        } catch (e) {}

        facilities = [...new Set([...facilities, ...f])];
        admission = [...new Set([...admission, ...a])];
        scrapedData = [...new Set([...scrapedData, ...s])];
        if (facilities.length > 5 || admission.length > 5 || scrapedData.length > 10) break;
      }
    }

    // SerpAPI Fallback
    const serpApiKey = process.env.SERPAPI_API_KEY || process.env.VITE_SERPAPI_API_KEY;
    if (serpApiKey && facilities.length === 0 && admission.length === 0 && scrapedData.length === 0 && searchTerms.length > 0) {
      try {
        const serpResponse = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent("Techno India NJR " + query)}&api_key=${serpApiKey}`);
        const serpData = await serpResponse.json();
        
        if (serpData.organic_results && serpData.organic_results.length > 0) {
          const topResults = serpData.organic_results.slice(0, 3).map((r: any) => ({
            content: `Live Web Search Result: ${r.title} - ${r.snippet}`
          }));
          scrapedData = [...scrapedData, ...topResults];
        } else if (serpData.answer_box && serpData.answer_box.snippet) {
          scrapedData.push({ content: `Live Web Search Answer: ${serpData.answer_box.snippet}` });
        }
      } catch (err) {
        console.error("SerpAPI Error:", err);
      }
    }

    res.json({ facilities, events, clubs, rules, admission, scrapedData });
  });

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || "",
  });

  app.post('/api/chat', async (req, res) => {
    try {
      const { message, history, systemPreamble, image } = req.body;

      // Format messages for Groq API
      const messages: any[] = [
        { role: "system", content: systemPreamble },
        ...history.map((h: any) => ({
          role: h.role === "model" ? "assistant" : h.role,
          content: h.text
        }))
      ];

      // Handle the current user message, potentially with an image
      if (image) {
        messages.push({
          role: "user",
          content: [
            { type: "text", text: message },
            { type: "image_url", image_url: { url: image } }
          ]
        });
      } else {
        messages.push({ role: "user", content: message });
      }

      // Select model based on whether an image is provided
      const model = image ? "llama-3.2-90b-vision-preview" : "llama-3.3-70b-versatile";

      const chatCompletion = await groq.chat.completions.create({
        messages: messages,
        model: model,
      });

      res.json({ text: chatCompletion.choices[0]?.message?.content || "" });
    } catch (error: any) {
      console.error("Backend Groq Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate response" });
    }
  });

  // Global error handling for the process
  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
  });

  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log("\n  🚀 CampusGuide AI is ready!");
    console.log(`  ➜  Local:   \x1b[36mhttp://localhost:${PORT}/\x1b[0m`);
    console.log(`  ➜  Network: \x1b[36mhttp://127.0.0.1:${PORT}/\x1b[0m\n`);
  });
}

startServer();
