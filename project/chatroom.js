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
                const { room } = meetings[meetingKey];
                dayCell.innerHTML = `
                    ${i}
                    <button class="joinMeetingButton" data-room="${room}">Join Meeting</button>
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

        const existingModal = document.getElementById(scheduleModalId);
        if (existingModal) existingModal.remove();

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
                <label for="${timeInputId}">Enter Time:</label>
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
            const meetingKey = selectedDate.toDateString();
            meetings[meetingKey] = { email, room, time };
            localStorage.setItem('meetings', JSON.stringify(meetings));

            const dayCell = document.querySelector(`.day-cell[data-date="${meetingKey}"]`);
            if (dayCell) {
                dayCell.innerHTML = `
                    ${day}
                    <button class="joinMeetingButton" data-room="${room}">Join Meeting</button>
                `;
            }

            scheduleModal.remove();
        });
    };

    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('joinMeetingButton')) {
            const room = event.target.getAttribute('data-room');
            if (room) {
                console.log(`Redirecting to room: ${room}`);
                window.location.href = `/chatroom.html?room=${encodeURIComponent(room)}`;
            }
        }
    });

    renderCalendar();
});
