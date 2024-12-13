function loadPageContent(page) {
  const mainContent = document.getElementById("main-content");
  const homepageContent = document.getElementById("homepage-content");

  if (!mainContent || !homepageContent) {
    console.error("Required elements not found.");
    return;
  }

  if (page === "home") {
    homepageContent.style.display = "block";
    mainContent.style.display = "none";
  } else if (page === "notes") {
    homepageContent.style.display = "none";
    mainContent.style.display = "block";

    // Load the notes HTML file dynamically
    fetch("notes.html")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        return response.text();
      })
      .then((content) => {
        mainContent.innerHTML = content;

        // Initialize the notes functionality
        initializeNotes();
      })
      .catch((error) => {
        mainContent.innerHTML = `<p>Error loading content: ${error.message}</p>`;
        console.error("Error loading page:", error);
      });
  } else {
    homepageContent.style.display = "none";
    mainContent.style.display = "block";

    const pageFile = `${page}.html`;
    fetch(pageFile)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        return response.text();
      })
      .then((content) => {
        mainContent.innerHTML = content;

        if (page === "flashcards") {
          initFlashcards();
        }
      })
      .catch((error) => {
        mainContent.innerHTML = `<p>Error loading content: ${error.message}</p>`;
        console.error("Error loading page:", error);
      });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-menu a");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = link.getAttribute("href").substring(1);
      loadPageContent(page);
    });
  });

  const initialPage = window.location.hash.substring(1) || "home";
  loadPageContent(initialPage);
});

function initializeNotes() {
  console.log("Initializing notes...");
  const createBtn = document.querySelector(".button");
  const notesContainer = document.querySelector(".notes-container");

  if (!createBtn || !notesContainer) {
    console.error("Required elements not found in the DOM!");
    return;
  }

  createBtn.addEventListener("click", () => {
    const inputBox = document.createElement("p");
    inputBox.className = "input-box";
    inputBox.setAttribute("contenteditable", "true");

    const deleteImg = document.createElement("img");
    deleteImg.src = "images/delete.png";
    deleteImg.alt = "Delete Note";
    deleteImg.className = "delete-btn";

    inputBox.appendChild(deleteImg);
    notesContainer.appendChild(inputBox);

    updateStorage();
  });

  const updateStorage = () => {
    localStorage.setItem("notes", notesContainer.innerHTML);
  };

  const showNotes = () => {
    notesContainer.innerHTML = localStorage.getItem("notes") || "";
  };

  notesContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
      e.target.parentElement.remove();
      updateStorage();
    }
  });

  notesContainer.addEventListener("input", updateStorage);

  // Initialize notes
  showNotes();
}

// Study Tips Array and Function
const studyTips = [ 
  "Set specific goals for each study session.",
  "Take regular breaks using the Pomodoro Technique.",
  "Use active recall when reviewing material.",
  "Create and stick to a study schedule.",
  "Eliminate distractions by studying in a quiet space.",
  "Teach what you’ve learned to someone else.",
  "Use flashcards for memorization-based subjects.",
  "Review your notes regularly, not just before exams.",
  "Stay hydrated and eat healthy snacks while studying.",
  "Try studying in short, focused sessions rather than long marathons.",
  "Highlight key points and summarize them in your own words.",
  "Organize your study material in a way that makes sense to you.",
  "Practice past exam questions or quizzes.",
  "Incorporate visuals like diagrams, charts, and mind maps.",
  "Study at the same time every day to build a routine.",
  "Use apps or tools to manage your time effectively.",
  "Get a good night’s sleep before studying and exams.",
  "Break large topics into smaller, manageable chunks.",
  "Reward yourself after completing study goals.",
  "Join a study group to collaborate and share insights."
];

function getRandomStudyTip() {
  const randomIndex = Math.floor(Math.random() * studyTips.length);
  return studyTips[randomIndex];
}

// Ensure Compatibility with DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  // Get the random study tip element
  const studyTipElement = document.getElementById("random-study-tip");

  if (studyTipElement) {
    // Set a random study tip on page load
    studyTipElement.textContent = getRandomStudyTip();

    //Updates the study tip every ten minutes
    setInterval(() => {
      studyTipElement.textContent = getRandomStudyTip();
    }, 600000); // 600,000 milliseconds = 10 minutes
  } else {
    console.error("Study Tip element not found!");
  }

  // Log the initial study tip to the console
  console.log("Study Tip: " + getRandomStudyTip());
});

document.addEventListener('DOMContentLoaded', () => {
  const notificationsContainer = document.getElementById('notifications-container'); // Ensure this exists in your HTML

  // Fetch notifications from the server
  fetch('/notifications')
      .then(response => response.json())
      .then(notifications => {
          if (notifications.length === 0) {
              notificationsContainer.innerHTML = '<p>No notifications available.</p>';
              return;
          }

          // Render notifications
          notifications.forEach(notification => {
              const notificationElement = document.createElement('div');
              notificationElement.classList.add('notification');

              notificationElement.innerHTML = `
                  <p><strong>Date:</strong> ${new Date(notification.date).toLocaleString()}</p>
                  <p><strong>Room:</strong> ${notification.room}</p>
                  <p><strong>Email:</strong> ${notification.email}</p>
                  <p><strong>Description:</strong> ${notification.description}</p>
              `;

              notificationsContainer.appendChild(notificationElement);
          });
      })
      .catch(error => {
          console.error('Error fetching notifications:', error);
          notificationsContainer.innerHTML = '<p>Error loading notifications.</p>';
      });
});


