// Game Configuration - CUSTOMIZE THESE VALUES
const CONFIG = {
    // The clues that will be displayed
    clues: [
        "Where we had our first coffee date, look under the cushion of memories.",
        "The place where you keep your favorite book, check page 42.",
        "Where we dance in the kitchen, behind the spice jar labeled 'Love'.",
        "The drawer where socks disappear, one has returned with a message."
    ],

    // The letters found at each location (used for validation)
    expectedLetters: ['L', 'O', 'V', 'E'], // Change these to your actual letters

    // The correct order for the final code
    correctCode: 'LOVE', // Change this to your desired code

    // The morse code message for the final clue
    morseMessage: 'LOVE YOU'
};

// Morse code dictionary
const MORSE_CODE = {
    'A': '.-',    'B': '-...',  'C': '-.-.',  'D': '-..',   'E': '.',
    'F': '..-.',  'G': '--.',   'H': '....',  'I': '..',    'J': '.---',
    'K': '-.-',   'L': '.-..',  'M': '--',    'N': '-.',    'O': '---',
    'P': '.--.',  'Q': '--.-',  'R': '.-.',   'S': '...',   'T': '-',
    'U': '..-',   'V': '...-',  'W': '.--',   'X': '-..-',  'Y': '-.--',
    'Z': '--..',  ' ': '/',     '0': '-----', '1': '.----', '2': '..---',
    '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
    '8': '---..', '9': '----.'
};

class PuzzleGame {
    constructor() {
        this.currentScreen = 'welcome';
        this.stream = null;
        this.collectedLetters = [];
    }

    startGame() {
        this.showScreen('camera');
        this.initCamera();
    }

