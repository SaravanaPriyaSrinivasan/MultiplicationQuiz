let operand1, operand2, answer, totalPoints = 0, maxPoints = 0, currentQuestion = 0, attempts = 0, recentQuestions = [], totalQuestions = 10;
const QUESTION_SEQUENCE = [
    { type: 'Level 1', limit: 1, points: 1, questionsAsked: 0 },
    { type: 'Level 2', limit: 2, points: 2, questionsAsked: 0 },
    { type: 'Level 3', limit: 1, points: 3, questionsAsked: 0 },
    { type: 'Level 4', limit: 2, points: 4, questionsAsked: 0 },
    { type: 'Level 5', limit: 2, points: 5, questionsAsked: 0 },
	{ type: 'Level 6', limit: 2, points: 6, questionsAsked: 0 }
];
let currentCategory = 0;
document.getElementById('totalQuestions').textContent = `${totalQuestions}`;

let timerInterval;
let timeElapsed = 0;
let timerStarted = false;
let progressChart, timeChart;

function startTimer() {
    timerInterval = setInterval(function() {
        timeElapsed += 0.1;
        document.getElementById('timer').textContent = formatTime(timeElapsed);
    }, 100);  // Update every 100ms (0.1s)
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const millis = (seconds % 1).toFixed(1).substr(2);  // To capture the decimal part
    return `${mins}:${secs < 10 ? '0' : ''}${secs}.${millis}`;
}

function stopTimer() {
    clearInterval(timerInterval);
}

// Call this function when the game starts or resets
displayMaxPoints();

// Display Progress trend chart
displayProgressTrend();
displayTimeTrend();

function calculateMaxPoints() {
    return QUESTION_SEQUENCE.reduce((sum, category) => {
        return sum + (category.limit * category.points);
    }, 0);
}

function displayMaxPoints() {
    const maxPoints = calculateMaxPoints();
    document.getElementById('maxPointsDisplay').textContent = `Maximum possible points: ${maxPoints}`;
}

function generateOperands(category) {
    let operand1, operand2;

    switch (category.type) {
    case 'Level 1':
		operand1 = Math.floor(Math.random() * 4) + 2; // 2-5
		operand2 = Math.floor(Math.random() * 4) + 2; // 2-5
        break;
    case 'Level 2':
		operand1 = Math.floor(Math.random() * 4) + 2; // 2-5
		operand2 = Math.floor(Math.random() * 4) + 6; // 6-9
        break;
    case 'Level 3':
		operand1 = Math.floor(Math.random() * 4) + 6; // 6-9
		operand2 = Math.floor(Math.random() * 4) + 6; // 6-9
        break;
    case 'Level 4':
        operand1 = Math.floor(Math.random() * 4) + 2; // 2-5
        operand2 = Math.floor(Math.random() * 5) + 12; // 12-16
        break;
	case 'Level 5':
        operand1 = Math.floor(Math.random() * 4) + 6; // 6-9
        operand2 = Math.floor(Math.random() * 5) + 12; // 12-16
        break;
    case 'Level 6':
        operand1 = Math.floor(Math.random() * 6) + 11; // 11-16
        operand2 = Math.floor(Math.random() * 6) + 11; // 11-16
        break;
	}

    return [operand1, operand2];
}

function checkQuestion(operand1, operand2) {
    return recentQuestions.includes(`${operand1}x${operand2}`) || 
           recentQuestions.includes(`${operand2}x${operand1}`);
}

function nextQuestion() {
    // Ensure the question counter is incremented
    currentQuestion++;
    
    if (currentQuestion > totalQuestions) {
		console.log("Time Elapsed:", timeElapsed); // Debugging
        endQuiz();
        return;
    }

    // If the current category's limit has been reached, move to the next category
	if (QUESTION_SEQUENCE[currentCategory].questionsAsked >= QUESTION_SEQUENCE[currentCategory].limit) {
        currentCategory++;
    }

    let category = QUESTION_SEQUENCE[currentCategory];
	document.getElementById('categoryDisplay').textContent = `${category.type} (Points: ${category.points})`;

    // Generate operands
    let [operand1, operand2] = generateOperands(category);
    while (checkQuestion(operand1, operand2)) {
        [operand1, operand2] = generateOperands(category);
    }

    // Add to the recent questions
    recentQuestions.push(`${operand1}x${operand2}`);
    if (recentQuestions.length > 5) {  // Adjust size as needed
        recentQuestions.shift();
    }

    answer = operand1 * operand2;
	
	// Ensure operand1 is greater than or equal to operand2
	if (operand1 < operand2) {
		let temp = operand1;
		operand1 = operand2;
		operand2 = temp;
	}

	// With a 50% probability, swap operands for display
	if (Math.random() < 0.5) {
		let temp = operand1;
		operand1 = operand2;
		operand2 = temp;
	}
	
	// Increment category question counter
    QUESTION_SEQUENCE[currentCategory].questionsAsked++;

	// Set operands to HTML
	document.getElementById('operand1').textContent = operand1;
	document.getElementById('operand2').textContent = operand2;
    document.getElementById('userAnswer').value = '';
	document.getElementById('questionCounter').textContent = `${currentQuestion}`;
	const progressPercentage = ((currentQuestion-1) / (totalQuestions-1)) * 100;
	document.getElementById('progress').style.width = `${progressPercentage}%`;
    // totalPoints += category.points; 
	document.getElementById('userAnswer').disabled = false; // Enable input
    document.getElementById('userAnswer').focus(); // Focus on the input box
}

