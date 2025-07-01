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

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("reset-btn").addEventListener("click", resetGame);

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  gameRunning = true;
  score = 0;
  timeLeft = 30;
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

  // Create new drops more frequently (e.g., every 600 milliseconds)
  dropMaker = setInterval(createDrop, 600);
}

function endGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);

  // Remove all remaining drops from the game container
  const drops = document.querySelectorAll(".water-drop");
  drops.forEach(drop => drop.remove());

  // Pick and show a random message based on score
  let message;
  const isWin = score >= 20;
  if (isWin) {
    message = winningMessages[Math.floor(Math.random() * winningMessages.length)];
    showConfetti();
  } else {
    message = losingMessages[Math.floor(Math.random() * losingMessages.length)];
  }
  alert(`${message}\nYour score: ${score}`);
}

function resetGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);

  // Remove all drops
  const drops = document.querySelectorAll(".water-drop");
  drops.forEach(drop => drop.remove());

  // Reset score and timer
  score = 0;
  timeLeft = 30;
  document.getElementById("score").textContent = score;
  document.getElementById("time").textContent = timeLeft;
}

function createDrop() {
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

  // Make drops fall for 4 seconds
  drop.style.animationDuration = "4s";

  // Add the new drop to the game screen
  document.getElementById("game-container").appendChild(drop);

  // Increment or decrement score when drop is clicked
  drop.addEventListener("click", () => {
    if (isBadDrop) {
      score = Math.max(0, score - 1);
    } else {
      score += 1;
    }
    document.getElementById("score").textContent = score;
    drop.remove();
  });

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove(); // Clean up drops that weren't caught
  });
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
