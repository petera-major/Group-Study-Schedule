document.addEventListener('DOMContentLoaded', () => {
    // Whiteboard canvas setup
    const canvas = document.getElementById('whiteboardCanvas');
    const ctx = canvas.getContext('2d');
    let drawing = false;
    let currentTool = 'pen'; // Default tool
  
    // Set canvas size to match the container
    canvas.width = window.innerWidth * 0.75; // 75% width
    canvas.height = window.innerHeight;
  
    // Mouse events for drawing
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
  
    // Start drawing
    function startDrawing(e) {
      if (currentTool === 'pen') {
        drawing = true;
        ctx.beginPath();
        ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
      }
    }
  
    // Draw on canvas
    function draw(e) {
      if (drawing && currentTool === 'pen') {
        ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        ctx.stroke();
      }
    }
  
    // Stop drawing
    function stopDrawing() {
      if (drawing) {
        drawing = false;
        ctx.closePath();
      }
    }
  
    // Tool selection
    document.getElementById('pen').addEventListener('click', () => {
      currentTool = 'pen';
      console.log('Pen tool selected');
    });
  
    document.getElementById('shapes').addEventListener('click', () => {
      currentTool = 'shapes';
      console.log('Shapes tool selected');
    });
  
    // Chat functionality
    const messageInput = document.getElementById('messageInput');
    const sendMessageButton = document.getElementById('sendMessage');
    const messagesContainer = document.getElementById('messages');
  
    // Handle sending a chat message
    sendMessageButton.addEventListener('click', () => {
      const message = messageInput.value;
      if (message.trim()) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.textContent = message;
        messagesContainer.appendChild(messageElement);
        messageInput.value = ''; // Clear the input
        messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to the bottom
      }
    });
  });
  