function checkAnswer() {
	const userAnswer = +document.getElementById('userAnswer').value;
	const category = QUESTION_SEQUENCE[currentCategory];
    if (userAnswer === answer) {
        document.getElementById('message').textContent = 'Correct!';
        document.getElementById('message').className = 'correct';
		totalPoints += category.points;
		attempts = 0;  // reset attempts
		document.getElementById('userAnswer').disabled = true;
		nextQuestion();
    } else {
		if (attempts >= 1) {
			document.getElementById('message').textContent = `Incorrect! Correct Answer: ${answer}`;
			document.getElementById('message').className = 'incorrect';
			attempts = 0;  // reset attempts
			document.getElementById('userAnswer').disabled = true;
			nextQuestion();
		} else {
			attempts++;
			document.getElementById('message').textContent = 'Incorrect! Try Again.';
			document.getElementById('message').className = 'incorrect';
			document.getElementById('userAnswer').value = '';
		}
    }
    document.getElementById('totalPoints').textContent = totalPoints;  // Update displayed points
}

function skipQuestion() {
    attempts = 0; // Reset attempts so the next question starts fresh
    nextQuestion();
}

function endQuiz() {
	stopTimer();
	
	// Update displayed points
	document.getElementById('totalPoints').textContent = totalPoints;
	
	// Set the message to indicate the end of the quiz
    document.getElementById('completionMessage').textContent = 'Quiz Ended!';

    // Save the percentage of points earned in this session
	const maxPoints = calculateMaxPoints(); // Calculate max points
    const percentage = (totalPoints / maxPoints) * 100;  // Maximum possible points are 63
    let progressData = JSON.parse(localStorage.getItem('progressData')) || [];
    progressData.push(percentage);
    localStorage.setItem('progressData', JSON.stringify(progressData));

    // Update the number of games played
    let gamesPlayed = parseInt(localStorage.getItem('gamesPlayed')) || 0;
    gamesPlayed += 1;
    localStorage.setItem('gamesPlayed', gamesPlayed);

    // Display the updated progress trend
    displayProgressTrend();
	
	// Save elapsedTime
	let timeData = JSON.parse(localStorage.getItem('timeData')) || [];	
	timeData.push(timeElapsed);
	localStorage.setItem('timeData', JSON.stringify(timeData));
	
	// Display the updated time trend
	displayTimeTrend();
}

function displayProgressTrend() {
    const progressData = JSON.parse(localStorage.getItem('progressData')) || [];
    if (progressData.length === 0) return;

    const ctx = document.getElementById('trendlineCanvas').getContext('2d');
	
	// Destroy previous chart instance if it exists
    if (progressChart) {
        progressChart.destroy();
    }
	
    progressChart = new Chart(ctx, {
        type: 'bar',  // Change from 'line' to 'bar'
        data: {
            labels: Array.from({length: progressData.length}, (_, i) => i + 1),
            datasets: [{
                label: '%',
                data: progressData,
                backgroundColor: 'rgba(0, 0, 255, 0.2)',
                borderColor: 'blue',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
			plugins: {
				legend: {
					display: false
				}
			}
        }
    });
    const gamesPlayed = parseInt(localStorage.getItem('gamesPlayed')) || 0;
    const progressTrendHeader = document.getElementById('progressTrend').querySelector('h3');
    progressTrendHeader.textContent = `Progress Trend (Sessions: ${gamesPlayed})`;
}

function displayTimeTrend() {
    const timeData = JSON.parse(localStorage.getItem('timeData')) || [];
    if (timeData.length === 0) return;

    const ctx = document.getElementById('timeTrendCanvas').getContext('2d');
	
	// Destroy previous chart instance if it exists
    if (timeChart) {
        timeChart.destroy();
    }
	
    timeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Array.from({ length: timeData.length }, (_, i) => i + 1),
            datasets: [{
                label: 'Time (s)',
                data: timeData,
                backgroundColor: 'rgba(0, 255, 0, 0.2)',
                borderColor: 'green',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
			plugins: {
				legend: {
					display: false
				}
			}
        }
    });
	const gamesPlayed = parseInt(localStorage.getItem('gamesPlayed')) || 0;
    const timeTrendHeader = document.getElementById('timeTrend').querySelector('h3');
    timeTrendHeader.textContent = `Time Trend (Sessions: ${gamesPlayed})`;
}

function resetStats() {
    localStorage.removeItem('progressData');
    localStorage.removeItem('gamesPlayed');
	localStorage.removeItem('timeData');
    // Reset other stats as needed
    alert('All stats have been reset.');
    // Optionally, reload the page to reset the game too:
    // location.reload();
}

document.getElementById('userAnswer').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();  // Prevents any default action related to Enter key
		
		if (!timerStarted) {
            startTimer();
            timerStarted = true;  // Set the flag to true after starting the timer
        }
		
        checkAnswer();
    }
});

// Start the quiz with the first question
nextQuestion();

// Debugging