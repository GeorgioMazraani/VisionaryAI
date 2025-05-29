/* Basic Packages */
const express = require("express");
const cors    = require("cors");
const dotenv  = require("dotenv");
const events  = require("events");

/* DB & Models */
const sequelize = require("./Config/DBConfig");   // Sequelize instance
const User      = require("./Models/User");       // Your ONLY model for now


dotenv.config();

/* Prevent EventEmitter memory-leak warnings */
events.EventEmitter.defaultMaxListeners = 20;

/* ──────────────────────────────────────────────────────────
   Express App Setup
   ────────────────────────────────────────────────────────── */
const app  = express();
const PORT = process.env.PORT || 5000;

/* Middleware */
app.use(cors({ origin: "*" }));
app.use(express.json());               // Parses JSON bodies

/* Health Check */
app.get("/", (_req, res) =>
  res.status(200).json({ message: "API is running!" })
);

/* ──────────────────────────────────────────────────────────
   Routes
   ────────────────────────────────────────────────────────── */
const userRoutes = require("./Routes/userRoutes");
app.use("/api/users", userRoutes);

/* ──────────────────────────────────────────────────────────
   404 & Error Handlers
   ────────────────────────────────────────────────────────── */
app.use((_req, res) => {                       // 404
  res.status(404).json({ message: "Route not found" });
});

app.use((err, _req, res, _next) => {           // 500
  console.error("Server Error:", err);
  res.status(500).json({ message: "Something went wrong!" });
});

/* ──────────────────────────────────────────────────────────
   DB Sync & Server Start
   ────────────────────────────────────────────────────────── */
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established");

    await sequelize.sync();          
    console.log("Models synced");


    app.listen(PORT, () =>
      console.log(`Server listening at http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("Unable to start server:", err);
    process.exit(1);
  }
})();
