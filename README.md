# No Secreto

No Secreto is a browser-based cryptographic decryption game. Pick a difficulty, enter a codename, and solve a series of encrypted messages before the timer or your lives run out.

This project was inspired by Chapter 8 of Kenneth Rosen's number theory textbook for UT Austin's M 328K class.

## Files

- `no_secreto.html` contains the page structure and screen markup.
- `styles.css` contains the visual design, layout, animations, and responsive styling.
- `app.js` contains the cipher implementations, game state, timer, tools, and leaderboard logic.
- `messages.json` contains the sentence dataset used for encryption and decryption prompts.
- `leaderboard.json` can provide starter leaderboard records and matches the export format.

## Running

Serve the folder with any static file server:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080/no_secreto.html`.

The app loads `messages.json` and `leaderboard.json` from JavaScript, so serving the folder is recommended. Some browsers block loading local JSON files when opening `no_secreto.html` directly.

## Gameplay

- Choose one of four difficulties: Cadet, Agent, Operative, or Extreme.
- Timers are set to 240 seconds for Cadet, 180 seconds for Agent, 120 seconds for Operative, and 90 seconds for Extreme.
- Decrypt each message and submit the plaintext.
- Spaces are ignored when checking answers.
- Hints and analysis tools are available during each mission.
- Messages are drawn from a shuffled sentence dataset so each mission feels less predictable.
- You can edit `messages.json` to add, remove, or revise the sentences used by the game.
- Leaderboard records are stored locally in the browser with `localStorage` and displayed in separate boards for each difficulty.
- The leaderboard screen can export current records as `leaderboard.json`.
- You can edit `leaderboard.json` to provide starter scores, but a static browser page cannot silently write back to that file without a backend.

## Roadmap

I plan to move the project to a platform that can support real-time versus play, where two or more players can race to decrypt the same challenge. Another planned mode is one player encrypting a message while another player decrypts it within a time limit.

## Notes

This project is intentionally dependency-free. It uses plain HTML, CSS, and JavaScript, plus Google Fonts loaded from the page header.
