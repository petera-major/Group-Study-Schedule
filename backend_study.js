//back end study group
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer'); // Free emailer
const bodyParser = require('body-parser');
const path = require('path');
const schedule = require('node-schedule'); // For notifcations
const cors = require('cors'); // For handling CORS issues should help connect back and front
const fetch = require('node-fetch');
const socketIo = require('socket.io');
const http = require('http');
require('dotenv').config(); // For the .env file

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = 3000;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors()); // Allow requests from other origins
// Serve files for different pages change names when all files are created
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '/public/login.html')));
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

// Ensure tables exist
db.serialize(() => {
  // Users table for storing email and other data
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT
    )`,
    (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
      }
    }
  );

  // Login endpoint
app.post('/login', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send('Email is required.');
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
    if (err) return res.status(500).send('Error querying database.');
    if (row) return res.status(200).json({ message: 'Login successful', user: row });
    res.status(401).send('Invalid email.');
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

// Fetch scheduled sessions
app.get('/events', (req, res) => {
  db.all('SELECT * FROM sessions', [], (err, rows) => {
    if (err) return res.status(500).send('Error fetching events.');
    res.json(rows);
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

// May remove based on the login screen 
// Register a new user
app.post('/add-user', (req, res) => {
  const { email, name } = req.body;
  if (!email) {
    return res.status(400).send('Email is required!');
  }

  db.run(
    'INSERT INTO users (email, name) VALUES (?, ?)',
    [email, name || null],
    (err) => {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          return res.status(409).send('Email already exists!');
        }
        return res.status(500).send(err.message);
      }
      res.status(200).send('User added.');
    }
  );
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

// Real-time chat integration using Socket.IO
io.on('connection', (socket) => {
  console.log('A user connected.');

  // Listen for incoming messages
  socket.on('chat-message', (data) => {
    // Save message to the database
    db.run(
      'INSERT INTO messages (user_id, content) VALUES (?, ?)',
      [data.user_id, data.content],
      (err) => {
        if (err) {
          console.error('Error saving message to DB:', err);
          socket.emit('error', 'Failed to save message.');
        } else {
          // Broadcast the message to all connected clients
          io.emit('chat-message', data);
        }
      }
    );
  });

  // Disconnect event
  socket.on('disconnect', () => {
    console.log('A user disconnected.');
  });
});

// Spotify API
// Authorization token that must have been created previously. See : https://developer.spotify.com/documentation/web-api/concepts/authorization
const token = 'BQBAtMMfgrGqpDOYoewqKH5yxFn4xKHyZqSKWbPmXYzwCvfax43wpOzZwZY4BBGScezzpk8XHfSlFyMnxZFs4pU7s4YayzZshpY9EH3ePXI_RyfYsr8MGgriPRhsbMGWbthhH_JS-j_ZJD5bhHtuC6YjTRVqLcJDE3oDBtO4xSU2cFu9AesWL7oF61Q_TGmpooJw2yyyVq1r-Nav7kbaXtUsiyrWRBoWzB2dYpXO4Zmy7RRcKQEmBJzdYAPt85RJKxuKwhhyG4kuEv0xEUstA6GTO4_u6erU';
async function fetchWebApi(endpoint, method, body) {
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method,
    body:JSON.stringify(body)
  });
  return await res.json();
}

async function getTopTracks(){
  // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
  return (await fetchWebApi(
    'v1/me/top/tracks?time_range=long_term&limit=5', 'GET'
  )).items;
}

const topTracks = await getTopTracks();
console.log(
  topTracks?.map(
    ({name, artists}) =>
      `${name} by ${artists.map(artist => artist.name).join(', ')}`
  )
);
//end of Spotify API

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
