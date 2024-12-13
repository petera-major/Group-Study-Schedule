document.addEventListener('DOMContentLoaded', () => {
    const calendarContainer = document.getElementById('calendar-container');
    let currentMonth = new Date();

    const renderCalendar = () => {
        calendarContainer.innerHTML = `
            <div class="calendar-nav">
                <button id="prevMonth">Previous</button>
                <h2>${currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                <button id="nextMonth">Next</button>
            </div>
            <div id="calendar" class="calendar-grid"></div>
        `;

        const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
        const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

        const calendarGrid = document.getElementById('calendar');

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('empty-cell');
            calendarGrid.appendChild(emptyCell);
        }

        // Add day cells for each day in the current month
        for (let i = 1; i <= lastDay; i++) {
            const dayCell = document.createElement('div');
            const meetingKey = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i).toDateString();
            dayCell.classList.add('day-cell');
            dayCell.setAttribute('data-date', meetingKey);
            dayCell.textContent = i;
        
            const meetings = JSON.parse(localStorage.getItem('meetings')) || {};
            if (meetings[meetingKey]) {
                const { room, time } = meetings[meetingKey];
                dayCell.innerHTML = `
                    ${i}
                    <div class="meeting-info">
                        <p>${room} at ${time}</p>
                        <button class="joinMeetingButton" data-room="${room}">Join Meeting</button>
                        <button class="deleteMeetingButton" data-date="${meetingKey}">X</button>
                    </div>
                `;
            } else {
                dayCell.addEventListener('click', () => openScheduleModal(i));
            }
        
            calendarGrid.appendChild(dayCell);
        }        

        document.getElementById('prevMonth').addEventListener('click', () => {
            currentMonth.setMonth(currentMonth.getMonth() - 1);
            renderCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            currentMonth.setMonth(currentMonth.getMonth() + 1);
            renderCalendar();
        });
    };

    const openScheduleModal = (day) => {
        const uniqueId = `modal-${day}-${Date.now()}`;
        const scheduleModalId = `${uniqueId}-scheduleModal`;
        const emailInputId = `${uniqueId}-email`;
        const roomSelectId = `${uniqueId}-room`;
        const timeInputId = `${uniqueId}-time`;
        const scheduleButtonId = `${uniqueId}-scheduleMeetingButton`;
        const closeModalId = `${uniqueId}-closeModal`;
    
        console.log(`Created modal with ID: ${scheduleModalId}`);
        console.log(`Email input ID: ${emailInputId}`);
        console.log(`Room select ID: ${roomSelectId}`);
        console.log(`Time input ID: ${timeInputId}`);
    
        const existingModal = document.getElementById(scheduleModalId);
        if (existingModal) {
            existingModal.remove();
        }
    
        const scheduleModal = document.createElement('div');
        scheduleModal.id = scheduleModalId;
        scheduleModal.className = 'modal';
    
        const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
        scheduleModal.innerHTML = `
            <div class="modal-content">
                <h3>Schedule a Session</h3>
                <p>Selected Date: ${selectedDate.toDateString()}</p>
                <label for="${emailInputId}">Enter Email:</label>
                <input type="email" id="${emailInputId}" placeholder="Enter your email" required>
                <label for="${roomSelectId}">Select Room:</label>
                <select id="${roomSelectId}">
                    <option value="General">General</option>
                    <option value="Room A">Room A</option>
                    <option value="Room B">Room B</option>
                    <option value="Room C">Room C</option>
                </select>
                <label for="${timeInputId}">Select Time:</label>
                <input type="time" id="${timeInputId}" required>
                <button id="${scheduleButtonId}">Schedule Session</button>
                <button id="${closeModalId}">Cancel</button>
            </div>
        `;
    
        document.body.appendChild(scheduleModal);
    
        document.getElementById(closeModalId).addEventListener('click', () => {
            scheduleModal.remove();
        });
    
        document.getElementById(scheduleButtonId).addEventListener('click', () => {
            const email = document.getElementById(emailInputId).value;
            const room = document.getElementById(roomSelectId).value;
            const time = document.getElementById(timeInputId).value;
    
            if (!email || !room || !time) {
                alert('Please fill in all fields!');
                return;
            }
    
            const meetings = JSON.parse(localStorage.getItem('meetings')) || {};
            const meetingKey = `${selectedDate.toDateString()} ${time}`;
            meetings[meetingKey] = { email, room, time };
            localStorage.setItem('meetings', JSON.stringify(meetings));
    
            const dayCell = document.querySelector(`.day-cell[data-date="${selectedDate.toDateString()}"]`);
            if (dayCell) {
                dayCell.innerHTML = `
                    ${day}
                    <button class="joinMeetingButton" data-room="${room}" data-time="${time}">Join</button>
                `;
            }
    
            scheduleModal.remove();
        });
    };

        // Event listener for Join Meeting buttons
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('joinMeetingButton')) {
                const room = event.target.getAttribute('data-room');
        
                // Load chatroom dynamically
                loadChatroom(room);
            }
        });
        
        function loadChatroom(room) {
            // Clear the current content (if any)
            const mainContent = document.getElementById('main-content');
            mainContent.innerHTML = ''; // Ensure this matches your container for dynamic content
        
            // Inject chatroom content
            mainContent.innerHTML = `
                <div class="chatroom">
                    <h2>Chatroom: ${room}</h2>
                    <div id="messages" class="messages"></div>
                    <input id="messageInput" type="text" placeholder="Type your message...">
                    <button id="sendMessageButton">Send</button>
                </div>
            `;
        
            // Initialize chatroom functionality
            
            console.log(`Redirecting to room: ${room}`);

            initializeChatroom(room);
        }
        
        function initializeChatroom(room) {
            const socket = io();
            socket.emit('join-room', room);
        
            const messages = document.getElementById('messages');
            const messageInput = document.getElementById('messageInput');
            const sendMessageButton = document.getElementById('sendMessageButton');
        
            sendMessageButton.addEventListener('click', () => {
                const message = messageInput.value.trim();
                if (message) {
                    socket.emit('chat-message', { room, content: message });
                    messageInput.value = '';
                }
            });
        
            socket.on('chat-message', (data) => {
                const messageElement = document.createElement('div');
                messageElement.textContent = `${data.user_name}: ${data.content}`;
                messages.appendChild(messageElement);
            });
        
         document.addEventListener('click', (event) => {
                if (event.target.classList.contains('deleteMeetingButton')) {
                    const meetingDate = event.target.getAttribute('data-date');
            
                    // Confirm deletion
                    if (confirm(`Are you sure you want to delete the meeting on ${meetingDate}?`)) {
                        // Remove from localStorage
                        const meetings = JSON.parse(localStorage.getItem('meetings')) || {};
                        delete meetings[meetingDate];
                        localStorage.setItem('meetings', JSON.stringify(meetings));
            
                        // Re-render the calendar
                        renderCalendar();
                    }
                }
            });

            document.getElementById('scheduleMeetingButton').addEventListener('click', () => {
                const email = document.getElementById('email').value;
                const room = document.getElementById('room').value;
                const sessionTime = document.getElementById('sessionTime').value; // Ensure this input exists in your modal
                const description = document.getElementById('description').value || '';
            
                if (!email || !room || !sessionTime) {
                    alert('All fields are required!');
                    return;
                }
            
                // Send session data to the server
                fetch('/schedule-session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, room, session_time: sessionTime, description }),
                })
                    .then(response => {
                        if (response.ok) {
                            alert('Session scheduled successfully!');
                            location.reload(); // Reload to refresh notifications
                        } else {
                            return response.text().then(text => { throw new Error(text); });
                        }
                    })
                    .catch(error => {
                        console.error('Error scheduling session:', error);
                        alert('Failed to schedule session.');
                    });
            });

            document.getElementById('scheduleMeetingButton').addEventListener('click', () => {
                const email = document.getElementById('email').value;
                const room = document.getElementById('room').value;
                const sessionTime = document.getElementById('sessionTime').value; // Ensure this input exists in your modal
                const description = document.getElementById('description').value || '';
            
                if (!email || !room || !sessionTime) {
                    alert('All fields are required!');
                    return;
                }
            
                // Send session data to the server
                fetch('/schedule-session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, room, session_time: sessionTime, description }),
                })
                    .then(response => {
                        if (response.ok) {
                            alert('Session scheduled successfully!');
                            location.reload(); // Reload to refresh notifications
                        } else {
                            return response.text().then(text => { throw new Error(text); });
                        }
                    })
                    .catch(error => {
                        console.error('Error scheduling session:', error);
                        alert('Failed to schedule session.');
                    });
            });
            
            
            
        }
        
    renderCalendar();
});
