//back end study group

const bcrypt = require('bcryptjs');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer'); // Free emailer
const bodyParser = require('body-parser');
const path = require('path');
const schedule = require('node-schedule'); // For notifcations
const cors = require('cors'); // For handling CORS issues should help connect back and front
const fetch = require('node-fetch');
const http = require('http');
require('dotenv').config();
const socketIo = require('socket.io'); // Socket.IO for real-time communication

const app = express();
const server = http.createServer(app); // Create HTTP server
const { Server } = require('socket.io');
const io = new Server(server);
const port = 3000;

app.use(express.json());
app.use(express.static('public')); 
app.use(cors());

// Use dotenv for other sensitive values
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

app.use(express.static('public'));
app.use(express.json());
app.use(cors()); // Allow requests from other origins
// Serve files for different pages change names when all files are created
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '/public/login.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, '/public/singup.html')));
app.get('/calendar', (req, res) => res.sendFile(path.join(__dirname, '/public/calendar.html')));
app.get('/chatroom', (req, res) => res.sendFile(path.join(__dirname, '/public/chatroom.html')));


// SQLite setup with file-based database
const db = new sqlite3.Database('./study_group.db', (err) => {
  if (err) {
    console.error('Failed to connect to the database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'mainpage.html'));
});

// Ensure tables exist
db.serialize(() => {
  // Users table for storing email and other data
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password TEXT NOT NULL
    )`,
    (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
      }
    }
  );

    // Signup Endpoint
    app.post('/add-user', async (req, res) => {
      console.log('Request received at /add-user:', req.body);
  
      const { email, name, password, repeat_password } = req.body;
  
      if (!email || !name || !password || !repeat_password) {
          console.error('Validation error: Missing fields');
          return res.status(400).json({ error: 'All fields are required!' });
      }
  
      if (password !== repeat_password) {
          console.error('Validation error: Passwords do not match');
          return res.status(400).json({ error: 'Passwords do not match!' });
      }
  
      try {
          const hashedPassword = await bcrypt.hash(password, 10);
          console.log('Password hashed successfully:', hashedPassword);
  
          db.run(
              'INSERT INTO users (email, name, password) VALUES (?, ?, ?)',
              [email, name, hashedPassword],
              (err) => {
                  if (err) {
                      console.error('Database error:', err.message); // Log database errors
                      if (err.code === 'SQLITE_CONSTRAINT') {
                          return res.status(409).json({ error: 'Email already exists!' });
                      }
                      return res.status(500).json({ error: 'Error saving user.' });
                  }
  
                  console.log('User saved successfully');
                  res.status(201).json({ user: { name } });
              }
          );
      } catch (error) {
          console.error('Unexpected error:', error.message); // Log unexpected errors
          res.status(500).json({ error: 'An unexpected error occurred.' });
      }
  });  
    
  app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        console.log('Missing email or password');
        return res.status(400).json({ error: 'Email and password are required!' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ error: 'Error querying database.' });
        }
        if (!row) {
            console.log(`Invalid email: ${email}`);
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        try {
            const passwordMatch = await bcrypt.compare(password, row.password);
            if (passwordMatch) {
                console.log(`Login successful for: ${email}`);
                res.status(200).json({ user: { id: row.id, name: row.name, email: row.email } });
            } else {
                console.log('Invalid password');
                return res.status(401).json({ error: 'Invalid email or password.' });
            }
        } catch (error) {
            console.error('Password comparison error:', error.message);
            res.status(500).json({ error: 'An unexpected error occurred.' });
        }
    });
});

    


  // Chat messages table linking to users by user_id
  db.run(
    `CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`,
    (err) => {
      if (err) {
        console.error('Error creating messages table:', err.message);
      }
    }
  );

  // Sessions table
  db.run(
    `CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    session_time TEXT NOT NULL,
    teacher_email TEXT NOT NULL
  )`,
    (err) => {
      if (err) {
        console.error('Error creating sessions table:', err.message);
      }
    }
  );
});

app.get('/events', (req, res) => {
  db.all('SELECT * FROM sessions', [], (err, rows) => {
      if (err) return res.status(500).send('Error fetching events.');
      
      const events = rows.map(row => ({
          title: `Session with ${row.teacher_email}`,
          session_time: row.session_time,  // Ensure this is in the correct ISO format
          email: row.email,
      }));
      
      res.json(events);
  });
});

app.post('/schedule-session', (req, res) => {
  const { session_time, teacher_email, room } = req.body;

  if (!session_time || !teacher_email || !room) {
      return res.status(400).send('All fields are required!');
  }

  db.run(
      'INSERT INTO sessions (session_time, teacher_email, room) VALUES (?, ?, ?)',
      [session_time, teacher_email, room],
      (err) => {
          if (err) {
              return res.status(500).send('Error saving session.');
          }
          res.status(200).send('Session scheduled successfully!');
      }
  );
});

app.post('/schedule-session', (req, res) => {
  const { session_time, room, email, description } = req.body;

  if (!session_time || !room || !email) {
      return res.status(400).send('All fields are required!');
  }

  db.run(
      'INSERT INTO sessions (session_time, room, email, description) VALUES (?, ?, ?, ?)',
      [session_time, room, email, description || ''],
      (err) => {
          if (err) {
              return res.status(500).send(err.message);
          }
          res.status(200).send('Session scheduled successfully!');
      }
  );
});

app.get('/notifications', (req, res) => {
  db.all('SELECT * FROM sessions', [], (err, rows) => {
      if (err) return res.status(500).send('Error fetching notifications.');

      const notifications = rows.map(row => ({
          date: row.session_time,
          room: row.room,
          email: row.email,
          description: row.description || 'No description provided'
      }));

      res.json(notifications);
  });
});




app.get('/events', (req, res) => {
  db.all('SELECT * FROM sessions', [], (err, rows) => {
      if (err) return res.status(500).send('Error fetching events.');
      const events = rows.map(row => ({
          title: `Session with ${row.teacher_email}`,
          session_time: row.session_time,
          room: row.room,
      }));
      res.json(events);
  });
});


// Fetch chat messages
app.get('/messages', (req, res) => {
  db.all('SELECT * FROM messages ORDER BY timestamp ASC', [], (err, rows) => {
    if (err) return res.status(500).send('Error fetching messages.');
    res.json(rows);
  });
});

// Save chat messages
app.post('/send-message', (req, res) => {
  const { user_id, content } = req.body;
  if (!user_id || !content) {
    return res.status(400).send('User ID and message content are required.');
  }

  db.run(
    'INSERT INTO messages (user_id, content) VALUES (?, ?)',
    [user_id, content],
    (err) => {
      if (err) {
        return res.status(500).send(err.message);
      }
      res.status(200).send('Message saved.');
    }
  );
});


// Spotify API token and public playlist ID
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID; 
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = 'http://localhost:3000/callback'; 
let SPOTIFY_API_TOKEN = 'BQB2hmibhpf2qoVnOg47DmbiNaAXht9jLKDqhgtm6Ogxkie7JLqsTHf_VEN10JxsgNDIsIW06nZ7WwddFH2Qof6L3R9ar8KNdZA6AzzVD3wrXQeQRYGNSp_e6szIDAptu8yoLKe-0n389eRiPqzM_P8-zodyEFfMYKkaLL5al9B3QT3DE0u4UfWIveEG3MtN4Aa2BADi8NlaRwzFvtSQyP7aIfC8LHUtImBWSygM9N2TJi6_6eiUsxHFYET1CYf6L4jyC_OLHupcd-FP3PmD4FWUP9a-2gukLsbF'; 
const PLAYLIST_ID = '5udVG2DPMqcoqqZKoVJjS4';

const querystring = require('querystring');


// Fetch tracks from the public playlist
app.get('/spotify-tracks', async (req, res) => {
  try {
    let allTracks = [];
    let offset = 0;
    const limit = 100; // Maximum number of tracks per request

    while (true) {
      // Fetch tracks with offset and limit
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks?limit=${limit}&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${SPOTIFY_API_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('Error from Spotify API:', error);
        throw new Error('Failed to fetch playlist tracks');
      }

      const data = await response.json();
      allTracks = allTracks.concat(data.items);

      // Check if there are more tracks to fetch
      if (data.items.length < limit) {
        break; // No more tracks available
      }

      offset += limit; // Move to the next set of tracks
    }

    // Format the data for your frontend
    const formattedTracks = allTracks.map((item) => ({
      name: item.track.name,
      artists: item.track.artists.map((artist) => artist.name).join(', '),
      albumArt: item.track.album.images[0].url,
      previewUrl: item.track.preview_url, // 30-second preview URL
    }));

    res.json(formattedTracks);
  } catch (error) {
    console.error('Error fetching Spotify tracks:', error);
    res.status(500).send('Error fetching Spotify tracks.');
  }
});

// Spotify Authentication Flow
app.get('/login', (req, res) => {
  const scopes = 'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state';
  const authQuery = querystring.stringify({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: scopes,
    redirect_uri: SPOTIFY_REDIRECT_URI,
  });
  res.redirect(`https://accounts.spotify.com/authorize?${authQuery}`);
});

