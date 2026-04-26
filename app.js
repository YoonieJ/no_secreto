// Cipher implementations share a small interface:
// encrypt(plainText), getHint(), and getKey().

function randChoice(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

class CaesarCipher {
  constructor() {
    this.name = 'caesar';
    this.displayName = 'CAESAR CIPHER';
  }
  encrypt(text) {
    this._shift = Math.floor(Math.random() * 25) + 1;
    return text.replace(/[A-Z]/g, c =>
      String.fromCharCode((c.charCodeAt(0) - 65 + this._shift) % 26 + 65)
    );
  }
  getHint() {
    return `The shift key is between 1–25. This message uses shift ${this._shift}. Single-letter words are often A or I.`;
  }
  getKey() { return `Shift = ${this._shift}`; }
}

class AffineCipher {
  constructor() {
    this.name = 'affine';
    this.displayName = 'AFFINE CIPHER';
  }
  encrypt(text) {
    const validA = [1,3,5,7,9,11,15,17,19,21,23,25];
    this._a = randChoice(validA);
    this._b = Math.floor(Math.random() * 26);
    return text.replace(/[A-Z]/g, c =>
      String.fromCharCode((this._a * (c.charCodeAt(0) - 65) + this._b) % 26 + 65)
    );
  }
  getHint() {
    return `Formula: C ≡ aP + b (mod 26). Keys: a=${this._a}, b=${this._b}. Decrypt with: P ≡ a⁻¹(C − b) mod 26. Frequency analysis helps — E,T,A are the most common.`;
  }
  getKey() { return `a = ${this._a}, b = ${this._b}`; }
}

class Rot13Cipher {
  constructor() {
    this.name = 'rot13';
    this.displayName = 'ROT-13';
  }
  encrypt(text) {
    return text.replace(/[A-Z]/g, c =>
      String.fromCharCode((c.charCodeAt(0) - 65 + 13) % 26 + 65)
    );
  }
  getHint() {
    return 'ROT-13 is its own inverse — shift every letter by exactly 13 positions. N↔A, O↔B, P↔C... just apply the cipher again to decode.';
  }
  getKey() { return 'Shift = 13 (always fixed)'; }
}

class VigenereCipher {
  constructor() {
    this.name = 'vigenere';
    this.displayName = 'VIGENÈRE CIPHER';
  }
  encrypt(text) {
    const keywords = ['KEY','CODE','ALPHA','SIGMA','DELTA','OMEGA','ZETA','NOVA'];
    this._key = randChoice(keywords);
    let i = 0;
    return text.replace(/[A-Z]/g, c => {
      const shift = this._key[i % this._key.length].charCodeAt(0) - 65;
      i++;
      return String.fromCharCode((c.charCodeAt(0) - 65 + shift) % 26 + 65);
    });
  }
  getHint() {
    return `The keyword is "${this._key.length}" letters long. It repeats over the plaintext applying a different Caesar shift per position. Look for repeated patterns in the ciphertext.`;
  }
  getKey() { return `Keyword = "${this._key}"`; }
}

class AtbashCipher {
  constructor() {
    this.name = 'atbash';
    this.displayName = 'ATBASH CIPHER';
  }
  encrypt(text) {
    return text.replace(/[A-Z]/g, c =>
      String.fromCharCode(90 - (c.charCodeAt(0) - 65))
    );
  }
  getHint() {
    return 'Atbash reverses the alphabet mirror-style: A↔Z, B↔Y, C↔X. Apply the exact same cipher to the ciphertext — it decrypts itself.';
  }
  getKey() { return 'Mirror substitution: A↔Z, B↔Y, C↔X, ...'; }
}

class RailFenceCipher {
  constructor() {
    this.name = 'railfence';
    this.displayName = 'RAIL FENCE CIPHER';
    this._rails = 3;
  }
  encrypt(text) {
    const rails = Array.from({ length: this._rails }, () => []);
    let r = 0, dir = 1;
    for (const c of text) {
      if (c !== ' ') rails[r].push(c);
      r += dir;
      if (r === this._rails - 1 || r === 0) dir = -dir;
    }
    return rails.map(row => row.join('')).join('');
  }
  getHint() {
    return `3 rails used. Letters are written diagonally: positions cycle 0→1→2→1→0→1→2... Then read each rail left-to-right top to bottom.`;
  }
  getKey() { return 'Rails = 3'; }
}

class SubstitutionCipher {
  constructor() {
    this.name = 'substitution';
    this.displayName = 'MONO SUBSTITUTION';
  }
  encrypt(text) {
    const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const shuffled = shuffle(alpha);
    this._map = {};
    this._reverseMap = {};
    alpha.forEach((c, i) => {
      this._map[c] = shuffled[i];
      this._reverseMap[shuffled[i]] = c;
    });
    return text.replace(/[A-Z]/g, c => this._map[c]);
  }
  getHint() {
    return 'Use frequency analysis! In English: E T A O I N S R H L are most common. Single-letter words = A or I. Two-letter words: OF, TO, IN, IS, IT, BE, AS, AT...';
  }
  getKey() { return 'Random alphabet — use the FREQ TABLE tool to analyze letter distribution'; }
}

class ColumnarCipher {
  constructor() {
    this.name = 'columnar';
    this.displayName = 'COLUMNAR TRANSPOSITION';
  }
  encrypt(text) {
    const clean = text.replace(/ /g, '');
    this._cols = Math.min(4, Math.max(3, Math.ceil(clean.length / 4)));
    const rows = Math.ceil(clean.length / this._cols);
    this._rows = rows;
    const padded = clean.padEnd(rows * this._cols, 'X');
    const order = shuffle([...Array(this._cols).keys()]);
    this._order = order;
    let result = '';
    order.forEach(c => {
      for (let r = 0; r < rows; r++) result += padded[r * this._cols + c];
    });
    return result;
  }
  getHint() {
    return `${this._cols} columns used. Column read order: [${this._order.join(', ')}]. Each column has ${this._rows} characters. Rearrange columns to recover the plaintext.`;
  }
  getKey() { return `Cols = ${this._cols}, Order = [${this._order.join(', ')}]`; }
}

// Short explanations shown by the Cipher Info tool.

const CIPHER_DESCRIPTIONS = {
  caesar:       'Caesar Cipher: Each letter shifts by a fixed number in the alphabet. Original Roman military cipher. Decrypt by shifting backwards by the same key.',
  affine:       'Affine Cipher: C ≡ aP + b (mod 26). Two keys: multiplier a and shift b. gcd(a, 26) must equal 1. Find modular inverse of a to decrypt.',
  rot13:        'ROT-13: Special Caesar with fixed shift=13. Self-inverse — applying it twice restores original. Used in online forums to hide spoilers.',
  vigenere:     'Vigenère Cipher: A keyword repeats over the message, each character applying its own Caesar shift. Broken by finding keyword length using Kasiski examination.',
  atbash:       'Atbash Cipher: Ancient Hebrew cipher mirroring the alphabet (A↔Z, B↔Y...). Originally encrypted the Hebrew alphabet. Completely self-inverse.',
  railfence:    'Rail Fence Cipher: Plaintext is written in a zigzag across N rails, then read row by row. A transposition cipher — letters are rearranged, not substituted.',
  substitution: 'Monoalphabetic Substitution: Each letter maps to a unique other letter via a secret key alphabet. Vulnerable to frequency analysis — letter frequencies are preserved.',
  columnar:     'Columnar Transposition: Text written in rows across N columns, columns reordered by a key, then read top-to-bottom per column. Pure transposition — no substitution.'
};

// Difficulty controls the timer, number of rounds, hint budget, and cipher pool.

const DIFFICULTY_CONFIG = {
  easy: {
    time: 240, rounds: 3, hints: 3,
    ciphers: () => ['caesar', 'rot13', 'affine']
  },
  medium: {
    time: 180, rounds: 4, hints: 2,
    ciphers: () => ['vigenere', 'atbash', 'railfence', 'affine']
  },
  hard: {
    time: 120, rounds: 4, hints: 1,
    ciphers: () => ['substitution', 'columnar', 'railfence', 'vigenere']
  },
  extreme: {
    time: 90, rounds: 5, hints: 1,
    ciphers: () => {
      const pool = ['caesar','affine','vigenere','atbash','rot13','railfence','substitution','columnar'];
      return shuffle(pool);
    }
  }
};

const MESSAGE_DATASET_URL = 'messages.json';
const LEADERBOARD_URL = 'leaderboard.json';
const LEADERBOARD_STORAGE_KEY = 'ns_records';
const DIFFICULTY_ORDER = ['easy', 'medium', 'hard', 'extreme'];
const DIFFICULTY_LABELS = {
  easy: 'CADET',
  medium: 'AGENT',
  hard: 'OPERATIVE',
  extreme: 'EXTREME'
};
let MESSAGE_DATASET = [];
let LEADERBOARD_SEED = null;

async function loadMessageDataset() {
  if (MESSAGE_DATASET.length) return MESSAGE_DATASET;

  const res = await fetch(MESSAGE_DATASET_URL);
  if (!res.ok) throw new Error(`Could not load ${MESSAGE_DATASET_URL}`);

  const messages = await res.json();
  if (!Array.isArray(messages)) throw new Error(`${MESSAGE_DATASET_URL} must be a JSON array`);

  MESSAGE_DATASET = messages
    .map(message => String(message).trim().toUpperCase())
    .filter(Boolean);

  if (!MESSAGE_DATASET.length) throw new Error(`${MESSAGE_DATASET_URL} does not contain any messages`);
  return MESSAGE_DATASET;
}

function makeCipher(name) {
  const map = {
    caesar: CaesarCipher, affine: AffineCipher, rot13: Rot13Cipher,
    vigenere: VigenereCipher, atbash: AtbashCipher, railfence: RailFenceCipher,
    substitution: SubstitutionCipher, columnar: ColumnarCipher
  };
  return new (map[name] || CaesarCipher)();
}

// Runtime state is reset whenever a new mission starts.

let STATE = {};
let timerInterval = null;
let selectedDiff = 'easy';

function initState(diff) {
  const cfg = DIFFICULTY_CONFIG[diff];
  STATE = {
    diff, cfg,
    cipherNames: cfg.ciphers(),
    round: 0,
    totalRounds: cfg.rounds,
    timeLeft: cfg.time,
    maxTime: cfg.time,
    lives: 3,
    hintsLeft: cfg.hints,
    messageDeck: shuffle(MESSAGE_DATASET),
    playerName: '',
    currentCipher: null,
    currentPlain: '',
    currentEncrypted: '',
    attempts: 0,
    activeTool: null,
    roundStartTime: null,
    totalTimeUsed: 0,
    solved: 0,
    finalScore: 0,
    finalTimeLeft: 0
  };
}

function nextMessage() {
  if (!STATE.messageDeck.length) STATE.messageDeck = shuffle(MESSAGE_DATASET);
  return STATE.messageDeck.pop();
}

function loadRound() {
  const name = STATE.cipherNames[STATE.round % STATE.cipherNames.length];
  const cipher = makeCipher(name);
  const plain = nextMessage();
  const encrypted = cipher.encrypt(plain);

  STATE.currentCipher = cipher;
  STATE.currentPlain = plain.replace(/ /g, '');
  STATE.currentEncrypted = encrypted;
  STATE.attempts = 0;
  STATE.roundStartTime = Date.now();
  STATE.activeTool = null;

  document.getElementById('cipher-text').textContent = encrypted;
  document.getElementById('cipher-badge').textContent = cipher.displayName;
  document.getElementById('round-indicator').textContent = `${STATE.round + 1} / ${STATE.totalRounds}`;
  document.getElementById('round-progress').style.width = `${(STATE.round / STATE.totalRounds) * 100}%`;
  document.getElementById('answer-input').value = '';
  document.getElementById('attempt-log').innerHTML = '';
  document.getElementById('tool-area').innerHTML = '';
  document.getElementById('cipher-info-box').classList.add('hidden');
  document.getElementById('hint-count-label').textContent = `(${STATE.hintsLeft} hints left)`;
  renderLives();
  updateTimerRing();
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    STATE.timeLeft--;
    const timerEl = document.getElementById('timer-text');
    const ring = document.getElementById('timer-ring');
    timerEl.textContent = STATE.timeLeft;
    const pct = STATE.timeLeft / STATE.maxTime;
    ring.style.strokeDashoffset = 188.5 * (1 - pct);
    if (STATE.timeLeft <= 10) {
      ring.style.stroke = 'var(--danger)';
      timerEl.classList.add('pulse-danger');
    } else if (STATE.timeLeft <= 20) {
      ring.style.stroke = 'var(--accent2)';
      timerEl.classList.remove('pulse-danger');
    }
    if (STATE.timeLeft <= 0) {
      clearInterval(timerInterval);
      triggerGameOver('Time expired. The encryption was never broken.');
    }
  }, 1000);
}

