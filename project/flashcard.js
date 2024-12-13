// DOM Elements
const addFlashcardButton = document.getElementById('add-flashcard');
const flashcardForm = document.getElementById('add-question-card');
const saveButton = document.getElementById('save-btn');
const closeButton = document.getElementById('close-btn');
const questionInput = document.getElementById('question');
const answerInput = document.getElementById('answer');
const cardContainer = document.querySelector('.card-list-container');
const errorMessage = document.getElementById('error');

// Function to toggle the flashcard form visibility
function toggleFlashcardForm() {
  flashcardForm.classList.toggle('hide');
  questionInput.value = '';
  answerInput.value = '';
  errorMessage.classList.add('hide');
}

// Function to save flashcards to localStorage
function saveFlashcards() {
  const flashcards = Array.from(document.querySelectorAll('.card')).map(card => ({
    question: card.querySelector('.question-div').textContent,
    answer: card.querySelector('.answer-div').textContent,
  }));
  localStorage.setItem('flashcards', JSON.stringify(flashcards));
}

function loadFlashcards() {
  const savedFlashcards = JSON.parse(localStorage.getItem('flashcards')) || [];
  if (savedFlashcards.length === 0) {
      cardContainer.innerHTML = '<p>No flashcards available. Add one to get started!</p>';
  } else {
      savedFlashcards.forEach(({ question, answer }) => createFlashcard(question, answer));
  }
}

// Function to create a new flashcard
function createFlashcard(question, answer) {
  const card = document.createElement('div');
  card.classList.add('card');

  // Create the question div
  const questionDiv = document.createElement('div');
  questionDiv.classList.add('question-div');
  questionDiv.textContent = question;

  // Create the answer div
  const answerDiv = document.createElement('div');
  answerDiv.classList.add('answer-div', 'hide'); // Hide by default
  answerDiv.textContent = answer;

  // Create the show/hide button
  const toggleButton = document.createElement('a');
  toggleButton.href = '#';
  toggleButton.classList.add('show-hide-btn');
  toggleButton.textContent = 'Show Answer';
  toggleButton.addEventListener('click', (e) => {
    e.preventDefault();
    answerDiv.classList.toggle('hide');
    toggleButton.textContent = answerDiv.classList.contains('hide')
      ? 'Show Answer'
      : 'Hide Answer';
  });

  // Create the delete button
  const deleteButton = document.createElement('button');
  deleteButton.classList.add('delete-btn');
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', () => {
    card.remove(); // Remove the card from the DOM
    saveFlashcards(); // Update localStorage
  });

  // Append elements to the card
  card.appendChild(questionDiv);
  card.appendChild(answerDiv);
  card.appendChild(toggleButton);
  card.appendChild(deleteButton);

  // Add the card to the card container
  cardContainer.appendChild(card);

  // Save flashcards to localStorage
  saveFlashcards();
}

// Event Listeners
addFlashcardButton.addEventListener('click', toggleFlashcardForm);

closeButton.addEventListener('click', toggleFlashcardForm);

saveButton.addEventListener('click', () => {
  const question = questionInput.value.trim();
  const answer = answerInput.value.trim();

  if (question === '' || answer === '') {
    errorMessage.classList.remove('hide');
    return;
  }

  createFlashcard(question, answer);
  toggleFlashcardForm();
});

// Load saved flashcards on page load
document.addEventListener('DOMContentLoaded', loadFlashcards);
