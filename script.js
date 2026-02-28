document.addEventListener("DOMContentLoaded", () => {

let time = 0;
let timer = null;
let isPaused = false;
let currentTaskIndex = -1;
let soundEnabled = true;
let lastQuoteTime = -1;

const timeDisplay = document.getElementById("time");
const taskList = document.getElementById("taskList");
const popup = document.getElementById("popup");

const quoteSound = new Audio("quote.mp3");
const taskSound = new Audio("task-complete.mp3");

quoteSound.volume = 0.8;
taskSound.volume = 0.9;

/* ================= TIME DISPLAY ================= */
function updateTime() {
  const h = Math.floor(time / 3600);
  const m = Math.floor((time % 3600) / 60);
  const s = time % 60;

  timeDisplay.textContent =
    `${h.toString().padStart(2,"0")}:` +
    `${m.toString().padStart(2,"0")}:` +
    `${s.toString().padStart(2,"0")}`;
}

/* ================= SAVE / LOAD ================= */
function saveState() {
  localStorage.setItem("focusTimer", JSON.stringify({
    time, isPaused, currentTaskIndex
  }));
}

function loadState() {
  const saved = JSON.parse(localStorage.getItem("focusTimer"));
  if (saved) {
    time = saved.time;
    isPaused = saved.isPaused;
    currentTaskIndex = saved.currentTaskIndex;
    updateTime();
    if (!isPaused && time > 0) runTimer();
  }
}

/* ================= START TIMER ================= */
function startTimer(hours, minutes, index) {
  clearInterval(timer);
  time = hours * 3600 + minutes * 60;
  currentTaskIndex = index;
  isPaused = false;
  lastQuoteTime = -1;
  updateTime();
  saveState();
  runTimer();
}

/* ================= RUN TIMER ================= */
function runTimer() {
  timer = setInterval(() => {

    if (time > 0) {
      time--;
      updateTime();
      saveState();

      // Quote every 5 minutes
      if (time > 0 && time % 300 === 0 && time !== lastQuoteTime) {
        lastQuoteTime = time;
        showQuote();
      }

    } else {
      clearInterval(timer);
      completeTask();
    }

  }, 1000);
}

/* ================= COMPLETE TASK ================= */
function completeTask() {

  if (soundEnabled) {
    taskSound.pause();
    taskSound.currentTime = 0;
    taskSound.play().catch(()=>{});
  }

  showQuote();

  const tasks = document.querySelectorAll("#taskList li");

  if (currentTaskIndex >= 0 && currentTaskIndex < tasks.length) {
    tasks[currentTaskIndex].classList.add("completed");
  }

  currentTaskIndex++;

  if (currentTaskIndex < tasks.length) {
    const btn = tasks[currentTaskIndex].querySelector(".start");
    startTimer(
      parseInt(btn.dataset.hours),
      parseInt(btn.dataset.minutes),
      currentTaskIndex
    );
  } else {
    time = 0;
    currentTaskIndex = -1;
    updateTime();
    localStorage.removeItem("focusTimer");
  }

  saveState();
}

/* ================= BUTTONS ================= */
document.getElementById("pause").onclick = () => {
  clearInterval(timer);
  isPaused = true;
  saveState();
};

document.getElementById("resume").onclick = () => {
  if (isPaused && time > 0) {
    isPaused = false;
    runTimer();
  }
};

document.getElementById("reset").onclick = () => {
  clearInterval(timer);
  time = 0;
  currentTaskIndex = -1;
  updateTime();
  localStorage.removeItem("focusTimer");
};

/* ================= ADD TASK ================= */
document.getElementById("addTask").onclick = () => {

  const name = document.getElementById("taskInput").value;
  const hours = parseInt(document.getElementById("taskHours").value) || 0;
  const minutes = parseInt(document.getElementById("taskMinutes").value) || 0;

  if (!name || (hours === 0 && minutes === 0)) return;

  const li = document.createElement("li");
  li.innerHTML = `
    <span>${name} (${hours}h ${minutes}m)</span>
    <div>
      <button class="start"
        data-hours="${hours}"
        data-minutes="${minutes}">Start</button>
      <button class="delete">Delete</button>
    </div>
  `;

  taskList.appendChild(li);

  document.getElementById("taskInput").value = "";
  document.getElementById("taskHours").value = "";
  document.getElementById("taskMinutes").value = "";
};

/* ================= TASK ACTIONS ================= */
taskList.onclick = (e) => {

  const tasks = document.querySelectorAll("#taskList li");

  if (e.target.classList.contains("start")) {

    // Unlock audio on first click
    quoteSound.play().then(()=>{
      quoteSound.pause();
      quoteSound.currentTime = 0;
    }).catch(()=>{});

    tasks.forEach((task, i) => {
      if (task.contains(e.target)) {
        startTimer(
          parseInt(e.target.dataset.hours),
          parseInt(e.target.dataset.minutes),
          i
        );
      }
    });
  }

  // DELETE TASK FIX
  if (e.target.classList.contains("delete")) {

    tasks.forEach((task, index) => {

      if (task.contains(e.target)) {

        if (index === currentTaskIndex) {
          clearInterval(timer);
          time = 0;
          isPaused = false;
          currentTaskIndex = -1;
          updateTime();
          localStorage.removeItem("focusTimer");
        }

        if (index < currentTaskIndex) {
          currentTaskIndex--;
        }

        task.remove();
      }

    });
  }
};

/* ================= DARK MODE ================= */
document.getElementById("themeToggle").onclick = () => {
  document.body.classList.toggle("dark");
};

/* ================= FOCUS MODE ================= */
document.getElementById("focusBtn").onclick = () => {
  document.documentElement.requestFullscreen().catch(()=>{});
};

/* ================= SOUND TOGGLE ================= */
document.getElementById("soundToggle").onclick = function () {
  soundEnabled = !soundEnabled;
  this.textContent = soundEnabled ? "🔊 Sound ON" : "🔇 Sound OFF";
};

/* ================= QUOTES ================= */
const quotes = [
  "Stay focused and never give up.",
  "Discipline creates freedom.",
  "Small progress is still progress.",
  "Push through resistance.",
  "Consistency beats motivation.",
  "Deep work builds deep success.",
  "Execution over emotion.",
  "Finish what you started.",
  "Focus is a superpower.",
  "Dream big. Start small. Act now.",
  "Your future is built today.",
  "One task at a time.",
  "Progress over perfection.",
  "Distractions destroy dreams.",
  "Success loves discipline.",
  "Control your mind or it controls you.",
  "Hard work compounds.",
  "Momentum is built by action.",
  "Silence the noise. Do the work.",
  "You become what you practice.",
  "Do it even when you don’t feel like it.",
  "Energy flows where focus goes.",
  "Winners focus. Losers complain.",
  "Stay hungry. Stay sharp.",
  "Mastery requires patience.",
  "Action cures anxiety.",
  "Time is your most valuable asset.",
  "Work now. Shine later.",
  "Your goals deserve attention.",
  "Focus on growth, not comfort.",
  "Be stronger than your excuses.",
  "The grind shapes greatness.",
  "Deep focus creates deep results.",
  "Avoid distractions. Create impact.",
  "Clarity comes from action.",
  "Today’s effort is tomorrow’s reward.",
  "Build habits, not excuses.",
  "Start before you’re ready.",
  "Greatness requires sacrifice.",
  "Stay consistent. Stay unstoppable.",
  "You are capable of more.",
  "Every minute counts.",
  "The pain of discipline beats regret.",
  "Focus fuels achievement.",
  "Work in silence. Let results speak.",
  "Growth begins at discomfort.",
  "No zero days.",
  "Your time is now.",
  "Stay locked in.",
  "Focus. Execute. Win."
];

function showQuote() {

  popup.textContent =
    quotes[Math.floor(Math.random() * quotes.length)];

  popup.classList.remove("hidden");

  if (soundEnabled) {
    quoteSound.pause();
    quoteSound.currentTime = 0;
    quoteSound.play().catch(()=>{});
  }

  setTimeout(() => {
    popup.classList.add("hidden");
  }, 3000);
}

/* ================= INIT ================= */
loadState();
updateTime();

});