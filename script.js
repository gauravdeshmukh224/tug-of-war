let game = {
    t1: { q: 0, a: 0, input: "", score: 0 },
    t2: { q: 0, a: 0, input: "", score: 0 },
    ropePos: 0,
    winLimit: 250, // किती लांब गेल्यावर गेम संपेल
    timeRemaining: 180, // 3 minutes in seconds
    timerInterval: null,
    gameActive: false
};

function init() {
    newQ('t1');
    newQ('t2');
    updateRopeCurve(); // Initialize rope curve
    initThemeSwitcher();
    updateHandPositions(); // Initialize hand positions
    startTimer(); // Start the 3-minute timer
}

function initThemeSwitcher() {
    const themeButtons = document.querySelectorAll('.theme-btn');
    const body = document.body;
    
    // Set default theme
    body.setAttribute('data-theme', 'dark');
    
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            
            // Remove active class from all buttons
            themeButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Set theme
            body.setAttribute('data-theme', theme);
        });
    });
}

function startTimer() {
    game.gameActive = true;
    game.timeRemaining = 180; // Reset to 3 minutes
    updateTimerDisplay();
    
    // Clear any existing timer
    if (game.timerInterval) {
        clearInterval(game.timerInterval);
    }
    
    game.timerInterval = setInterval(() => {
        game.timeRemaining--;
        updateTimerDisplay();
        
        if (game.timeRemaining <= 0) {
            clearInterval(game.timerInterval);
            game.gameActive = false;
            endGame();
        }
    }, 1000); // Update every second
}

function updateTimerDisplay() {
    const minutes = Math.floor(game.timeRemaining / 60);
    const seconds = game.timeRemaining % 60;
    const timerElement = document.getElementById('timer');
    
    if (timerElement) {
        timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        // Add warning effect when time is running out (30 seconds or less)
        if (game.timeRemaining <= 30 && game.timeRemaining > 0) {
            timerElement.style.color = '#ef4444'; // Red color
            timerElement.style.animation = 'blink 0.6s infinite';
        } else if (game.timeRemaining > 30) {
            timerElement.style.color = '';
            timerElement.style.animation = '';
        }
    }
}

function endGame() {
    game.gameActive = false;
    
    // Determine winner based on final rope position
    let winner = game.ropePos === 0 ? "DRAW" : (game.ropePos < 0 ? "TEAM 1 (BLUE)" : "TEAM 2 (RED)");
    let winnerChars = game.ropePos < 0 ? '.left-group' : '.right-group';
    
    // Disable all inputs
    const allButtons = document.querySelectorAll('.key-btn, .btn-primary');
    allButtons.forEach(btn => btn.disabled = true);
    
    if (game.ropePos !== 0) {
        showWinScreen(winner, winnerChars);
    } else {
        showDrawScreen();
    }
}

