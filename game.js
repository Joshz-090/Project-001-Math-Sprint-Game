// Game State
let score = 0;
let timeLeft = 3;
let timer;
let level = 1;
let isPlaying = false;
let firstQuestion = true;
let lastQuestionText = "";
let lastCorrectAnswer = 0;
let soundEnabled = true;

// Sound Elements
const laughSound = new Audio("laugh.mp3");
const correctSound = new Audio("correct-6033.mp3");
laughSound.preload = "auto";
correctSound.preload = "auto";

// DOM Elements
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const scoreEl = document.getElementById("score");
const timeTextEl = document.getElementById("time-text");
const progressBarEl = document.getElementById("progress-bar");
const soundBtn = document.getElementById("sound-btn");

// Update progress bar
function updateProgressBar() {
  const percentage = (timeLeft / 3) * 100;
  progressBarEl.style.width = `${percentage}%`;

  // Change color from green to red as time runs out
  const hue = (percentage / 100) * 120; // 120 is green in HSL, 0 is red
  progressBarEl.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;

  timeTextEl.textContent = `${timeLeft.toFixed(1)}s`;
}

// Sound Toggle
soundBtn.addEventListener("click", function () {
  soundEnabled = !soundEnabled;
  this.textContent = soundEnabled ? "🔊" : "🔇";
});

// Play sound with error handling
function playSound(sound) {
  if (soundEnabled) {
    sound.currentTime = 0;
    sound.play().catch((e) => console.log("Sound blocked:", e));
  }
}

// Show visual feedback for correct answers
function showCorrectFeedback() {
  const feedback = document.createElement("div");
  feedback.className = "correct-feedback";
  feedback.textContent = "✓";
  document.body.appendChild(feedback);
  setTimeout(() => feedback.remove(), 500);
}

// Start Game
document.addEventListener("click", function (e) {
  if (e.target && e.target.id === "start-btn") {
    startScreen.style.display = "none";
    gameScreen.style.display = "block";
    isPlaying = true;
    resetGame();
  }
});

// Keyboard Input (Q, W, E)
document.addEventListener("keydown", function (e) {
  if (!isPlaying) return;

  const key = e.key.toLowerCase();
  if (key === "q" || key === "w" || key === "e") {
    const optionIndex = { q: 0, w: 1, e: 2 }[key];
    if (optionIndex < currentOptions.length) {
      const button = optionsEl.children[optionIndex];
      button.style.transform = "scale(0.95)";
      setTimeout(() => (button.style.transform = "scale(1)"), 100);
      checkAnswer(currentOptions[optionIndex] === correctAnswer);
    }
  }
});

// Random 1-5
function getRandomNum() {
  return Math.floor(Math.random() * 5) + 1;
}

// Generate Question
function generateQuestion() {
  let question, answer;

  if (level === 1) {
    const a = getRandomNum();
    const b = getRandomNum();
    question = `${a} + ${b}`;
    answer = a + b;
  } else {
    const a = getRandomNum();
    const b = getRandomNum();
    const c = getRandomNum();
    question = `${a} - ${b} + ${c}`;
    answer = a - b + c;
  }

  if (answer < 0 || answer > 9) {
    return generateQuestion();
  }

  return { question, answer };
}

// Display question and options
function showQuestion() {
  clearInterval(timer);
  timeLeft = 3;
  updateProgressBar();

  const { question, answer } = generateQuestion();
  lastQuestionText = question;
  lastCorrectAnswer = answer;
  correctAnswer = answer;
  questionEl.textContent = question;

  const options = [answer];
  while (options.length < 3) {
    const offset = Math.floor(Math.random() * 3) + 1;
    const wrong = Math.max(
      0,
      Math.min(9, answer + (Math.random() > 0.5 ? offset : -offset))
    );
    if (!options.includes(wrong)) options.push(wrong);
  }

  options.sort(() => Math.random() - 0.5);
  optionsEl.innerHTML = "";
  currentOptions = options;

  const keys = ["Q", "W", "E"];
  options.forEach((opt, index) => {
    const button = document.createElement("button");
    button.textContent = opt;
    button.dataset.key = keys[index];
    button.onclick = () => checkAnswer(opt === answer);
    optionsEl.appendChild(button);
  });

  if (!firstQuestion) {
    timer = setInterval(() => {
      timeLeft -= 0.1;
      updateProgressBar();
      if (timeLeft <= 0) {
        playSound(laughSound);
        endGame();
      }
    }, 100);
  } else {
    firstQuestion = false;
  }
}

