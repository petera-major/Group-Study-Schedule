io.on('connection', (socket) => {
    console.log('A user connected.');
  
    // Handle chat messages
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
            io.emit('chat-message', data); // Broadcast to all users
          }
        }
      );
    });
  
    // Handle whiteboard drawing
    socket.on('draw', (drawData) => {
      socket.broadcast.emit('draw', drawData); // Send to all clients except sender
    });
  
    // Handle whiteboard clear
    socket.on('clear-whiteboard', () => {
      io.emit('clear-whiteboard'); // Broadcast clear event
    });
  
    // Handle disconnections
    socket.on('disconnect', () => {
      console.log('A user disconnected.');
    });
  });
  