import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import cors from "cors";
import { readFile } from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// This server only hosts the test pages. The widget loader is NOT kept here — the
// pages load it from the frontend origin (vite dev server locally, the dashboard
// origin in production), exactly like the embed snippet the dashboard generates.
// A copy in this folder would go stale and silently test an old widget.
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

// Enable CORS for the widget script
app.use(cors());

// Serve static files
app.use(express.static(__dirname));

// ui-test.html's stub mode: the loader frames {baseUrl}/widgets/{id}/frame, and
// this answers that with a fake widget that plays the real handshake.
app.get("/stub/api/v1/widgets/:id/frame", (req, res) => {
  res.sendFile(join(__dirname, "stub-frame.html"));
});

// --- Ledgerly journeys demo (journeys-demo.html) ----------------------------
// journeys-demo/seed.mjs writes the widget and widget-app key it set up. This
// server plays Ledgerly's own backend: it signs a demo user in by asking
// ChatterMate for an identity token, as a real app's server would.
const DEMO_STATE = join(__dirname, "journeys-demo", ".env.local");
const DEMO_USERS = {
  maya: { name: "Maya Patel", email: "maya@ledgerly.example", custom_data: { plan: "free", role: "owner" } },
  leo: { name: "Leo Brooks", email: "leo@ledgerly.example", custom_data: { plan: "pro", role: "owner" } },
};

async function demoState() {
  try {
    return JSON.parse(await readFile(DEMO_STATE, "utf8"));
  } catch {
    return null;
  }
}

app.get("/demo/config", async (req, res) => {
  const state = await demoState();
  if (!state) return res.status(404).json({ error: "Run journeys-demo/seed.mjs first" });
  res.json({ apiUrl: state.apiUrl, widgetId: state.widgetId, loaderUrl: `${FRONTEND_ORIGIN}/webclient/chattermate.min.js` });
});

app.post("/demo/token/:user", async (req, res) => {
  const state = await demoState();
  const user = DEMO_USERS[req.params.user];
  if (!state || !user) return res.status(404).json({ error: "Unknown demo user" });
  // ?n= makes a new account for the same person, so journeys start over.
  const n = Number(req.query.n) || 0;
  const email = n ? user.email.replace("@", `+${n}@`) : user.email;
  const response = await fetch(`${state.apiUrl}/generate-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${state.apiKey}` },
    body: JSON.stringify({
      widget_id: state.widgetId,
      customer_email: email,
      customer_name: user.name,
      custom_data: { ...user.custom_data, signed_up_at: new Date().toISOString().slice(0, 10) },
    }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) return res.status(502).json({ error: body.detail || `generate-token said ${response.status}` });
  res.json({ token: body.data.token, user: { name: user.name, ...user.custom_data } });
});

// The demo is a single-page app: every /app/* path is the same page.
app.get("/app/{*path}", (req, res) => {
  res.sendFile(join(__dirname, "journeys-demo.html"));
});

// Serve index.html
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

app.listen(port, () => {
  console.log(`Test server running at http://localhost:${port}`);
  console.log(`UI options gallery:   http://localhost:${port}/ui-options.html`);
  console.log(`Journeys demo:        http://localhost:${port}/app/dashboard (seed it first: journeys-demo/seed.mjs)`);
  console.log(`Widget loader from:   ${FRONTEND_ORIGIN}/webclient/chattermate.min.js`);
  console.log(`(rebuild it after loader changes: cd ../frontend && npm run build:webclient:prod)`);
});