// Check answer
function checkAnswer(isCorrect) {
  clearInterval(timer);
  if (isCorrect) {
    playSound(correctSound);
    showCorrectFeedback();
    score++;
    scoreEl.textContent = `⭐ Score: ${score}`;
    if (score % 10 === 0 && level < 2) {
      level++;
      questionEl.innerHTML += ' <span style="color:gold">🌟 LEVEL UP!</span>';
    }
    setTimeout(showQuestion, 500); // Brief delay for feedback
  } else {
    playSound(laughSound);
    endGame();
  }
}

// End game
function endGame() {
  isPlaying = false;
  clearInterval(timer);

  startScreen.innerHTML = `
    <div style="
      background: white;
      padding: 30px;
      border-radius: 20px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.2);
      display: inline-block;
      animation: fadeIn 0.5s ease;
    ">
      <h2 style="color: #e91e63; font-size: 32px;">Game Over! 😵</h2>
      <p style="font-size: 20px; color: #444;">⭐ Your Score: <strong>${score}</strong></p>
      <p style="font-size: 18px; color: #333; margin-top: 20px;">
        You messed up on: <strong style="color: #ff5722;">${lastQuestionText} = ${lastCorrectAnswer}</strong>
      </p>
      <p style="font-size: 18px; color: #777;">
        OMG! I can't believe this... 🤯<br>
        Why don't you think like a human?<br>
        <small>(Even monkeys can do better 🐒)</small>
      </p>
      <button id="start-btn" style="
        margin-top: 20px;
        padding: 15px 30px;
        font-size: 18px;
        background: #2196F3;
        color: white;
        border: none;
        border-radius: 10px;
        cursor: pointer;
      ">TRY AGAIN 🔄</button>
    </div>
  `;

  startScreen.style.display = "block";
  gameScreen.style.display = "none";
}

// Reset game
function resetGame() {
  score = 0;
  level = 1;
  firstQuestion = true;
  scoreEl.textContent = `⭐ Score: ${score}`;
  if (isPlaying) showQuestion();
}

// Dark Mode Toggle
const darkModeBtn = document.getElementById("dark-mode-btn");
const body = document.body;
const logo = document.getElementById("logo");

// Check for saved user preference (ignore system preference initially)
const savedMode = localStorage.getItem("darkMode");

// Set initial mode - default to light mode unless user previously chose dark
if (savedMode === "dark") {
  enableDarkMode();
} else {
  // Explicitly set light mode (default)
  disableDarkMode();
}

// Toggle dark mode
darkModeBtn.addEventListener("click", () => {
  if (body.classList.contains("dark-mode")) {
    disableDarkMode();
  } else {
    enableDarkMode();
  }
});

function enableDarkMode() {
  body.classList.add("dark-mode");
  darkModeBtn.textContent = "☀️";
  localStorage.setItem("darkMode", "dark");
  // Change to white logo
  document.getElementById("logo").src =
    "./photos/White__Logo_-removebg-preview.png";
}

function disableDarkMode() {
  body.classList.remove("dark-mode");
  darkModeBtn.textContent = "🌙";
  localStorage.setItem("darkMode", "light");
  // Change to black logo
  document.getElementById("logo").src =
    "./photos/Black_Logo_-removebg-preview.png";
}