function showDrawScreen() {
    const overlay = document.createElement('div');
    overlay.className = 'game-over-overlay';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center;
        z-index: 9999;
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white; padding: 40px; border-radius: 20px;
        text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    `;
    
    modal.innerHTML = `
        <h1 style="font-size: 48px; margin-bottom: 20px; color: #666;">🤝 IT'S A DRAW!</h1>
        <p style="font-size: 24px; color: #888; margin-bottom: 30px;">Both teams are equally strong!</p>
        <button onclick="location.reload()" style="
            background: #3b82f6; color: white; padding: 12px 30px;
            border: none; border-radius: 8px; font-size: 18px; cursor: pointer;
        ">Play Again</button>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

function newQ(team) {
    let n1 = Math.floor(Math.random() * 50) + 1;
    let n2 = Math.floor(Math.random() * 50) + 1;
    game[team].a = n1 + n2;
    
    const qElement = document.getElementById(`q${team === 't1' ? 1 : 2}`);
    qElement.textContent = `${n1} + ${n2}`;
    
    // Add question change animation
    const qBadge = qElement.closest('.q-badge');
    if (qBadge) {
        qBadge.classList.add('question-change');
        setTimeout(() => qBadge.classList.remove('question-change'), 400);
    }
}

function num(team, val) {
    if (game[team].input.length < 4) {
        game[team].input += val;
        const displayElement = document.getElementById(`display-${team}`);
        displayElement.textContent = game[team].input || '';
        
        // Add input animation
        displayElement.classList.add('input-change');
        setTimeout(() => displayElement.classList.remove('input-change'), 300);
    }
}

function clr(team) {
    game[team].input = "";
    const displayElement = document.getElementById(`display-${team}`);
    displayElement.textContent = "";
    
    // Add clear animation
    displayElement.classList.add('input-change');
    setTimeout(() => displayElement.classList.remove('input-change'), 300);
}

function check(team) {
    // Prevent submissions if game is not active
    if (!game.gameActive) {
        return;
    }
    
    let userAns = parseInt(game[team].input);
    let chars = document.querySelector(team === 't1' ? '.left-group' : '.right-group');
    let rope = document.querySelector('.rope-svg');

    if (userAns === game[team].a) {
        // Correct Answer
        game[team].score += 10;
        let pullStrength = 50;
        game.ropePos += (team === 't1' ? -pullStrength : pullStrength);
        
        // Sound Effects
        playRopeStretch();
        playFootSlide();
        
        // Create dust particles
        if (chars) createDustParticles(chars);
        
        // Animation - Add drag shake effect
        if (chars) chars.classList.add('pulling', 'drag-shake');
        if (rope) rope.classList.add('tension');
        
        // Add hand gripping animation
        const hands = team === 't1' ? document.querySelectorAll('.left-hand') : document.querySelectorAll('.right-hand');
        hands.forEach(hand => hand.classList.add('gripping'));
        
        let flag = document.querySelector('.flag-marker');
        
        // Delay flag shake for more realistic effect
        setTimeout(() => {
            if (flag) flag.classList.add('bounce');
        }, 150);
        
        setTimeout(() => {
            if (chars) chars.classList.remove('pulling', 'drag-shake');
            if (rope) rope.classList.remove('tension');
            hands.forEach(hand => hand.classList.remove('gripping'));
            if (flag) flag.classList.remove('bounce');
        }, 600);
        
        updateUI();
        newQ(team);
        clr(team);
        
        checkWin();
    } else {
        // Wrong Answer - Shake Effect
        const displayElement = document.getElementById(`display-${team}`);
        if (displayElement) {
            displayElement.classList.add('shake');
            setTimeout(() => displayElement.classList.remove('shake'), 400);
        }
        clr(team);
    }
}

function updateUI() {
    document.getElementById('rope-system').style.transform = `translateX(${game.ropePos}px)`;
    
    // Update hand positions to match rope ends
    updateHandPositions();
    
    // Animate score changes
    const s1Element = document.getElementById('s1');
    const s2Element = document.getElementById('s2');
    const s1Card = s1Element.closest('.score-box');
    const s2Card = s2Element.closest('.score-box');
    
    // Check if scores changed
    const currentS1 = parseInt(s1Element.textContent) || 0;
    const currentS2 = parseInt(s2Element.textContent) || 0;
    
    if (currentS1 !== game.t1.score) {
        s1Card.classList.add('score-change');
        s1Element.textContent = game.t1.score;
        setTimeout(() => s1Card.classList.remove('score-change'), 600);
    }
    
    if (currentS2 !== game.t2.score) {
        s2Card.classList.add('score-change');
        s2Element.textContent = game.t2.score;
        setTimeout(() => s2Card.classList.remove('score-change'), 600);
    }
    
    // Update rope curve for realistic physics
    updateRopeCurve();
}

function updateHandPositions() {
    // Hands are now positioned relative to rope-system container
    // Left hands at x=0 (rope start), right hands at x=100% (rope end)
    // They will move with the rope-system transform automatically
    
    // For visual connection, we can adjust z-index or positioning if needed
    // Currently the CSS positioning should handle the basic placement
}

function updateRopeCurve() {
    const ropePath = document.getElementById('rope-path');
    const ropePos = game.ropePos;
    
    // Calculate curve intensity based on rope position (more curve = more tension)
    const curveIntensity = Math.abs(ropePos) / 50; // Scale factor
    const maxCurve = Math.min(curveIntensity * 20, 50); // Max curve of 50px for more dramatic effect
    
    // Add slight natural sag even when rope is centered
    const naturalSag = ropePos === 0 ? 3 : 0;
    
    // Create curved path that responds to pull position
    // The curve should be more pronounced towards the winning side
    let curveOffset = naturalSag;
    if (ropePos < 0) {
        // Team A pulling - curve towards left (negative values)
        curveOffset = -maxCurve;
    } else if (ropePos > 0) {
        // Team B pulling - curve towards right (positive values)
        curveOffset = maxCurve;
    }
    
    // Create smooth curved path using cubic bezier curves for more natural physics
    // The rope should sag more in the middle when pulled
    const startY = 30;
    const midY = 30 + curveOffset * 0.8; // More curve in the middle
    const endY = 30;
    
    // Control points for smooth curve
    const cp1x = 200, cp1y = startY + curveOffset * 0.2;
    const cp2x = 300, cp2y = midY;
    const cp3x = 500, cp3y = midY;
    const cp4x = 600, cp4y = midY - curveOffset * 0.2;
    
    const pathData = `M 0 ${startY} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} 400 ${midY} C ${cp3x} ${cp3y} ${cp4x} ${cp4y} 800 ${endY}`;
    
    ropePath.setAttribute('d', pathData);
}

function checkWin() {
    let rope = document.querySelector('.rope-svg');
    
    if (Math.abs(game.ropePos) >= game.winLimit) {
        let winner = game.ropePos < 0 ? "TEAM 1 (BLUE)" : "TEAM 2 (RED)";
        let winnerTeam = game.ropePos < 0 ? 't1' : 't2';
        let winnerChars = winnerTeam === 't1' ? '.left-group' : '.right-group';
        
        // Add winning glow effect
        if (rope) {
            if (game.ropePos < 0) {
                rope.classList.add('winning-blue');
            } else {
                rope.classList.add('winning-red');
            }
            
            // Rope snap animation
            rope.classList.add('snap');
        }
        
        // Rope snap sound effect
        playRopeSnap();
        
        // Start confetti
        startConfetti();
        
        // Show winner after a short delay
        setTimeout(() => {
            showWinScreen(winner, winnerChars);
        }, 1000);
    } else {
        // Remove glow if not winning
        if (rope) {
            rope.classList.remove('winning-blue', 'winning-red');
        }
    }
}

function playRopeSnap() {
    // Create a simple snap sound using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        // Fallback: no sound if Web Audio API not supported
        console.log('Audio not supported');
    }
}

