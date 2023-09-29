const cards = [
    'https://storage.cloud.google.com/memory-game/WhatsApp%20Image%202023-09-29%20at%2011.23.54.jpeg', 
    'https://storage.cloud.google.com/memory-game/WhatsApp%20Image%202023-09-29%20at%2011.22.20.jpeg',
    'https://storage.cloud.google.com/memory-game/WhatsApp%20Image%202023-09-29%20at%2011.19.54.jpeg',
    'https://storage.cloud.google.com/memory-game/WhatsApp%20Image%202023-09-29%20at%2011.18.49.jpeg',
    'https://storage.cloud.google.com/memory-game/IMG_2262.jpg',
    'https://storage.cloud.google.com/memory-game/IMG_2659.jpg',
    'https://storage.cloud.google.com/memory-game/IMG_4451.jpg',
    'https://storage.cloud.google.com/memory-game/IMG_9762.jpg'
];

const gameBoard = document.getElementById('game-board');
const timerElement = document.getElementById('timer');
const restartButton = document.getElementById('restart-button');
const startButton = document.getElementById('start-button');
const showStatsButton = document.getElementById('show-stats-button');
const statsContainer = document.getElementById('stats-container');
const bestScoreElement = document.getElementById('best-score');
const averageScoreElement = document.getElementById('average-score');
let selectedCards = [];
let elapsedTime = 0;
let timerInterval;
let isLocked = false; // Variable de verrouillage

// Fonction pour stocker un score dans un cookie
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = name + '=' + value + ';expires=' + expires.toUTCString();
}

// Fonction pour récupérer la valeur d'un cookie
function getCookie(name) {
    const keyValue = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return keyValue ? keyValue[2] : null;
}

// Fonction pour calculer la moyenne d'un tableau de nombres
function calculateAverage(scores) {
    const total = scores.reduce((sum, score) => sum + score, 0);
    return total / scores.length;
}

// Fonction pour mettre à jour les statistiques
function updateStats() {
    const savedScores = getCookie('memory-scores');
    if (savedScores) {
        const scoresArray = JSON.parse(savedScores);
        const bestScore = Math.min(...scoresArray);
        const averageScore = calculateAverage(scoresArray);
        bestScoreElement.textContent = bestScore + ' second(s)';
        averageScoreElement.textContent = averageScore.toFixed(2) + ' second(s)';
    } else {
        bestScoreElement.textContent = 'Aucun score enregistré';
        averageScoreElement.textContent = 'N/A';
    }
}

function createCard(CardUrl) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.value = CardUrl;
    card.addEventListener('click', onCardClick);
  
    const cardContent = document.createElement('img');
    cardContent.classList.add('card-content');
    cardContent.src = CardUrl;

    card.style.maxWidth = '100%';
    card.style.maxHeight = '100%';
    
    card.appendChild(cardContent);
    return card;
}

function startTimer() {
    timerInterval = setInterval(function () {
        elapsedTime++;
        timerElement.textContent = elapsedTime + ' second(s)';
    }, 1000); // Update the timer every 1000 milliseconds (1 second)
}

function stopTimer() {
    clearInterval(timerInterval);
}

function duplicateArray(arraySimple) {
    let arrayDouble = [];
    arrayDouble.push(...arraySimple);
    arrayDouble.push(...arraySimple);
    return arrayDouble;
}

function shuffleArray(arrayToshuffle) {
    const arrayShuffled = arrayToshuffle.sort(() => 0.5 - Math.random());
    return arrayShuffled;
}

function onCardClick(e) {
    // Si le jeu est verrouillé, ne réagissez pas au clic
    if (isLocked) {
        return;
    }

    const card = e.target.parentElement;
    card.classList.add("flip");

    selectedCards.push(card);

    if (selectedCards.length == 2) {
        // Verrouillez le jeu pendant la seconde d'attente
        isLocked = true;

        setTimeout(() => {
            if (selectedCards[0].dataset.value == selectedCards[1].dataset.value) {
                // on a trouvé une paire
                selectedCards[0].classList.add("matched");
                selectedCards[1].classList.add("matched");
                selectedCards[0].removeEventListener('click', onCardClick);
                selectedCards[1].removeEventListener('click', onCardClick);

                // Déverrouillez le jeu
                isLocked = false;

                // Vérifiez si le joueur a gagné
                const allCardNotFinded = document.querySelectorAll('.card:not(.matched)');
                if (allCardNotFinded.length == 0) {
                    // Le joueur a gagné
                    stopTimer(); // Stop the timer when the game is won
                    alert('Bravo, vous avez gagné !\nVotre temps : ' + elapsedTime + ' secondes');

                    // Récupérez les scores précédents depuis le cookie
                    const savedScores = getCookie('memory-scores') || '[]';
                    const scoresArray = JSON.parse(savedScores);

                    // Ajoutez le nouveau score au tableau
                    scoresArray.push(elapsedTime);

                    // Stockez le tableau mis à jour dans le cookie
                    setCookie('memory-scores', JSON.stringify(scoresArray), 365);

                    // Mettez à jour les statistiques
                    updateStats();
                }
            } else {
                // on s'est trompé
                selectedCards[0].classList.remove("flip");
                selectedCards[1].classList.remove("flip");

                // Déverrouillez le jeu
                isLocked = false;
            }

            selectedCards = [];
        }, 1000);
    }
}

function restartGame() {
    // Réinitialisez les cartes
    gameBoard.innerHTML = '';
    selectedCards = [];
    elapsedTime = 0;
    timerElement.textContent = '0 second(s)';
    isLocked = false;

    // Mélangez et recréez les cartes
    let allCards = duplicateArray(cards);
    allCards = shuffleArray(allCards);
    allCards.forEach(card => {
        const cardHtml = createCard(card);
        gameBoard.appendChild(cardHtml);
    });

    // Commencez le chronomètre
    startTimer();
}

// Écouteur de clic pour le bouton de redémarrage
restartButton.addEventListener('click', restartGame);

// Écouteur de clic pour le bouton de nouvelle partie
startButton.addEventListener('click', () => {
    restartGame();
    showStatsButton.disabled = true;
});

// Écouteur de clic pour le bouton d'affichage des statistiques
