/* https://www.youtube.com/watch?v=KHGc7eZyxKY */

const pointContainer = document.getElementById("point-container");
const gameoverPoints = document.getElementById("gameover-points");
const instructionsContainer = document.getElementById("instrucions-modal");
const gameoverContainer = document.getElementById("gameover-modal");
const timerElement = document.getElementById("timer");

const newGameBtns = document.querySelectorAll(".newgame-btn");

const stripes = document.querySelectorAll(".stripe");
const innerStripes = document.querySelectorAll(".inner-stripe");
const resultContainers = document.querySelectorAll(".result-number");
const rowIndicators = document.querySelectorAll(".row-indicator");

const numberHeight = 100 + 20;

let startY;
let y;
let isDragging = false;
let activeStripe = null;
let points = 0;
let offsetValueArray;

/* 
================================
Game parameters
================================
*/

/* Determines the range of the values in a column,
 and by extension the number of columns */
let numberRangeByColumn = [5, 10];
let columnsValuesArray;
let objectiveProduct;
let time = 15;
let timerID;

/* 
=================================================
Generating the values as a function of points
=================================================
*/

/* 
Levels
  1. EF | EF
  2. EF | HF
  3. EF | EF | EF
  4. EF | EF | HF
  5. HF | HF
  6. EF | HF | HF
  7. HF | HF | HF
  
  35 means win.
*/

const easyFactors = [2, 3, 4, 5, 9];
const hardFactors = [6, 7, 8, 11, 12];

function columnValuesByPoints() {
  const level = Math.trunc(points / 10) + 1;
  switch (level) {
    case 1:
      return [easyFactors, easyFactors];
    case 2:
      return [easyFactors, hardFactors];
    case 3:
      return [easyFactors, easyFactors, easyFactors];
    case 4:
      return [easyFactors, easyFactors, hardFactors];
    case 5:
      return [hardFactors, hardFactors];
    case 6:
      return [easyFactors, hardFactors, hardFactors];
    case level >= 7:
      return [hardFactors, hardFactors, hardFactors];
    default:
      return [hardFactors, hardFactors, hardFactors];
  }
}

function timeByPoints() {
  const levelCompletion = (points - Math.trunc(points / 10) * 10) / 10;
  return Math.round(1 + 10 * (1 - levelCompletion));
}

function feedbackBasedOnPoints() {
  return `texto basado en tus ${points}`;
}

/* 
================================
Generate new game
================================
*/

function newGame() {
  columnsValuesArray = generateColumnsValues(numberRangeByColumn);
  objectiveProduct = setObjective();
  offsetValueArray = [0, 0, 0];
  resetStripePositions();
  createStripesHTML(columnsValuesArray);
  createObjectiveTotalHTML(objectiveProduct);
  pointsHTML();
  columnValuesByPoints();
  setGameTimer();
}

function checkWin() {
  const win = checkRowProducts(offsetValueArray)[2] === objectiveProduct;
  if (win) {
    points += 1;
    winAnimation();
    setTimeout(() => {
      newGame();
      winAnimation();
    }, 300);
  }
}

function gameOver() {
  gameoverPoints.innerText = `Puntos: ${points}`;
  gameoverContainer.showModal();
  points = 0;
  freezeGame();
}

function setGameTimer() {
  time = timeByPoints();
  timerElement.style = `--duration: ${time}`;
  timerElement.style.animationName = "none";
  timerElement.offsetWidth;
  timerElement.style.animationName = "roundtime";
  clearTimeout(timerID);
  timerID = setTimeout(() => {
    gameOver();
  }, time * 1000);
}

function freezeGame() {
  timerElement.style.animationName = "none";
  timerElement.offsetWidth;
  clearTimeout(timerID);
}

function winAnimation() {
  document.body.classList.toggle("win");
}

instructionsContainer.showModal();
newGame();
freezeGame();
/* 
================================
Utils
================================
*/

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function selectRandomOffsets() {
  return Array.from({ length: numberRangeByColumn.length }, (_, i) => {
    return getRandomInt(0, 4) - 2;
  });
}

function resetStripePositions() {
  stripes.forEach((stripe) => {
    const innerStripe = stripe.querySelector(".inner-stripe");
    innerStripe.style.top = "20px";
  });
}

