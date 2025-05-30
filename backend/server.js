/* ─────────── Core Packages ─────────── */
const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');
const events  = require('events');
const path    = require('path');

/* ─────────── DB (models + associations) ─────────── */
const { sequelize } = require('./Models/index');   // auto-loads associations

dotenv.config();
events.EventEmitter.defaultMaxListeners = 20;

/* ─────────── Express Setup ─────────── */
const app  = express();
const PORT = process.env.PORT || 5000;

/* Middleware */
app.use(cors({ origin: '*' }));
app.use(express.json());

/* Serve uploaded files */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* Health Check */
app.get('/', (_req, res) => res.status(200).json({ message: 'API is running!' }));

/* ─────────── Route Modules ─────────── */
app.use('/api/users',          require('./Routes/userRoutes'));
app.use('/api/conversations',  require('./Routes/conversationRoutes'));
app.use('/api/messages',       require('./Routes/messageRoutes'));
app.use('/api/audio-logs',     require('./Routes/audioLogRoutes'));
app.use('/api/image-captures', require('./Routes/imageCaptureRoutes'));
app.use('/api/detections',     require('./Routes/detectionRoutes'));
app.use('/api/ai-requests',    require('./Routes/aiRequestRoutes'));

/* ─────────── 404 & Error Handling ─────────── */
app.use((_req, res) =>
  res.status(404).json({ message: 'Route not found' })
);

app.use((err, _req, res, _next) => {
  console.error('Server Error:', err);
  res.status(500).json({ message: err.message || 'Something went wrong!' });
});

/* ─────────── DB Sync & Server Start ─────────── */
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    await sequelize.sync();  // or { alter:true } in dev
    console.log('✓ Models synced');

    app.listen(PORT, () =>
      console.log(`Server listening at http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error('Unable to start server:', err);
    process.exit(1);
  }
})();