// Timer functions
let timerInterval;
let elapsedTime = 0;

function updateTimerDisplay() {
  const timerElement = document.getElementById("timer");
  const hours = String(Math.floor(elapsedTime / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((elapsedTime % 3600) / 60)).padStart(2, '0');
  const seconds = String(elapsedTime % 60).padStart(2, '0');
  timerElement.textContent = `${hours}:${minutes}:${seconds}`;
}

function startTimer() {
  if (!timerInterval) {
    timerInterval = setInterval(() => {
      elapsedTime++;
      updateTimerDisplay();
    }, 1000);
  }
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  elapsedTime = 0;
  updateTimerDisplay(); // Reset to 00:00:00
}

document.addEventListener("DOMContentLoaded", () => {
  const logoutAvatar = document.getElementById("logout-avatar");
  const logoutModal = document.getElementById("logout-modal");
  const confirmLogout = document.getElementById("confirm-logout");
  const cancelLogout = document.getElementById("cancel-logout");

  // Show modal on avatar click
  logoutAvatar.addEventListener("click", () => {
    logoutModal.style.display = "flex";
  });

  // Handle logout confirmation
  confirmLogout.addEventListener("click", () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "mainpage.html";
  });

  // Cancel logout and close modal
  cancelLogout.addEventListener("click", () => {
    logoutModal.style.display = "none";
  });

  // Close modal if clicked outside content
  window.addEventListener("click", (e) => {
    if (e.target === logoutModal) {
      logoutModal.style.display = "none";
    }
  });
});


// To-do list functionality
document.addEventListener("DOMContentLoaded", () => {
  const todoForm = document.getElementById("todoForm");
  const todoInput = document.getElementById("todoInput");
  const todoList = document.getElementById("todoList");

  todoForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const task = todoInput.value.trim();
    if (task) {
      const listItem = document.createElement("li");
      listItem.textContent = task;

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.style.marginLeft = "10px";
      deleteBtn.addEventListener("click", () => listItem.remove());

      listItem.appendChild(deleteBtn);
      todoList.appendChild(listItem);
      todoInput.value = ""; // Clear input
    }
  });
});



// Initialization logic for Flashcards
function initFlashcards() {
  const addFlashcardButton = document.getElementById('add-flashcard'); // Button to add a new flashcard
  const flashcardForm = document.getElementById('add-question-card'); // Form for adding a flashcard
  const saveButton = document.getElementById('save-btn'); // Save button in the form
  const closeButton = document.getElementById('close-btn'); // Close button in the form
  const questionInput = document.getElementById('question'); // Input field for the question
  const answerInput = document.getElementById('answer'); // Input field for the answer
  const cardContainer = document.querySelector('.card-list-container'); // Container for flashcards
  const errorMessage = document.getElementById('error'); // Error message element

  // Ensure all required elements are present
  if (!addFlashcardButton || !flashcardForm || !saveButton || !closeButton || !questionInput || !answerInput || !cardContainer || !errorMessage) {
    console.error("Flashcards: Required elements are missing!");
    return;
  }

  // Show/hide the form when the add button is clicked
  addFlashcardButton.addEventListener("click", () => {
    flashcardForm.classList.toggle("hide");
  });

  // Hide the form and reset inputs when the close button is clicked
  closeButton.addEventListener("click", () => {
    flashcardForm.classList.add("hide");
    questionInput.value = "";
    answerInput.value = "";
    errorMessage.classList.add("hide");
  });

  // Save the flashcard and add it to the container
  saveButton.addEventListener("click", () => {
    const question = questionInput.value.trim();
    const answer = answerInput.value.trim();

    // Validate inputs
    if (!question || !answer) {
      errorMessage.classList.remove("hide");
      return;
    }

    createFlashcard(question, answer);
    flashcardForm.classList.add("hide");
    questionInput.value = "";
    answerInput.value = "";
  });

  // Function to create a new flashcard
  function createFlashcard(question, answer) {
    const card = document.createElement("div");
    card.classList.add("card");

    // Question section
    const questionDiv = document.createElement("div");
    questionDiv.classList.add("question-div");
    questionDiv.textContent = question;

    // Answer section (hidden by default)
    const answerDiv = document.createElement("div");
    answerDiv.classList.add("answer-div", "hide");
    answerDiv.textContent = answer;

    // Button to toggle answer visibility
    const toggleButton = document.createElement("button");
    toggleButton.classList.add("show-hide-btn");
    toggleButton.textContent = "Show Answer";
    toggleButton.addEventListener("click", () => {
      answerDiv.classList.toggle("hide");
      toggleButton.textContent = answerDiv.classList.contains("hide")
        ? "Show Answer"
        : "Hide Answer";
    });

    // Button to delete the flashcard
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-btn");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      card.remove();
    });

    // Append elements to the flashcard
    card.appendChild(questionDiv);
    card.appendChild(answerDiv);
    card.appendChild(toggleButton);
    card.appendChild(deleteButton);

    // Add the flashcard to the container
    cardContainer.appendChild(card);
  }
}