/* 
================================
Game generation functions
================================
*/

/* Takes the numberRangeByColumn and creates and array of columns */
function generateColumnsValues(numRangeArray) {
  return columnValuesByPoints();
}

function setObjective() {
  const randomOffsets = selectRandomOffsets();
  const rowProducts = checkRowProducts(randomOffsets);
  return rowProducts[2];
}

/* 
================================
Fill html elements
================================
*/

/* Handle points */
function pointsHTML() {
  pointContainer.innerText = `Puntos: ${points}`;
}

/* Inject the array of values in the html */
function createStripesHTML(arr) {
  arr.forEach((column, index) => {
    const stripeNumbers = column
      .map(
        (value) =>
          `<div class="element number">${value !== 1 ? value : "1"}</div>`
      )
      .join("");
    innerStripes[index].innerHTML = stripeNumbers;
  });
}

function createObjectiveTotalHTML(objectiveNumber) {
  resultContainers[2].innerHTML = `<div class="element result-number">= ${objectiveNumber}</div>`;
  rowIndicators[2].innerHTML = `<img src="label-important-fill-svgrepo-com.svg" alt="" />
`;
}

/* 
================================
Hookup Listeners
================================
*/

window.addEventListener("mouseup", () => {
  isDragging = false;
});

function checkBoundary(innerStripeElement) {
  const topRange = [-220, 260];
  let topValue = innerStripeElement.offsetTop;
  if (topValue < topRange[0]) {
    innerStripeElement.style.top = `${topRange[0]}px`;
  } else if (topValue > topRange[1]) {
    innerStripeElement.style.top = `${topRange[1]}px`;
  }
}

stripes.forEach((stripe, index) => {
  const innerStripe = stripe.querySelector(".inner-stripe");
  let offsetValue = offsetValueArray[index];

  stripe.addEventListener("mousedown", (e) => {
    isDragging = true;
    startY = e.clientY - innerStripe.offsetTop;
    stripe.style.cursor = "grabbing";
  });

  stripe.addEventListener("mouseenter", () => {
    stripe.style.cursor = "grab";
  });

  stripe.addEventListener("mouseup", () => {
    stripe.style.cursor = "grab";
    let innerTop = innerStripe.getBoundingClientRect().top;
    offsetValue = Math.round(innerTop / numberHeight);
    let snapPos = offsetValue * numberHeight + 20;
    innerStripe.style.top = `${snapPos}px`;
    offsetValueArray[index] = offsetValue;
    checkWin();
  });

  stripe.addEventListener("mousemove", (e) => {
    if (!isDragging) {
      return;
    }
    e.preventDefault();
    y = e.clientY;
    innerStripe.style.top = `${y - startY}px`;
    checkBoundary(innerStripe);
  });
});

newGameBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    instructionsContainer.close();
    gameoverContainer.close();
    newGame();
  });
});

/* 
================================
Check current state logic
================================
*/

function getVisibleArray(offsetArray) {
  return columnsValuesArray.map((col, index) =>
    formatColumnsByOffset(col, index, offsetArray)
  );
}

/*TODO: Throw error */
function padArray(arr, targetLength = 9, side) {
  let arr1 = arr;
  let arr2 = Array(Math.max(targetLength - arr.length, 0)).fill(0);
  if (side === "right") {
    [arr1, arr2] = [arr2, arr1];
    return arr1.concat(arr2);
  } else if (side === "left") {
    return arr1.concat(arr2);
  }
  return;
}

function formatColumnsByOffset(col, index, offsetArray) {
  const offsetValue = offsetArray[index];
  if (offsetValue > 0) {
    return padArray(col.slice(0, 5 - offsetValue), 5, "right");
  } else {
    return padArray(col.slice(-1 * offsetValue, 5), 5, "left");
  }
}

function checkRowProducts(offsetArray) {
  const visibleArrayValues = getVisibleArray(offsetArray);
  const product = Array.from({ length: 5 }, (_, i) =>
    visibleArrayValues.reduce((acc, arr) => acc * (arr[i] || 1), 1)
  );
  return product;
}