function playRopeStretch() {
    // Create a rope stretching/creaking sound
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Low frequency creaking sound
        oscillator.frequency.setValueAtTime(80, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(60, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(40, audioContext.currentTime + 0.2);
        
        // Low-pass filter for creaky effect
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
        console.log('Audio not supported');
    }
}

function playFootSlide() {
    // Create a foot sliding/grinding sound
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.4, audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        // Generate white noise
        for (let i = 0; i < noiseBuffer.length; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const whiteNoise = audioContext.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Filter for sliding effect
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(300, audioContext.currentTime);
        filter.Q.setValueAtTime(1, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        
        whiteNoise.start(audioContext.currentTime);
    } catch (e) {
        console.log('Audio not supported');
    }
}

function playCrowdCheer() {
    // Create a crowd cheering sound with multiple oscillators
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create multiple cheering tones
        const cheers = [
            { freq: 220, delay: 0 },
            { freq: 330, delay: 0.1 },
            { freq: 440, delay: 0.2 },
            { freq: 550, delay: 0.3 },
            { freq: 660, delay: 0.4 }
        ];
        
        cheers.forEach(cheer => {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(cheer.freq, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(cheer.freq * 1.2, audioContext.currentTime + 0.5);
                
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.0);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 1.0);
            }, cheer.delay * 1000);
        });
        
        // Add some random cheering bursts
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                const randomFreq = 200 + Math.random() * 400;
                oscillator.frequency.setValueAtTime(randomFreq, audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(0.05 + Math.random() * 0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
            }, Math.random() * 2000);
        }
    } catch (e) {
        console.log('Audio not supported');
    }
}