// Spotify Callback to handle authorization code
app.get('/callback', async (req, res) => {
  const code = req.query.code || null;

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
      }),
    });

    if (!response.ok) throw new Error('Failed to obtain access token');

    const data = await response.json();
    SPOTIFY_API_TOKEN = data.access_token; // Update the global token
    res.redirect(`/homepage.html#access_token=${data.access_token}&refresh_token=${data.refresh_token}`);
  } catch (error) {
    console.error('Error during token exchange:', error.message);
    res.status(500).send('Authentication failed.');
  }
});

// Token Refresh Endpoint
app.get('/refresh_token', async (req, res) => {
  const refreshToken = req.query.refresh_token;

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) throw new Error('Failed to refresh access token');

    const data = await response.json();
    SPOTIFY_API_TOKEN = data.access_token; // Update the global token
    res.json({ access_token: data.access_token });
  } catch (error) {
    console.error('Error refreshing token:', error.message);
    res.status(500).send('Failed to refresh token.');
  }
});
  

// Schedule a session and send email reminders
app.post('/schedule-session', (req, res) => {
  const { email, session_time, teacher_email } = req.body;

  if (!email || !session_time || !teacher_email) {
    return res.status(400).send('Email, session time, and teacher email are required!');
  }

  db.run(
    'INSERT INTO sessions (email, session_time, teacher_email) VALUES (?, ?, ?)',
    [email, session_time, teacher_email],
    (err) => {
      if (err) {
        return res.status(500).send(err.message);
      }

      const sessionDate = new Date(session_time);
      const notificationDate = new Date(sessionDate.getTime() - 5 * 60000); // 5 minutes before

      // Schedule reminder notification
      schedule.scheduleJob(notificationDate, () => {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Study Reminder',
          text: `Your study session is starting in 5 minutes at ${session_time}.`,
        };

        transporter.sendMail(mailOptions, (err) => {
          if (err) {
            console.error('Failed to send reminder:', err.message);
          } else {
            console.log('Reminder sent.');
          }
        });
      });

      // Schedule email to teacher at session end
      schedule.scheduleJob(sessionDate, () => {
        db.all('SELECT content FROM messages', (err, rows) => {
          if (err) {
            console.error('Failed to fetch messages:', err.message);
            return;
          }

          const messageBody = rows.map((row) => row.content).join('\n');
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });

          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: teacher_email,
            subject: 'Study Group Session Summary',
            text: `The summary of the group chat:\n\n${messageBody}`,
          };

          transporter.sendMail(mailOptions, (err) => {
            if (err) {
              console.error('Failed to send summary to teacher:', err.message);
            } else {
              console.log('Summary sent to teacher.');
            }
          });
        });
      });

      res.status(200).send('Session scheduled and notifications set.');
    }
  );
});

