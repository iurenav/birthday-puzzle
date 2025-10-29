# Birthday Puzzle Adventure Game

A personalized treasure hunt puzzle game for your wife's birthday!

## How to Customize

Open `game.js` and edit the `CONFIG` object at the top of the file:

```javascript
const CONFIG = {
    // Your 4 clues
    clues: [
        "Delicious and rich, what a treat I am! It's cold here, inside this little can.",
        "Yucky yucky, not in there! Behind it, is where you should stare.",
        "A sturdy frame, with a great load to bear. Look to the pane, the lil' turt' in the air.",
        "A queens quarters, lie in abandon. Her hindquarters, I'd love to keep my hand in."
    ],

    // The letters she'll find (A-Z)
    expectedLetters: ['i', 'A', 'e', 'I'],

    // The correct code to unlock the final clue
    correctCode: 'IAie',

    // The morse code message
    morseMessage: 'ZG25'
};
```

## How to Deploy to GitHub Pages

### Option 1: Using GitHub Website (Easiest)

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon (top right) and select "New repository"
3. Name it `birthday-puzzle` (or any name you like)
4. Make it **Private** if you want to keep it secret!
5. Click "Create repository"
6. On the next page, click "uploading an existing file"
7. Drag and drop all three files: `index.html`, `styles.css`, and `game.js`
8. Click "Commit changes"
9. Go to Settings > Pages
10. Under "Source", select "main" branch
11. Click "Save"
12. Wait a minute, then your site will be live at: `https://YOUR-USERNAME.github.io/birthday-puzzle/`

### Option 2: Using Command Line

1. Open Terminal
2. Navigate to the game folder:
   ```bash
   cd /Users/ivanu/birthday-puzzle-game
   ```

3. Initialize git and push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Birthday puzzle game"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/birthday-puzzle.git
   git push -u origin main
   ```

4. Enable GitHub Pages:
   - Go to your repository on GitHub
   - Click Settings > Pages
   - Under "Source", select "main" branch
   - Click "Save"

5. Your site will be live at: `https://YOUR-USERNAME.github.io/birthday-puzzle/`

## Testing Locally

To test the game on your computer before deploying:

1. Open Terminal
2. Navigate to the game folder:
   ```bash
   cd /Users/ivanu/birthday-puzzle-game
   ```

3. Start a local server:
   ```bash
   python3 -m http.server 8000
   ```

4. Open your browser and go to: `http://localhost:8000`

**Note:** The camera feature requires HTTPS when deployed online. GitHub Pages automatically provides HTTPS, so it will work fine there!

## Game Flow

1. **Welcome Screen** - Introduction and start button
2. **Photo Capture** - Takes a photo with 3-second countdown
3. **Clue 1-4** - Each clue requires the correct letter to proceed
4. **Code Entry** - Must arrange the 4 letters in the correct order
5. **Morse Code** - Final clue revealed in morse code, then decoded text appears

## Tips

- Test the game yourself first before the big day!
- Make sure your phone/device has camera permissions enabled
- Keep the correct answers written down somewhere safe
- The morse code will loop continuously and show the decoded message after 5 seconds

Happy Birthday to your wife! 🎉