function createDustParticles(charGroup) {
    // Get all dust containers in the character group
    const dustContainers = charGroup.querySelectorAll('.dust-container');
    
    dustContainers.forEach(container => {
        // Clear any existing particles
        container.innerHTML = '';
        
        // Create 6 dust particles per character
        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('div');
            particle.className = 'dust-particle';
            
            // Random horizontal position
            const randomX = (Math.random() - 0.5) * 40; // -20px to +20px
            particle.style.left = `calc(50% + ${randomX}px)`;
            
            // Random animation delay for natural look
            particle.style.animationDelay = `${Math.random() * 0.3}s`;
            
            container.appendChild(particle);
        }
        
        // Remove particles after animation completes
        setTimeout(() => {
            container.innerHTML = '';
        }, 1000);
    });
}

function startConfetti() {
    const container = document.getElementById('confetti-container');
    const colors = ['#ff416c', '#00d2ff', '#f9ca24', '#6c5ce7', '#a29bfe', '#fd79a8'];
    
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            confetti.style.animationDelay = Math.random() * 2 + 's';
            container.appendChild(confetti);
            
            // Remove confetti after animation
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 5000);
        }, i * 50);
    }
}

function showWinScreen(winner, winnerChars) {
    const winScreen = document.getElementById('win-screen');
    const winnerAnnouncement = document.getElementById('winner-announcement');
    const winnerCharacters = document.getElementById('winner-characters');
    
    // Set winner text and color
    winnerAnnouncement.textContent = `🏆 ${winner} WINS! 🏆`;
    winnerAnnouncement.style.color = winner.includes('BLUE') ? '#3b82f6' : '#ef4444';
    
    // Clone winner characters for the win screen
    const originalChars = document.querySelector(winnerChars);
    if (originalChars) {
        winnerCharacters.innerHTML = originalChars.innerHTML;
    }
    
    // Play crowd cheering sound
    playCrowdCheer();
    
    // Show win screen
    winScreen.classList.add('show');
}

function playAgain() {
    location.reload();
}

window.onload = init;


function showWin(team) {
  const winScreen = document.getElementById("win-screen");
  const title = document.getElementById("winner-announcement");
  const emojis = document.getElementById("winner-characters");

  title.innerText = team === "t1" ? "🎉 TEAM 1 WINS! 🎉" : "🔥 TEAM 2 WINS! 🔥";
  emojis.innerHTML = "🥳🎊🔥💪🎉🏆✨";

  winScreen.classList.add("show");

  // 🔊 PLAY SOUND
  document.getElementById("win-sound").play();

  createConfetti();
  createFireworks();
}

function createFireworks() {
  const container = document.getElementById("win-screen");

  for (let i = 0; i < 10; i++) {
    let fw = document.createElement("div");
    fw.classList.add("firework");

    fw.style.top = Math.random() * 80 + "%";
    fw.style.left = Math.random() * 100 + "%";
    fw.style.boxShadow = `
      0 0 10px red,
      0 0 20px yellow,
      0 0 30px cyan
    `;

    container.appendChild(fw);

    setTimeout(() => fw.remove(), 1000);
  }
}