function updateTimerRing() {
  const ring = document.getElementById('timer-ring');
  const timerEl = document.getElementById('timer-text');
  ring.style.stroke = 'var(--accent)';
  ring.style.strokeDashoffset = 188.5 * (1 - STATE.timeLeft / STATE.maxTime);
  timerEl.textContent = STATE.timeLeft;
  timerEl.classList.remove('pulse-danger');
}

function submitAnswer() {
  const input = document.getElementById('answer-input');
  const val = input.value.toUpperCase().replace(/\s/g, '');
  const plain = STATE.currentPlain.replace(/\s/g, '');
  if (!val) return;

  if (val === plain) {
    const elapsed = Math.round((Date.now() - STATE.roundStartTime) / 1000);
    STATE.totalTimeUsed += elapsed;
    STATE.solved++;
    flash('green');
    document.getElementById('attempt-log').innerHTML =
      `<span class="success-text">✓ CORRECT — well done, agent.</span>`;
    STATE.round++;
    if (STATE.round >= STATE.totalRounds) {
      clearInterval(timerInterval);
      setTimeout(() => showVictory(), 700);
    } else {
      setTimeout(() => loadRound(), 800);
    }
  } else {
    STATE.attempts++;
    STATE.lives--;
    flash('red');
    input.classList.add('shake');
    setTimeout(() => input.classList.remove('shake'), 400);
    document.getElementById('attempt-log').innerHTML =
      `<span>✗ Incorrect decryption — ${STATE.lives} ${STATE.lives === 1 ? 'life' : 'lives'} remaining</span>`;
    renderLives();
    if (STATE.lives <= 0) {
      clearInterval(timerInterval);
      setTimeout(() =>
        triggerGameOver(`All lives lost. The answer was: ${STATE.currentPlain}`), 400);
    }
  }
}