    showScreen(screenName) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show the requested screen
        const screen = document.getElementById(screenName + 'Screen');
        if (screen) {
            screen.classList.add('active');
            this.currentScreen = screenName;
        }
    }

    async initCamera() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: false
            });
            const video = document.getElementById('video');
            video.srcObject = this.stream;
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Unable to access camera. Please make sure you have granted camera permissions.');
        }
    }

    capturePhoto() {
        const video = document.getElementById('video');
        const canvas = document.getElementById('canvas');
        const countdown = document.getElementById('countdown');

        let count = 3;
        countdown.textContent = count;

        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                countdown.textContent = count;
            } else {
                countdown.textContent = '';
                clearInterval(countdownInterval);

                // Capture the photo
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');

                // Flip the image horizontally to match the video mirror
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
                ctx.drawImage(video, 0, 0);

                // Display the captured photo in the profile picture
                const profileImg = document.getElementById('profileImg');
                profileImg.src = canvas.toDataURL('image/png');
                document.getElementById('profilePicture').classList.remove('hidden');

                // Stop the video stream
                if (this.stream) {
                    this.stream.getTracks().forEach(track => track.stop());
                }

                // Move to first clue
                this.showClue(1);
            }
        }, 1000);
    }

    showClue(clueNumber) {
        // Set the clue text
        document.getElementById(`clue${clueNumber}Text`).textContent = CONFIG.clues[clueNumber - 1];

        // Show the clue screen
        this.showScreen(`clue${clueNumber}`);

        // Focus on the input
        setTimeout(() => {
            document.getElementById(`letter${clueNumber}Input`).focus();
        }, 100);
    }

    checkLetter(clueNumber) {
        const input = document.getElementById(`letter${clueNumber}Input`);
        const letter = input.value.toUpperCase().trim();
        const errorDiv = document.getElementById(`error${clueNumber}`);

        if (!letter) {
            errorDiv.textContent = 'Please enter a letter!';
            return;
        }

        if (letter === CONFIG.expectedLetters[clueNumber - 1]) {
            errorDiv.textContent = '';
            this.collectedLetters.push(letter);

            // Move to next clue or code entry
            if (clueNumber < 4) {
                this.showClue(clueNumber + 1);
            } else {
                this.showCodeEntry();
            }
        } else {
            errorDiv.textContent = 'That\'s not the right letter. Check your clue again!';
            input.value = '';
        }
    }

    showCodeEntry() {
        this.showScreen('code');

        // Auto-focus and auto-advance between code boxes
        const codeBoxes = [
            document.getElementById('code1'),
            document.getElementById('code2'),
            document.getElementById('code3'),
            document.getElementById('code4')
        ];

        codeBoxes.forEach((box, index) => {
            box.addEventListener('input', (e) => {
                if (e.target.value.length === 1 && index < 3) {
                    codeBoxes[index + 1].focus();
                }
            });

            box.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
                    codeBoxes[index - 1].focus();
                }
            });
        });

        codeBoxes[0].focus();
    }

    checkCode() {
        const code1 = document.getElementById('code1').value.toUpperCase();
        const code2 = document.getElementById('code2').value.toUpperCase();
        const code3 = document.getElementById('code3').value.toUpperCase();
        const code4 = document.getElementById('code4').value.toUpperCase();
        const enteredCode = code1 + code2 + code3 + code4;
        const errorDiv = document.getElementById('codeError');

        if (enteredCode.length !== 4) {
            errorDiv.textContent = 'Please enter all 4 letters!';
            return;
        }

        if (enteredCode === CONFIG.correctCode) {
            errorDiv.textContent = '';
            this.showMorseCode();
        } else {
            errorDiv.textContent = 'Incorrect code! Try arranging the letters differently.';
            // Clear the inputs
            document.getElementById('code1').value = '';
            document.getElementById('code2').value = '';
            document.getElementById('code3').value = '';
            document.getElementById('code4').value = '';
            document.getElementById('code1').focus();
        }
    }

    showMorseCode() {
        this.showScreen('morse');

        // Convert message to morse code
        const message = CONFIG.morseMessage.toUpperCase();
        const morseSequence = [];

        for (let char of message) {
            if (MORSE_CODE[char]) {
                const morse = MORSE_CODE[char];
                for (let symbol of morse) {
                    if (symbol === '.') {
                        morseSequence.push({ type: 'on', duration: 200 });  // dot
                        morseSequence.push({ type: 'off', duration: 200 }); // gap
                    } else if (symbol === '-') {
                        morseSequence.push({ type: 'on', duration: 600 });  // dash
                        morseSequence.push({ type: 'off', duration: 200 }); // gap
                    } else if (symbol === '/') {
                        morseSequence.push({ type: 'off', duration: 600 }); // word gap
                    }
                }
                morseSequence.push({ type: 'off', duration: 600 }); // letter gap
            }
        }

        // Add longer pause before repeating
        morseSequence.push({ type: 'off', duration: 2000 });

        const circle = document.getElementById('morseCircle');
        let index = 0;

        const playMorse = () => {
            if (index >= morseSequence.length) {
                index = 0; // Loop the morse code
            }

            const current = morseSequence[index];

            if (current.type === 'on') {
                circle.classList.add('on');
            } else {
                circle.classList.remove('on');
            }

            index++;
            setTimeout(playMorse, current.duration);
        };

        // Start playing morse code after a brief delay
        setTimeout(() => {
            playMorse();

            // Show the decoded message after a few seconds
            setTimeout(() => {
                const messageDiv = document.getElementById('morseMessage');
                messageDiv.innerHTML = `<p>The message is:</p><h2>${CONFIG.morseMessage}</h2><p>Happy Birthday! 🎉</p>`;
                messageDiv.classList.add('show');
            }, 5000);
        }, 1000);
    }
}

// Initialize the game
const game = new PuzzleGame();

// Handle Enter key for inputs
document.addEventListener('DOMContentLoaded', () => {
    // Letter inputs
    for (let i = 1; i <= 4; i++) {
        const input = document.getElementById(`letter${i}Input`);
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    game.checkLetter(i);
                }
            });
        }
    }

    // Code inputs
    const codeBoxes = ['code1', 'code2', 'code3', 'code4'];
    codeBoxes.forEach(boxId => {
        const box = document.getElementById(boxId);
        if (box) {
            box.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    game.checkCode();
                }
            });
        }
    });
});
