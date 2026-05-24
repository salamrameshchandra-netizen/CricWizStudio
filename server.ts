import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily to prevent crash on startup if key is missing
let aiClient: any = null;
function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY not configured. AI scouting insights will run in simulation mode.");
      return null;
    }
    try {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    } catch (e) {
      console.error("Failed to initialize GoogleGenAI client:", e);
      return null;
    }
  }
  return aiClient;
}

// REST api route
app.post("/api/scouting-insight", async (req, res) => {
  try {
    const { player } = req.body;
    if (!player) {
      return res.status(400).json({ error: "Missing player data" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      const fallback = generateMockScoutingInsight(player);
      return res.json({ result: fallback, source: "simulation" });
    }

    const { name, role, style, matches, type } = player;
    
    let playerStatsSummary = "";
    if (type === "batsman") {
      const totRuns = matches.reduce((acc: number, m: any) => acc + (Number(m.runs) || 0), 0);
      const totBalls = matches.reduce((acc: number, m: any) => acc + (Number(m.balls) || 0), 0);
      const totOuts = matches.filter((m: any) => m.dismissed === true || m.dismissed === "yes" || m.dismissed === "Out" || m.dismissed === true).length;
      const avg = totOuts > 0 ? (totRuns / totOuts).toFixed(2) : totRuns.toFixed(2);
      const sr = totBalls > 0 ? ((totRuns / totBalls) * 100).toFixed(2) : "0.00";
      
      playerStatsSummary = `
- Player Name: ${name}
- Type: Batsman
- Batting Style: ${style || 'Right Hand'}
- Matches played: ${matches.length}
- Total Runs: ${totRuns}
- Total Balls Faced: ${totBalls}
- Batting Average: ${avg}
- Batting Strike Rate: ${sr}
- Last Innings Run Logs: ${matches.slice(-5).map((m: any) => `${m.runs} runs off ${m.balls || m.runs} balls vs ${m.opponent || 'Unknown'}`).join(", ")}
      `;
    } else {
      const totOvers = matches.reduce((acc: number, m: any) => acc + (Number(m.overs) || 0), 0);
      const totRuns = matches.reduce((acc: number, m: any) => acc + (Number(m.runsConceded) || Number(m.runs) || 0), 0);
      const totWickets = matches.reduce((acc: number, m: any) => acc + (Number(m.wickets) || 0), 0);
      const rpo = totOvers > 0 ? (totRuns / totOvers).toFixed(2) : "0.00";
      const bowAvg = totWickets > 0 ? (totRuns / totWickets).toFixed(2) : "N/A";
      
      playerStatsSummary = `
- Player Name: ${name}
- Type: Bowler
- Bowling Style: ${style || 'Right Arm Fast'}
- Matches bowled: ${matches.length}
- Total Overs Bowled: ${totOvers}
- Total Runs Conceded: ${totRuns}
- Total Wickets Taken: ${totWickets}
- Bowling Economy Rate: ${rpo}
- Bowling Average: ${bowAvg}
- Last Innings Wicket Logs: ${matches.slice(-5).map((m: any) => `${m.wickets} wickets for ${Number(m.runsConceded) || Number(m.runs) || 0} runs in ${m.overs} overs vs ${m.opponent || 'Unknown'}`).join(", ")}
      `;
    }

    const prompt = `You are an expert elite cricket analyst and coach.
Conduct a concise, sharp, professional tactical scout report of the player based on the following stats:
${playerStatsSummary}

Return your assessment strictly in the following JSON format:
{
  "strengths": ["string of strength 1", "string of strength 2", "string of strength 3"],
  "weaknesses": ["string of weakness 1", "string of weakness 2", "string of weakness 3"],
  "coachAdvice": "1-2 sentences of specific technical/tactical coaching adjustments to improve their game.",
  "radarAnalysis": "Quick phrase capturing playing style e.g., Aggressive Outfield Dominator, Tight-Line Containment Specialist",
  "summary": "Elegant 15-word final scouting verdict."
}
Return only the raw JSON. No markdown backticks (e.g., do NOT wrap in \`\`\`json), no custom formatting. Just parseable JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const textOutput = response.text || "{}";
    try {
      const cleanJson = textOutput.trim().replace(/^```json/i, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(cleanJson);
      return res.json({ result: parsed, source: "gemini" });
    } catch (err) {
      console.error("Failed to parse Gemini JSON output. Raw output was:", textOutput);
      return res.json({ result: generateMockScoutingInsight(player), source: "fallback-json-error" });
    }
  } catch (error: any) {
    console.error("Gemini Error:", error);
    // If it fails, give the elegant simulation fallback so the user always has insight
    return res.json({ result: generateMockScoutingInsight(req.body.player || {}), source: "simulation-fallback-error" });
  }
});

function generateMockScoutingInsight(player: any) {
  const isBat = player.type === "batsman";
  const name = player.name || "Cricketer";
  
  if (isBat) {
    const runs = player.matches ? player.matches.reduce((acc: number, m: any) => acc + (Number(m.runs) || 0), 0) : 100;
    const balls = player.matches ? player.matches.reduce((acc: number, m: any) => acc + (Number(m.balls) || 0), 0) : 80;
    const sr = balls > 0 ? (runs / balls) * 100 : 120;
    const isAggressive = sr > 125;

    return {
      strengths: isAggressive 
        ? ["Exceptional fast-scoring acceleration in batting powerplays", "High strike reliance and boundary scoring", "Magnificent clean strike rates in V-regions"]
        : ["Sublime defensive positioning and anchoring capacity", "Superb rotation of strike against middle-overs spin", "Patient placement and shot selection"],
      weaknesses: isAggressive
        ? ["Can commit too early to the pull shot on bouncy surfaces", "Aggressive lines leave a gap between bat and pad with late swing", "Struggles when spinner slides ball across"]
        : ["Often finds fielders under fast pacing scenarios", "Limited capability in clearing boundary sizes in death overs", "Slight delays in foot speed against spinners"],
      coachAdvice: isAggressive
        ? `Ensure ${name} settles during the initial 8-12 balls before attempting deep launches. Keep head stable during off-stump back-foot punches.`
        : `Expand the power-clearing stance with deep crease usage. Work heavily on cross-batted sweep variations to increase strike pacing.`,
      radarAnalysis: isAggressive ? "Aggressive Outfield Dominator" : "Resolute Anchor Specialist",
      summary: `A high-potential batsman capable of delivering strong strategic momentum under crucial matches.`
    };
  } else {
    const wickets = player.matches ? player.matches.reduce((acc: number, m: any) => acc + (Number(m.wickets) || 0), 0) : 5;
    const runs = player.matches ? player.matches.reduce((acc: number, m: any) => acc + (Number(m.runsConceded) || Number(m.runs) || 0), 0) : 150;
    const overs = player.matches ? player.matches.reduce((acc: number, m: any) => acc + (Number(m.overs) || 0), 1) : 12;
    const econ = overs > 0 ? (runs / overs) : 7.2;
    const isContaining = econ < 6.8;

    return {
      strengths: isContaining
        ? ["Impeccable control of tight channels outside off-stump", "Induces high dots pressure on aggressive batsmen", "Precision slower-cutter variations"]
        : ["Lethal seam movement fetching early breakthroughs", "Highly accurate yorker release under death overs", "Fierce short-pitched bounces extracting errors"],
      weaknesses: isContaining
        ? ["Limited batsman challenge on extremely flat batting roadways", "Struggles to get key middle-order wickets under steady anchors", "Highly reliant on a disciplined field setting"]
        : ["Slightly high run-leakage rates when length runs short", "Prone to occasional frontfoot overstepping under pressure", "Line consistency slips when batsmen charge down-pitch"],
      coachAdvice: isContaining
        ? `Work with bowl release to add 3-5 km/h extra pace. Develop a sharp out-swing grip to diversify stump challenges.`
        : `Focus on maintaining high-accuracy good length targets. Incorporate a smoother follow-through to arrest leg-side drift.`,
      radarAnalysis: isContaining ? "Tight-Line Containment Specialist" : "Hard-hitting Seam Wicket Striker",
      summary: `A reliable bowling profile maintaining immense statistical pressure across crucial game phases.`
    };
  }
}

// Serve Client
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting on port ${PORT}`);
  });
}

startServer();
