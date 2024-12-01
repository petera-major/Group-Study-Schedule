io.on('connection', (socket) => {
  console.log('A user connected.');

  // Handle chat messages
  socket.on('chat-message', (data) => {
      // Validate incoming data
      if (!data.user_id || !data.content) {
          console.error('Invalid chat message data:', data);
          socket.emit('error', 'Invalid chat message data.');
          return;
      }

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
                  console.log(`Message saved and broadcasted: ${data.content}`);
              }
          }
      );
  });

  // Handle whiteboard drawing
  socket.on('draw', (drawData) => {
      // Validate drawData structure
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

      // Broadcast drawing to other clients
      socket.broadcast.emit('draw', drawData);
      console.log(`Draw data broadcasted: ${JSON.stringify(drawData)}`);
  });

  // Handle whiteboard clear
  socket.on('clear-whiteboard', () => {
      io.emit('clear-whiteboard'); // Broadcast clear event
      console.log('Whiteboard cleared.');
  });

  // Handle disconnections
  socket.on('disconnect', () => {
      console.log('A user disconnected.');
  });
});
