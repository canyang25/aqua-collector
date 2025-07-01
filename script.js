// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let score = 0; // Track the player's score
let timeLeft = 30; // Timer in seconds
let timerInterval; // Interval for countdown timer

// Winning and losing messages
const winningMessages = [
  "Amazing! You brought clean water to a whole village!",
  "Incredible! You're a water hero!",
  "Fantastic! You made a real difference!",
  "You did it! So many lives changed!"
];
const losingMessages = [
  "Keep trying! Every drop counts.",
  "Almost there! Give it another go.",
  "Don't give up! Clean water is worth it.",
  "Try again! You can do it!"
];

// Difficulty settings
const difficulties = {
  easy:   { time: 40, dropInterval: 900, winScore: 15, dropSpeed: 5 },
  normal: { time: 30, dropInterval: 600, winScore: 20, dropSpeed: 4 },
  hard:   { time: 20, dropInterval: 400, winScore: 28, dropSpeed: 2.7 }
};
let currentDifficulty = 'normal';

// Milestone messages (score: message)
const milestones = [
  { score: 5, message: "Great start! Keep going!" },
  { score: 10, message: "Halfway there!" },
  { score: 15, message: "Amazing! You're getting close!" },
  { score: 20, message: "Incredible! Almost at the goal!" }
];
// Track which milestones have been shown
let shownMilestones = new Set();

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("reset-btn").addEventListener("click", resetGame);

// Listen for difficulty change
document.getElementById("difficulty").addEventListener("change", function(e) {
  currentDifficulty = e.target.value;
  resetGame(); // Reset game when difficulty changes
});

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  // Get difficulty settings
  const settings = difficulties[currentDifficulty];

  gameRunning = true;
  score = 0;
  timeLeft = settings.time;
  document.getElementById("score").textContent = score;
  document.getElementById("time").textContent = timeLeft;

  // Start the countdown timer
  timerInterval = setInterval(() => {
    timeLeft -= 1;
    document.getElementById("time").textContent = timeLeft;
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);

  // Create new drops at the interval for this difficulty
  dropMaker = setInterval(() => createDrop(settings), settings.dropInterval);

  shownMilestones = new Set(); // Reset milestones at game start
}

// Utility to play a sound by element ID
function playSound(id) {
  const audio = document.getElementById(id);
  if (audio) {
    audio.currentTime = 0;
    audio.play();
  }
}

// Update button event listeners to play sound
document.getElementById("start-btn").addEventListener("click", function() {
  playSound("sfx-button");
  startGame();
});
document.getElementById("reset-btn").addEventListener("click", function() {
  playSound("sfx-button");
  resetGame();
});

function endGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);

  // Remove all remaining drops from the game container
  const drops = document.querySelectorAll(".water-drop");
  drops.forEach(drop => drop.remove());

  // Pick and show a random message based on score
  let message;
  const settings = difficulties[currentDifficulty];
  const isWin = score >= settings.winScore;
  if (isWin) {
    playSound("sfx-win");
    message = winningMessages[Math.floor(Math.random() * winningMessages.length)];
    showConfetti();
  } else {
    message = losingMessages[Math.floor(Math.random() * losingMessages.length)];
  }
  alert(`${message}\nYour score: ${score}\n(${capitalize(currentDifficulty)} mode: Need ${settings.winScore} to win)`);
}

function resetGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);

  // Remove all drops
  const drops = document.querySelectorAll(".water-drop");
  drops.forEach(drop => drop.remove());

  // Reset score and timer to current difficulty
  const settings = difficulties[currentDifficulty];
  score = 0;
  timeLeft = settings.time;
  document.getElementById("score").textContent = score;
  document.getElementById("time").textContent = timeLeft;
}

function createDrop(settings = difficulties[currentDifficulty]) {
  if (!gameRunning) return;

  // Create a new div element that will be our water drop
  const drop = document.createElement("div");
  drop.className = "water-drop";

  // Randomly decide if this is a bad drop (20% chance)
  const isBadDrop = Math.random() < 0.2;
  if (isBadDrop) {
    drop.classList.add("bad-drop");
  }

  // Make drops different sizes for visual variety
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  // Subtract 60 pixels to keep drops fully inside the container
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  // Make drops fall for X seconds (difficulty dependent)
  drop.style.animationDuration = settings.dropSpeed + "s";

  // Add the new drop to the game screen (add to DOM)
  document.getElementById("game-container").appendChild(drop);

  // Remove drop from DOM when clicked (player collects or avoids)
  drop.addEventListener("click", () => {
    if (isBadDrop) {
      score = Math.max(0, score - 1);
      playSound("sfx-miss");
    } else {
      score += 1;
      playSound("sfx-collect");
    }
    document.getElementById("score").textContent = score;

    // Check for milestones and show message if reached
    for (const milestone of milestones) {
      if (
        score === milestone.score &&
        !shownMilestones.has(milestone.score)
      ) {
        shownMilestones.add(milestone.score);
        showMilestone(milestone.message);
        break;
      }
    }

    drop.remove(); // Remove the drop element from the DOM
  });

  // Remove drop from DOM when animation ends (wasn't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove(); // Clean up drops that weren't caught
  });
}

// Show milestone message (simple overlay)
function showMilestone(message) {
  const milestoneDiv = document.createElement("div");
  milestoneDiv.textContent = message;
  milestoneDiv.style.position = "fixed";
  milestoneDiv.style.top = "20%";
  milestoneDiv.style.left = "50%";
  milestoneDiv.style.transform = "translate(-50%, -50%)";
  milestoneDiv.style.background = "#FFC907";
  milestoneDiv.style.color = "#131313";
  milestoneDiv.style.padding = "18px 32px";
  milestoneDiv.style.borderRadius = "10px";
  milestoneDiv.style.fontSize = "2rem";
  milestoneDiv.style.fontWeight = "bold";
  milestoneDiv.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)";
  milestoneDiv.style.zIndex = "10001";
  milestoneDiv.style.opacity = "0.97";
  document.body.appendChild(milestoneDiv);

  setTimeout(() => {
    milestoneDiv.remove();
  }, 1200);
}

// Confetti effect for win
function showConfetti() {
  const confettiContainer = document.createElement("div");
  confettiContainer.className = "confetti-container";
  document.body.appendChild(confettiContainer);

  const confettiEmojis = ["🎉", "💧", "✨", "🥳", "🎊"];
  const confettiCount = 30;

  for (let i = 0; i < confettiCount; i++) {
    const conf = document.createElement("span");
    conf.className = "confetti";
    conf.textContent = confettiEmojis[Math.floor(Math.random() * confettiEmojis.length)];
    conf.style.left = Math.random() * 100 + "vw";
    conf.style.animationDelay = (Math.random() * 1) + "s";
    confettiContainer.appendChild(conf);
  }

  setTimeout(() => {
    confettiContainer.remove();
  }, 2000);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
