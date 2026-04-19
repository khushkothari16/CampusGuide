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

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    college_id TEXT,
    login_time DATETIME DEFAULT CURRENT_TIMESTAMP
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

  app.post("/api/login", (req, res) => {
    try {
      const { name, role, collegeId } = req.body;
      const insertUser = db.prepare("INSERT INTO users (name, role, college_id) VALUES (?, ?, ?)");
      const result = insertUser.run(name, role, collegeId || null);
      res.json({ success: true, id: result.lastInsertRowid });
    } catch (error: any) {
      console.error("Login Error:", error);
      res.status(500).json({ error: "Failed to record login" });
    }
  });

  app.get("/api/users", (req, res) => {
    try {
      const users = db.prepare("SELECT * FROM users ORDER BY login_time DESC").all() as any[];
      
      if (req.accepts('html')) {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CampusGuide AI - Users Admin</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Outfit', sans-serif;
      background-color: #0B1120;
      color: #E5E7EB;
      background-image: 
        radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), 
        radial-gradient(at 50% 0%, hsla(225,39%,30%,0.2) 0, transparent 50%), 
        radial-gradient(at 100% 0%, hsla(339,49%,30%,0.2) 0, transparent 50%);
      background-attachment: fixed;
    }
    .glass-panel {
      background: rgba(31, 41, 55, 0.4);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    }
    .status-badge {
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.70rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .role-student { background: rgba(59, 130, 246, 0.15); color: #93C5FD; border: 1px solid rgba(59, 130, 246, 0.3); }
    .role-visitor { background: rgba(16, 185, 129, 0.15); color: #6EE7B7; border: 1px solid rgba(16, 185, 129, 0.3); }
    .role-fresher { background: rgba(245, 158, 11, 0.15); color: #FCD34D; border: 1px solid rgba(245, 158, 11, 0.3); }
    .role-admin { background: rgba(168, 85, 247, 0.15); color: #D8B4FE; border: 1px solid rgba(168, 85, 247, 0.3); }
    .hover-row:hover { background: rgba(255, 255, 255, 0.03); }
  </style>
</head>
<body class="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-6xl mx-auto">
    <!-- Header -->
    <div class="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <div class="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          User Directory Dashboard
        </h1>
        <p class="mt-3 text-sm text-gray-400 max-w-xl leading-relaxed">View and manage all users securely logged into the CampusGuide AI. Monitoring visitor and student interactions in real-time.</p>
      </div>
      <div class="glass-panel px-5 py-3 rounded-2xl flex items-center gap-4 shrink-0 shadow-lg border border-gray-700">
        <div class="relative flex items-center justify-center">
           <span class="absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-20 animate-ping"></span>
           <span class="relative inline-flex rounded-full h-3 w-3 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
        </div>
        <div>
           <p class="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-0.5">System Status</p>
           <p class="text-sm font-semibold text-gray-200"><span class="text-blue-400 font-bold">${users.length}</span> Active Profiles</p>
        </div>
      </div>
    </div>
    
    <!-- Table Container -->
    <div class="glass-panel rounded-3xl overflow-hidden shadow-2xl border border-gray-800/60 relative">
      <div class="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-[#111827]/80 backdrop-blur-md border-b border-gray-800">
              <th class="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest min-w-[250px]">Student Profile</th>
              <th class="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">Designation</th>
              <th class="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">College ID</th>
              <th class="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Login Timestamp</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-800/60 font-medium">
            ${users.length > 0 ? users.map(user => `
            <tr class="hover-row transition-all duration-300 group">
              <td class="px-8 py-5 whitespace-nowrap">
                <div class="flex items-center gap-4">
                  <div class="h-12 w-12 flex-shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(99,102,241,0.4)] group-hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] transition-all transform group-hover:-translate-y-0.5 border border-white/10">
                    ${user.name.charAt(0).toUpperCase()}
                  </div>
                  <div class="flex flex-col">
                    <span class="text-base font-semibold text-gray-100 group-hover:text-blue-400 transition-colors">${user.name}</span>
                    <span class="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      UID: #${String(user.id).padStart(4, '0')}
                    </span>
                  </div>
                </div>
              </td>
              <td class="px-8 py-5 whitespace-nowrap">
                <span class="status-badge role-${(user.role || 'visitor').toLowerCase()}">
                  ${user.role}
                </span>
              </td>
              <td class="px-8 py-5 whitespace-nowrap font-mono text-sm">
                ${user.college_id ? `
                  <div class="flex items-center gap-2 text-gray-300 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700/50 w-fit">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    ${user.college_id}
                  </div>
                ` : `
                  <span class="text-gray-600 flex items-center gap-2 text-xs font-sans italic">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    Not Provided
                  </span>
                `}
              </td>
              <td class="px-8 py-5 whitespace-nowrap text-right text-gray-400 text-sm">
                <div class="flex flex-col items-end gap-1">
                  <span class="text-gray-300 font-medium">${new Date(user.login_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span class="text-xs text-gray-500">${new Date(user.login_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </td>
            </tr>
            `).join('') : `
            <tr>
              <td colspan="4" class="px-8 py-16 text-center">
                <div class="flex flex-col items-center justify-center space-y-4">
                  <div class="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center border border-gray-700">
                    <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                  </div>
                  <div class="space-y-1">
                    <p class="text-lg font-semibold text-gray-300">No users found</p>
                    <p class="text-sm text-gray-500">The database currently has no registered user logins.</p>
                  </div>
                </div>
              </td>
            </tr>
            `}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</body>
</html>
        `;
        res.send(html);
      } else {
        res.json({ users });
      }
    } catch (error: any) {
      console.error("Fetch users error:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
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