function triggerGameOver(reason) {
  document.getElementById('over-reason').textContent = reason;
  showScreen('screen-over');
}

async function showVictory() {
  const timeRemaining = STATE.timeLeft;
  const score = (timeRemaining * 10) + (STATE.solved * 50);
  STATE.finalScore = score;
  STATE.finalTimeLeft = timeRemaining;
  const safeName = escapeHtml(STATE.playerName);
  const safeDiff = escapeHtml(STATE.diff.toUpperCase());

  document.getElementById('victory-stats').innerHTML =
    `Agent: <span class="accent-text">${safeName}</span><br>` +
    `Difficulty: <span class="accent2-text">${safeDiff}</span><br>` +
    `Time Remaining: <span class="gold-text">${timeRemaining}s</span><br>` +
    `Rounds Solved: <span class="success-text">${STATE.solved} / ${STATE.totalRounds}</span><br>` +
    `Final Score: <span class="score-text">${score}</span>`;

  saveRecord();
  await loadLeaderboardSeed();
  const rank = getRank();
  document.getElementById('victory-rank').textContent =
    rank ? `${DIFFICULTY_LABELS[STATE.diff]} Leaderboard Rank: #${rank}` : '';

  showScreen('screen-victory');
}

function useHint() {
  if (STATE.hintsLeft <= 0) {
    document.getElementById('tool-area').innerHTML =
      `<div class="hint-panel danger-text">No hints remaining, agent. You are on your own.</div>`;
    return;
  }
  STATE.hintsLeft--;
  document.getElementById('hint-count-label').textContent = `(${STATE.hintsLeft} hints left)`;
  const hint = STATE.currentCipher.getHint();
  const key = STATE.currentCipher.getKey();
  document.getElementById('tool-area').innerHTML =
    `<div class="hint-panel">
      <span class="accent2-text"><strong>HINT:</strong></span> ${hint}
      <br><br>
      <span class="muted-text">Key Info: ${key}</span>
    </div>`;
  STATE.activeTool = 'hint';
}