io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // Handle joining rooms
  socket.on('join-room', (roomName) => {
    socket.join(roomName);
    console.log(`User joined room: ${roomName}`);
  });

  // Listen for chat messages and broadcast to specific rooms
  socket.on('chat-message', (data) => {
    const { room, content } = data;
    if (!room || !content) {
      console.error('Invalid chat-message data:', data);
      return;
    }

    io.to(room).emit('chat-message', {
      user_name: socket.id, // Replace with actual username if available
      content,
    });

    // Save the message to the database
    db.run(
      'INSERT INTO messages (user_id, content) VALUES ((SELECT id FROM users WHERE name = ?), ?)',
      [socket.id, content],
      (err) => {
        if (err) {
          console.error('Error saving message to DB:', err.message);
        }
      }
    );
  });

  // Handle whiteboard drawing and broadcast to specific rooms
  socket.on('draw', (data) => {
    const { room, ...drawData } = data;
    if (!room || !drawData) {
      console.error('Invalid draw data:', data);
      return;
    }

    io.to(room).emit('draw', drawData);
  });

  // Handle whiteboard clearing for specific rooms
  socket.on('clear-whiteboard', (roomName) => {
    if (!roomName) {
      console.error('Room name is missing for clear-whiteboard event.');
      return;
    }

    io.to(roomName).emit('clear-whiteboard');
    console.log(`Whiteboard cleared in room: ${roomName}`);
  });

  // Handle whiteboard drawing
  socket.on('draw', (drawData) => {
      if (
          !drawData ||
          typeof drawData.lastX !== 'number' ||
          typeof drawData.lastY !== 'number' ||
          typeof drawData.currentX !== 'number' ||
          typeof drawData.currentY !== 'number' ||
          typeof drawData.color !== 'string' ||
          typeof drawData.width !== 'number'
      ) {
          console.error('Invalid draw data:', drawData);
          return;
      }

      socket.broadcast.emit('draw', drawData);
      console.log(`Draw data broadcasted: ${JSON.stringify(drawData)}`);
  });

  // Handle whiteboard clear
  socket.on('clear-whiteboard', () => {
      io.emit('clear-whiteboard');
      console.log('Whiteboard cleared.');
  });

  // Disconnect event
  socket.on('disconnect', () => {
      console.log('A user disconnected.');
  });
});


server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
