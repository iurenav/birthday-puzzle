// Game Configuration - CUSTOMIZE THESE VALUES
const CONFIG = {
    // The clues that will be displayed
    clues: [
        "Delicious and rich, what a treat I am! It’s cold, here inside this little can.",
        "Yucky yucky, not in there! Behind it, is where you should stare.",
        "A sturdy frame, with a great load to bear. Look to the pane, the lil’ turt’ in the air.",
        "A queens quarters, lie in abandon. Her hindquarters, I’d love to keep my hand in"
    ],

    // The letters found at each location (used for validation)
    expectedLetters: ['i', 'A', 'e', 'I'], // Change these to your actual letters

    // The correct order for the final code
    correctCode: 'IAie', // Change this to your desired code

    // The morse code message for the final clue
    morseMessage: 'ZG25'
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
        const letter = input.value.trim();
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
            errorDiv.textContent = 'That\'s not the right letter. Check your clue again! ⚰️';
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
        const code1 = document.getElementById('code1').value;
        const code2 = document.getElementById('code2').value;
        const code3 = document.getElementById('code3').value;
        const code4 = document.getElementById('code4').value;
        const enteredCode = code1 + code2 + code3 + code4;
        const errorDiv = document.getElementById('codeError');

        if (enteredCode.length !== 4) {
            errorDiv.textContent = 'Please enter all 4 letters! 👻';
            return;
        }

        if (enteredCode === CONFIG.correctCode) {
            errorDiv.textContent = '';
            this.showMorseCode();
        } else {
            errorDiv.textContent = 'Incorrect code! Try arranging the letters differently. 🧛';
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
        this.morseSequence = this.buildMorseSequence();

        // Play morse code after a brief delay
        setTimeout(() => {
            this.playMorseSequence();
        }, 1000);
    }

    buildMorseSequence() {
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
                morseSequence.push({ type: 'off', duration: 1600 }); // letter gap
            }
        }

        return morseSequence;
    }

    playMorseSequence() {
        const circle = document.getElementById('morseCircle');
        let index = 0;

        const playNext = () => {
            if (index >= this.morseSequence.length) {
                // Morse code finished, show controls
                circle.classList.remove('on');
                document.getElementById('morseControls').classList.remove('hidden');

                // Setup auto-advance for morse code inputs
                this.setupMorseInputs();
                return;
            }

            const current = this.morseSequence[index];

            if (current.type === 'on') {
                circle.classList.add('on');
            } else {
                circle.classList.remove('on');
            }

            index++;
            setTimeout(playNext, current.duration);
        };

        playNext();
    }

    replayMorse() {
        // Hide controls temporarily
        document.getElementById('morseControls').classList.add('hidden');

        // Play the sequence again
        setTimeout(() => {
            this.playMorseSequence();
        }, 500);
    }

    setupMorseInputs() {
        const morseBoxes = [
            document.getElementById('morseCode1'),
            document.getElementById('morseCode2'),
            document.getElementById('morseCode3'),
            document.getElementById('morseCode4')
        ];

        morseBoxes.forEach((box, index) => {
            box.addEventListener('input', (e) => {
                if (e.target.value.length === 1 && index < 3) {
                    morseBoxes[index + 1].focus();
                }
            });

            box.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
                    morseBoxes[index - 1].focus();
                }
                if (e.key === 'Enter') {
                    this.checkMorseCode();
                }
            });
        });

        morseBoxes[0].focus();
    }

    checkMorseCode() {
        const code1 = document.getElementById('morseCode1').value;
        const code2 = document.getElementById('morseCode2').value;
        const code3 = document.getElementById('morseCode3').value;
        const code4 = document.getElementById('morseCode4').value;
        const enteredCode = code1 + code2 + code3 + code4;
        const errorDiv = document.getElementById('morseError');

        if (enteredCode.length !== 4) {
            errorDiv.textContent = 'Please enter all 4 characters! 👻';
            return;
        }

        if (enteredCode === CONFIG.morseMessage) {
            errorDiv.textContent = '';
            this.showFinalReveal();
        } else {
            errorDiv.textContent = 'Incorrect code! Try again. 🧛';
            document.getElementById('morseCode1').value = '';
            document.getElementById('morseCode2').value = '';
            document.getElementById('morseCode3').value = '';
            document.getElementById('morseCode4').value = '';
            document.getElementById('morseCode1').focus();
        }
    }

    showFinalReveal() {
        // Switch to final screen
        this.showScreen('final');

        // Copy the profile picture
        const profileSrc = document.getElementById('profileImg').src;
        document.getElementById('finalProfileImg').src = profileSrc;

        // Start the sequence
        setTimeout(() => {
            // Show Star Wars scroll
            document.getElementById('scrollText').classList.remove('hidden');

            // After scroll animation (20 seconds), show profile
            setTimeout(() => {
                document.getElementById('scrollText').classList.add('hidden');
                const profileReveal = document.getElementById('profileReveal');
                profileReveal.classList.remove('hidden');
                profileReveal.classList.add('show');

                // After 3 seconds, show code reveal
                setTimeout(() => {
                    profileReveal.classList.remove('show');
                    const codeReveal = document.getElementById('codeReveal');
                    codeReveal.classList.remove('hidden');
                    codeReveal.classList.add('show');

                    // After letters appear (2 seconds), wait 10 seconds, then show bat button
                    setTimeout(() => {
                        // Hide the code reveal text
                        codeReveal.classList.add('hidden');

                        const batButton = document.getElementById('batButton');
                        batButton.classList.remove('hidden');
                        batButton.classList.add('show');
                    }, 12000); // 2s for letters + 10s pause
                }, 3000);
            }, 20000);
        }, 500);
    }

    revealTokyo() {
        // Hide everything else
        document.getElementById('batButton').classList.add('hidden');
        document.getElementById('batButton').classList.remove('show');
        document.getElementById('codeReveal').classList.add('hidden');
        document.getElementById('codeReveal').classList.remove('show');

        // Show Tokyo reveal
        const tokyoReveal = document.getElementById('tokyoReveal');
        tokyoReveal.classList.remove('hidden');
        tokyoReveal.classList.add('show');

        // Reveal words one by one with dramatic pauses
        const words = ['word1', 'word2', 'word3', 'word4'];
        const delays = [0, 1000, 2000, 4000]; // Extra pause before "TOKYO!"

        words.forEach((wordId, index) => {
            setTimeout(() => {
                document.getElementById(wordId).classList.add('show');
            }, delays[index]);
        });
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