function toggleTool(tool) {
  if (STATE.activeTool === tool) {
    STATE.activeTool = null;
    document.getElementById('tool-area').innerHTML = '';
    document.getElementById('cipher-info-box').classList.add('hidden');
    return;
  }
  STATE.activeTool = tool;
  document.getElementById('cipher-info-box').classList.add('hidden');
  if (tool === 'freq')         showFreqTable();
  else if (tool === 'index')   showIndexTable();
  else if (tool === 'cipher-info') showCipherInfo();
}

function showFreqTable() {
  const text = STATE.currentEncrypted;
  const freq = {};
  for (const c of text) if (/[A-Z]/.test(c)) freq[c] = (freq[c] || 0) + 1;
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  const maxF = sorted[0] ? sorted[0][1] : 1;

  let html = `<div class="section-label">frequency analysis — ciphertext</div><div class="freq-table">`;
  sorted.forEach(([c, n]) => {
    const bar = Math.max(1, Math.round((n / maxF) * 16));
    html += `<div class="freq-item">
      <div class="fchar">${c}</div>
      <div class="freq-bar">${'█'.repeat(bar)}</div>
      <div class="fcount">×${n}</div>
    </div>`;
  });
  html += `</div>`;
  html += `<div class="freq-note">
    English frequency order: <span class="accent2-text">E T A O I N S R H L D C U M F P G W Y B V K X J Q Z</span>
  </div>`;
  document.getElementById('tool-area').innerHTML = html;
}

