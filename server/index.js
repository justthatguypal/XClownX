const express = require('express');
const cors = require('cors');
const path = require('path');
const { execFile, spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3001;

// yt-dlp path detection
const YTDLP = process.platform === 'win32' 
  ? path.join(process.env.APPDATA, 'Python', 'Python314', 'Scripts', 'yt-dlp.exe')
  : 'yt-dlp';

app.use(cors());
app.use(express.json());

const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const DB_FILE = path.join(__dirname, 'database.json');
const JWT_SECRET = 'xclown-super-secret-key';

// Initialize DB
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ users: [] }, null, 2));
}

const getDB = () => JSON.parse(fs.readFileSync(DB_FILE));
const saveDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });

  const db = getDB();
  if (db.users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username taken' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { 
    id: Date.now().toString(), 
    username, 
    password: hashedPassword, 
    isVerified: false,
    playlists: [] 
  };
  
  db.users.push(newUser);
  saveDB(db);

  const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET);
  res.json({ token, user: { id: newUser.id, username: newUser.username, isVerified: false, playlists: [] } });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const db = getDB();
  const user = db.users.find(u => u.username === username);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
  res.json({ token, user: { id: user.id, username: user.username, isVerified: user.isVerified, playlists: user.playlists || [] } });
});

// Playlist Routes
app.post('/api/playlists', authenticateToken, (req, res) => {
  const { name, tracks } = req.body;
  const db = getDB();
  const userIndex = db.users.findIndex(u => u.id === req.user.id);
  
  if (userIndex === -1) return res.sendStatus(404);
  
  if (!db.users[userIndex].playlists) {
    db.users[userIndex].playlists = [];
  }
  
  const newPlaylist = { id: Date.now().toString(), name, tracks: tracks || [] };
  db.users[userIndex].playlists.push(newPlaylist);
  saveDB(db);
  
  res.json(newPlaylist);
});

app.put('/api/playlists/:playlistId', authenticateToken, (req, res) => {
  const { playlistId } = req.params;
  const { tracks } = req.body;
  const db = getDB();
  const user = db.users.find(u => u.id === req.user.id);
  
  if (!user) return res.sendStatus(404);
  
  const playlist = user.playlists.find(p => p.id === playlistId);
  if (!playlist) return res.sendStatus(404);
  
  playlist.tracks = tracks;
  saveDB(db);
  
  res.json(playlist);
});

// Verification Route (Mock)
app.post('/api/verify/apply', authenticateToken, (req, res) => {
  // In a real app, this would save to a review queue. For now, auto-approve for testing or just return success
  const db = getDB();
  const userIndex = db.users.findIndex(u => u.id === req.user.id);
  
  if (userIndex === -1) return res.sendStatus(404);
  
  // db.users[userIndex].isVerified = true; // Auto verify for fun? Let's just say "Application submitted"
  // saveDB(db);
  
  res.json({ success: true, message: 'Application submitted successfully! Our team will review your profile.' });
});

// YouTube Search Endpoint - uses yt-dlp for reliable results
app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Query required' });

  console.log(`[XCLOWN] Searching: ${q}`);
  try {
    execFile(YTDLP, [
      `ytsearch20:${q}`,
      '--dump-json',
      '--flat-playlist',
      '--no-warnings',
      '--no-download',
    ], { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        console.error('[XCLOWN] Search error:', error.message);
        return res.status(500).json({ error: 'Search failed' });
      }

      try {
        // Each line is a separate JSON object
        const results = stdout.trim().split('\n')
          .filter(line => line.trim())
          .map(line => {
            const item = JSON.parse(line);
            return {
              id: item.id,
              title: item.title,
              uploaderName: item.channel || item.uploader || 'Unknown',
              thumbnail: item.thumbnails?.[item.thumbnails.length - 1]?.url || `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
              duration: item.duration_string || '',
              url: item.url || item.webpage_url
            };
          });

        console.log(`[XCLOWN] Found ${results.length} results`);
        res.json(results);
      } catch (parseError) {
        console.error('[XCLOWN] Parse error:', parseError.message);
        res.status(500).json({ error: 'Failed to parse results' });
      }
    });
  } catch (error) {
    console.error('[XCLOWN] Search error:', error.message);
    res.status(500).json({ error: 'Search failed' });
  }
});

// YouTube PFP Integration Endpoint
app.get('/api/artist/pfp', (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'Name required' });

  // Search for an official music video by this artist
  try {
    execFile(YTDLP, [
      `ytsearch1:${name} official music video`,
      '--dump-json',
      '--no-warnings'
    ], { maxBuffer: 1024 * 1024 * 10 }, (error, stdout) => {
      if (error) {
        return res.status(500).json({ error: 'Extraction failed' });
      }
      try {
        const data = JSON.parse(stdout.split('\n')[0]);
        // Return the highest quality thumbnail
        const thumbnail = data.thumbnail || (data.thumbnails && data.thumbnails.length > 0 ? data.thumbnails[data.thumbnails.length - 1].url : null);
        res.json({ url: thumbnail });
      } catch (e) {
        res.status(500).json({ error: 'Parse failed' });
      }
    });
  } catch (e) {
    res.status(500).json({ error: 'Request failed' });
  }
});

// YouTube Audio Proxy - uses yt-dlp to pipe audio directly to the browser
app.get('/api/audio/:id', (req, res) => {
  const { id } = req.params;
  console.log(`[XCLOWN] Streaming audio for: ${id}`);

  const ytdlp = spawn(YTDLP, [
    `https://www.youtube.com/watch?v=${id}`,
    '-f', 'bestaudio[ext=m4a]',
    '-o', '-',           // Output to stdout
    '--no-warnings',
    '--no-playlist',
  ]);

  res.setHeader('Content-Type', 'audio/mp4');
  res.setHeader('Transfer-Encoding', 'chunked');

  ytdlp.stdout.pipe(res);

  ytdlp.stderr.on('data', (data) => {
    const msg = data.toString();
    if (msg.includes('ERROR')) {
      console.error(`[XCLOWN] yt-dlp error: ${msg}`);
    }
  });

  ytdlp.on('error', (err) => {
    console.error(`[XCLOWN] Spawn error: ${err.message}`);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Playback failed' });
    }
  });

  ytdlp.on('close', (code) => {
    if (code !== 0) {
      console.error(`[XCLOWN] yt-dlp exited with code ${code}`);
    }
  });

  // If client disconnects, kill the yt-dlp process
  req.on('close', () => {
    ytdlp.kill();
  });
});

// Serve Frontend (after build)
app.use(express.static(path.join(__dirname, '../dist')));

// Catch-all to serve frontend
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[XCLOWN SERVER] Running at http://localhost:${PORT}`);
  console.log(`[XCLOWN SERVER] yt-dlp audio engine ready.`);
  console.log(`[XCLOWN SERVER] yt-dlp path: ${YTDLP}`);
});
