// script.js
let currentAudio = null;

function playSound(name) {
    if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    }
    currentAudio = new Audio(`sounds/${name}.mp3`);
    currentAudio.play();
}

function stopSound() {
    if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
    }
}

document.addEventListener("DOMContentLoaded", () => {
  // stop以外の全てのボタンを対象
    const buttons = document.querySelectorAll("button:not(#stp)");
    buttons.forEach(btn => {
    btn.addEventListener("click", () => {
    const name = btn.textContent.trim();
    playSound(name);
    });
    });

    const stopBtn = document.getElementById("stp");
    if (stopBtn) {
    stopBtn.addEventListener("click", stopSound);
    }
});