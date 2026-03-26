let game = {
    t1: { q: 0, a: 0, input: "", score: 0 },
    t2: { q: 0, a: 0, input: "", score: 0 },
    ropePos: 0,
    winLimit: 250,
    timeRemaining: 180,
    timerInterval: null,
    gameActive: false
};

// 🎤 AI VOICE
function speak(text) {
    const msg = new SpeechSynthesisUtterance(text);
    msg.rate = 1;
    msg.pitch = 1.2;
    msg.volume = 1;
    msg.lang = "en-US";

    speechSynthesis.cancel();
    speechSynthesis.speak(msg);
}

// 🔊 SOUND
function playSound(id) {
    const sound = document.getElementById(id);
    if (!sound) return;
    sound.currentTime = 0;
    sound.play();
}

// INIT
function init() {
    newQ('t1');
    newQ('t2');
    initThemeSwitcher();
    updateRopeCurve();
    startTimer();
}

// TIMER
function startTimer() {
    game.gameActive = true;
    game.timeRemaining = 180;

    game.timerInterval = setInterval(() => {
        game.timeRemaining--;
        document.getElementById('timer').textContent =
            `${String(Math.floor(game.timeRemaining / 60)).padStart(2, '0')}:${String(game.timeRemaining % 60).padStart(2, '0')}`;

        if (game.timeRemaining <= 0) {
            clearInterval(game.timerInterval);
            endGame();
        }
    }, 1000);
}

// QUESTIONS
function newQ(team) {
    let n1 = Math.floor(Math.random() * 50) + 1;
    let n2 = Math.floor(Math.random() * 50) + 1;

    game[team].a = n1 + n2;
    document.getElementById(`q${team === 't1' ? 1 : 2}`).textContent = `${n1} + ${n2}`;
}

// INPUT
function num(team, val) {
    if (game[team].input.length < 4) {
        game[team].input += val;
        document.getElementById(`display-${team}`).textContent = game[team].input;
    }
}

function clr(team) {
    game[team].input = "";
    document.getElementById(`display-${team}`).textContent = "";
}

// 🎯 MAIN CHECK (🔥 FULL MAGIC HERE)
function check(team) {

    if (!game.gameActive) return;

    let userAns = parseInt(game[team].input);
    let chars = document.querySelector(team === 't1' ? '.left-group' : '.right-group');

    if (userAns === game[team].a) {

        // ✅ CORRECT
        playSound("correct-sound");
        speak("Correct!");

        game[team].score += 10;
        game.ropePos += (team === 't1' ? -50 : 50);

        if (chars) chars.classList.add('pulling');

        setTimeout(() => {
            if (chars) chars.classList.remove('pulling');
        }, 500);

        updateUI();
        newQ(team);
        clr(team);
        checkWin();

    } else {

        // ❌ WRONG
        playSound("wrong-sound");
        speak("Wrong!");

        let display = document.getElementById(`display-${team}`);
        display.classList.add('shake');

        setTimeout(() => display.classList.remove('shake'), 400);

        clr(team);
    }
}

// UPDATE UI
function updateUI() {
    document.getElementById('rope-system').style.transform = `translateX(${game.ropePos}px)`;

    document.getElementById('s1').textContent = game.t1.score;
    document.getElementById('s2').textContent = game.t2.score;

    updateRopeCurve();
}

// ROPE ANIMATION
function updateRopeCurve() {
    const ropePath = document.getElementById('rope-path');
    let offset = game.ropePos / 5;

    ropePath.setAttribute(
        'd',
        `M 0 20 Q 150 ${20 - offset} 300 20 Q 450 ${20 + offset} 600 20`
    );
}

// 🏆 WIN CHECK
function checkWin() {
    if (Math.abs(game.ropePos) >= game.winLimit) {

        let winner = game.ropePos < 0 ? "TEAM 1" : "TEAM 2";
        showWinScreen(winner);
    }
}

// 🎉 WIN SCREEN (FINAL)
function showWinScreen(winner) {

  const winScreen = document.getElementById("win-screen");
  const scoreBox = document.getElementById("final-score");

  // 🧮 TOTAL SCORE (you can customize)
  let finalScore = game.t1.score + game.t2.score;

  scoreBox.innerText = finalScore;

  // 🔊 SOUND + VOICE
  playSound("win-sound");
  speak(winner === "TEAM 1" ? "Team 1 wins!" : "Team 2 wins!");

  // 🎆 FIREWORKS
  createUltraFireworks();

  winScreen.classList.add("show");
}

// 🎆 FIREWORKS
function createFireworks() {
    const container = document.getElementById("win-screen");

    for (let i = 0; i < 10; i++) {
        let fw = document.createElement("div");
        fw.classList.add("firework");

        fw.style.top = Math.random() * 80 + "%";
        fw.style.left = Math.random() * 100 + "%";

        container.appendChild(fw);

        setTimeout(() => fw.remove(), 1000);
    }
}

// 🎊 CONFETTI
function createConfetti() {
    const container = document.getElementById("confetti-container");

    for (let i = 0; i < 50; i++) {
        let c = document.createElement("div");
        c.classList.add("confetti");

        c.style.left = Math.random() * 100 + "%";

        container.appendChild(c);

        setTimeout(() => c.remove(), 3000);
    }
}

// END GAME
function endGame() {
    let winner = game.ropePos < 0 ? "TEAM 1" : "TEAM 2";
    showWinScreen(winner);
}

// PLAY AGAIN
function playAgain() {
    location.reload();
}

// START
window.onload = init;












function createUltraFireworks() {
  const container = document.getElementById("win-screen");

  const colors = [
    "#ff4d4d", "#00f0ff", "#ffff33",
    "#ff66cc", "#66ff66", "#ffa502"
  ];

  for (let i = 0; i < 6; i++) {

    setTimeout(() => {

      // 🚀 ROCKET
      let rocket = document.createElement("div");
      rocket.className = "rocket";

      rocket.style.left = Math.random() * 100 + "%";
      container.appendChild(rocket);

      // 🔊 LAUNCH SOUND
      playExplosionSound(150);

      // 💥 EXPLOSION AFTER ROCKET
      setTimeout(() => {

        rocket.remove();

        let firework = document.createElement("div");
        firework.className = "firework";

        firework.style.left = Math.random() * 100 + "%";
        firework.style.top = Math.random() * 60 + "%";

        // 🔊 EXPLOSION SOUND
        playExplosionSound(300);

        // 💥 PARTICLES
        for (let j = 0; j < 30; j++) {

          let p = document.createElement("span");

          let angle = (j / 30) * (Math.PI * 2);
          let distance = Math.random() * 80 + 40;

          let color = colors[Math.floor(Math.random() * colors.length)];

          p.style.background = color;

          // 🌌 NEON GLOW
          p.style.boxShadow = `0 0 10px ${color}, 0 0 20px ${color}`;

          p.style.transform =
            `rotate(${angle}rad) translateY(${distance}px)`;

          firework.appendChild(p);
        }

        container.appendChild(firework);

        setTimeout(() => firework.remove(), 1500);

      }, 800);

    }, i * 400);
  }
}

function playExplosionSound(freq) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);

  } catch (e) {
    console.log("sound error");
  }
}







function initThemeSwitcher() {
  const buttons = document.querySelectorAll(".theme-btn");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {

      // remove active
      buttons.forEach(b => b.classList.remove("active"));

      // add active
      btn.classList.add("active");

      // change theme
      document.body.setAttribute("data-theme", btn.dataset.theme);
    });
  });
}