function showIndexTable() {
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let html = `<div class="section-label">alphabet index table (A=0 … Z=25)</div>`;
  html += `<div class="index-grid">`;
  alpha.split('').forEach((c, i) => {
    html += `<div class="index-cell">
      <div class="index-letter">${c}</div>
      <div class="index-number">${i}</div>
    </div>`;
  });
  html += `</div>`;
  html += `<div class="index-note">
    Decrypt Caesar: P = (C − shift + 26) mod 26 &nbsp;|&nbsp; Affine: P = a⁻¹(C − b) mod 26
  </div>`;
  document.getElementById('tool-area').innerHTML = html;
}

function showCipherInfo() {
  const info = CIPHER_DESCRIPTIONS[STATE.currentCipher.name] || 'No information available.';
  const box = document.getElementById('cipher-info-box');
  box.textContent = info;
  box.classList.remove('hidden');
  document.getElementById('tool-area').innerHTML = '';
}

function flash(type) {
  const el = document.getElementById('flash');
  el.className = 'flash-overlay flash-' + type;
  el.style.opacity = '1';
  setTimeout(() => el.style.opacity = '0', 350);
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === 'screen-lb') renderLeaderboard();
}

function renderLives() {
  const el = document.getElementById('lives-display');
  el.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const d = document.createElement('div');
    d.className = 'life-dot' + (i >= STATE.lives ? ' dead' : '');
    el.appendChild(d);
  }
}

function selectDiff(d) {
  selectedDiff = d;
  document.querySelectorAll('.diff-card').forEach(c => {
    c.classList.toggle('selected', c.dataset.diff === d);
  });
}

async function startGame() {
  const name = document.getElementById('player-name').value.trim();
  const errEl = document.getElementById('intro-error');
  if (!name) { errEl.textContent = 'Enter your codename to begin, agent.'; return; }
  errEl.textContent = '';

  try {
    await loadMessageDataset();
  } catch (err) {
    errEl.textContent = 'Could not load messages.json. Start a local server and try again.';
    return;
  }

  initState(selectedDiff);
  STATE.playerName = name;

  showScreen('screen-game');
  loadRound();
  startTimer();
}

function restartGame() {
  clearInterval(timerInterval);
  showScreen('screen-intro');
}

function normalizeRecord(record) {
  return {
    name: String(record.name || 'UNKNOWN').slice(0, 20),
    diff: String(record.diff || 'easy').toLowerCase(),
    score: Number(record.score) || 0,
    timeLeft: Number(record.timeLeft) || 0,
    rounds: Number(record.rounds) || 0,
    date: String(record.date || '')
  };
}

function sortRecords(records) {
  return records.sort((a, b) => b.score - a.score);
}

