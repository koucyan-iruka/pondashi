// script.js
let currentAudio = null;
let seekBar = null;
let seekBarInterval = null;
let timeLeftLabel = null;
const SEEK_UPDATE_MS = 200;
const inputRange = document.getElementById("inputRange");
const activeColor = "#0079b8";
const inactiveColor = "#e4e4e4";

function formatTime(sec) {
    if (!isFinite(sec)) return "--:--";
    sec = Math.max(0, Math.floor(sec));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function playSound(name) {
    // 既存の再生を停止・後始末
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio.removeEventListener('ended', clearSeekBar);
    }
    clearSeekBar();

    // 新しい音源を作成
    currentAudio = new Audio(`sounds/${name}.mp3`);

    // メタデータ読み込み後にシークバーを有効化
    currentAudio.addEventListener('loadedmetadata', () => {
        if (!seekBar) return;
        seekBar.max = currentAudio.duration || 0;
        seekBar.value = 0;
        seekBar.disabled = false;
        if (timeLeftLabel) {
            timeLeftLabel.textContent = formatTime(currentAudio.duration);
        }
    }, { once: true });

    // 再生位置の反映（一定間隔）
    if (seekBarInterval) {
        clearInterval(seekBarInterval);
        seekBarInterval = null;
    }
    if (seekBar) {
        seekBarInterval = setInterval(() => {
            if (currentAudio && !currentAudio.paused) {
                seekBar.value = currentAudio.currentTime;
                if (timeLeftLabel && isFinite(currentAudio.duration)) {
                    timeLeftLabel.textContent = formatTime(currentAudio.duration - currentAudio.currentTime);
                }
            }
        }, SEEK_UPDATE_MS);

        // ユーザー操作でシーク
        seekBar.oninput = function () {
            if (currentAudio) {
                currentAudio.currentTime = Number(seekBar.value);
                if (timeLeftLabel && isFinite(currentAudio.duration)) {
                    timeLeftLabel.textContent = formatTime(currentAudio.duration - currentAudio.currentTime);
                }
            }
        };
    }

    // 再生終了時
    currentAudio.addEventListener('ended', clearSeekBar);

    // 再生開始
    currentAudio.play();
}

function stopSound() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio.removeEventListener('ended', clearSeekBar);
        currentAudio = null;
    }
    clearSeekBar();
}

function setupSeekBar() {
    if (!seekBar) return;

    // 初期無効化
    seekBar.min = 0;
    seekBar.value = 0;
    seekBar.max = 0;
    seekBar.disabled = true;
    if (timeLeftLabel) timeLeftLabel.textContent = "--:--";

    // 既存のインターバルを停止
    if (seekBarInterval) {
        clearInterval(seekBarInterval);
        seekBarInterval = null;
    }

    // 現在音源がある場合は、メタデータ取得を待ってから有効化
    if (currentAudio) {
        if (!isNaN(currentAudio.duration) && currentAudio.duration > 0) {
            seekBar.max = currentAudio.duration;
            seekBar.disabled = false;
            if (timeLeftLabel) timeLeftLabel.textContent = formatTime(currentAudio.duration - (currentAudio.currentTime || 0));
        } else {
            currentAudio.addEventListener('loadedmetadata', () => {
                seekBar.max = currentAudio.duration || 0;
                seekBar.disabled = false;
                if (timeLeftLabel) timeLeftLabel.textContent = formatTime(currentAudio.duration);
            }, { once: true });
        }

        seekBarInterval = setInterval(() => {
            if (currentAudio && !currentAudio.paused) {
                seekBar.value = currentAudio.currentTime;
                if (timeLeftLabel && isFinite(currentAudio.duration)) {
                    timeLeftLabel.textContent = formatTime(currentAudio.duration - currentAudio.currentTime);
                }
            }
        }, SEEK_UPDATE_MS);

        seekBar.oninput = function () {
            if (currentAudio) {
                currentAudio.currentTime = Number(seekBar.value);
                if (timeLeftLabel && isFinite(currentAudio.duration)) {
                    timeLeftLabel.textContent = formatTime(currentAudio.duration - currentAudio.currentTime);
                }
            }
        };

        currentAudio.addEventListener('ended', clearSeekBar);
    }
}

function clearSeekBar() {
    if (seekBarInterval) {
        clearInterval(seekBarInterval);
        seekBarInterval = null;
    }
    if (seekBar) {
        seekBar.value = 0;
        seekBar.max = 0;
        seekBar.disabled = true;
        seekBar.oninput = null;
    }
    if (timeLeftLabel) timeLeftLabel.textContent = "--:--";
}

document.addEventListener("DOMContentLoaded", () => {
    // stop 以外の全てのボタンを対象
    const buttons = document.querySelectorAll("button:not(#stp)");
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            const name = btn.textContent.trim();
            playSound(name);
        });
    });

    // stop ボタン
    const stopBtn = document.getElementById("stp");
    if (stopBtn) {
        stopBtn.addEventListener("click", stopSound);
    }

    // シークバー要素の取得（なければ自動生成して stop ボタンの直後に挿入）
    seekBar = document.getElementById("seekBar");
    if (!seekBar) {
        seekBar = document.createElement("input");
        seekBar.type = "range";
        seekBar.id = "seekBar";
        seekBar.step = "0.01"; // 細かくシーク
        seekBar.value = 0;
        seekBar.disabled = true;
        if (stopBtn && stopBtn.parentNode) {
            stopBtn.parentNode.insertBefore(seekBar, stopBtn.nextSibling);
        } else {
            document.body.appendChild(seekBar);
        }
    }

    // 残り時間の表示要素を取得（無ければ作成）
    timeLeftLabel = document.getElementById("timeLeft");
    if (!timeLeftLabel) {
        timeLeftLabel = document.createElement("span");
        timeLeftLabel.id = "timeLeft";
        timeLeftLabel.textContent = "--:--";
        if (seekBar && seekBar.parentNode) {
            seekBar.insertAdjacentElement('afterend', timeLeftLabel);
        } else {
            document.body.appendChild(timeLeftLabel);
        }
    }

    // 初期化
    setupSeekBar();
});

inputRange.addEventListener("input", function() {
    const ratio = (this.value - this.min) / (this.max - this.min) * 100;
    this.style.background = `linear-gradient(90deg, ${activeColor} ${ratio}%, ${inactiveColor} ${ratio}%)`;
});