function dedupeRecords(records) {
  const seen = new Set();
  return records.filter(record => {
    const key = [
      record.name,
      record.diff,
      record.score,
      record.timeLeft,
      record.rounds,
      record.date
    ].join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function loadLeaderboardSeed() {
  if (LEADERBOARD_SEED) return LEADERBOARD_SEED;

  try {
    const res = await fetch(LEADERBOARD_URL);
    if (!res.ok) throw new Error(`Could not load ${LEADERBOARD_URL}`);
    const records = await res.json();
    LEADERBOARD_SEED = Array.isArray(records) ? records.map(normalizeRecord) : [];
  } catch {
    LEADERBOARD_SEED = [];
  }

  return LEADERBOARD_SEED;
}

function getStoredRecords() {
  try {
    const records = JSON.parse(localStorage.getItem(LEADERBOARD_STORAGE_KEY) || '[]');
    return Array.isArray(records) ? records.map(normalizeRecord) : [];
  }
  catch { return []; }
}

function getRecords() {
  const seed = LEADERBOARD_SEED || [];
  return sortRecords(dedupeRecords([...seed, ...getStoredRecords()]));
}

function saveRecords(r) {
  try { localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(r)); } catch {}
}

function saveRecord() {
  const records = getStoredRecords();
  records.push({
    name: STATE.playerName,
    diff: STATE.diff,
    score: STATE.finalScore,
    timeLeft: STATE.finalTimeLeft,
    rounds: STATE.solved,
    date: new Date().toLocaleDateString()
  });
  const pruned = DIFFICULTY_ORDER.flatMap(diff =>
    sortRecords(records.filter(record => record.diff === diff)).slice(0, 20)
  );
  saveRecords(pruned);
}

function getRank() {
  const records = getRecords().filter(r => r.diff === STATE.diff);
  const idx = records.findIndex(r =>
    r.name === STATE.playerName && r.score === STATE.finalScore
  );
  return idx >= 0 ? idx + 1 : null;
}

async function renderLeaderboard() {
  await loadLeaderboardSeed();
  const records = getRecords();
  const el = document.getElementById('lb-content');
  let html = '';
  DIFFICULTY_ORDER.forEach(diff => {
    const diffRecords = records.filter(r => r.diff === diff).slice(0, 10);
    const label = DIFFICULTY_LABELS[diff];
    html += `<section class="leaderboard-section">
      <div class="leaderboard-section-title lb-diff lb-diff-${diff}">${label}</div>
      <div class="leaderboard-shell">
        <div class="lb-row header">
          <div>#</div><div>Agent</div><div>Score</div><div>Time</div>
        </div>`;

    if (!diffRecords.length) {
      html += `<div class="mono leaderboard-empty leaderboard-empty-compact">
        No ${label.toLowerCase()} records yet.
      </div>`;
    } else {
      diffRecords.forEach((r, i) => {
        const rankClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : '';
        const safeName = escapeHtml(r.name);
        html += `<div class="lb-row">
          <div class="${rankClass}">${i + 1}</div>
          <div>${safeName}</div>
          <div class="gold-text">${r.score}</div>
          <div>${r.timeLeft}s</div>
        </div>`;
      });
    }

    html += `</div></section>`;
  });
  el.innerHTML = html;
}

function clearLeaderboard() {
  if (confirm('Clear all leaderboard records?')) {
    localStorage.removeItem(LEADERBOARD_STORAGE_KEY);
    renderLeaderboard();
  }
}

async function exportLeaderboardJson() {
  await loadLeaderboardSeed();
  const json = JSON.stringify(getRecords(), null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'leaderboard.json';
  link.click();
  URL.revokeObjectURL(url);
}

function bindEvents() {
  document.querySelectorAll('.diff-card[data-diff]').forEach(card => {
    card.addEventListener('click', () => selectDiff(card.dataset.diff));
  });

  document.getElementById('start-game-btn').addEventListener('click', startGame);
  document.getElementById('submit-answer-btn').addEventListener('click', submitAnswer);
  document.getElementById('answer-input').addEventListener('keydown', event => {
    if (event.key === 'Enter') submitAnswer();
  });

  document.getElementById('btn-hint').addEventListener('click', useHint);
  document.querySelectorAll('[data-tool]').forEach(button => {
    button.addEventListener('click', () => toggleTool(button.dataset.tool));
  });
  document.querySelectorAll('[data-screen]').forEach(button => {
    button.addEventListener('click', () => showScreen(button.dataset.screen));
  });
  document.querySelectorAll('[data-action="restart"]').forEach(button => {
    button.addEventListener('click', restartGame);
  });
  document.getElementById('clear-records-btn').addEventListener('click', clearLeaderboard);
  document.getElementById('export-records-btn').addEventListener('click', exportLeaderboardJson);
}

bindEvents();
