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

let startX;
let startY;
let clientY;
let clientX;
let isDragging = false;
let activeStripe = null;
let points = 0;
let offsetValueArray;
/* 
================================
Check mode
================================
*/

function getScreenMode() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  return height > width ? "vertical" : "horizontal";
}

let screenMode = getScreenMode();

window.addEventListener("resize", () => {
  screenMode = getScreenMode();
});

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
  return Math.round(10 + 10 * (1 - levelCompletion));
}

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

const feedbacks = [
  "Identifica la información que el número da sobre sus factores. Por ejemplo, si termina en un dígito par, uno de sus factores debe ser 2 o 4. Si es que la suma de sus digitos es divisible en 3, entonces 3 o 9 son posibles factores. Si termina en 5 o en 0 entonces 5 es un factor",
  "Una posible estrategia es la estimación.",
];

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
  adjustFontSize();
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
adjustFontSize();

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
    innerStripe.style.top = "0px";
    innerStripe.style.left = "0px";
  });
}

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

function adjustFontSize() {
  const numberContainer = document.querySelectorAll(".number");
  const resultContainer = document.getElementById("result-number");
  const fontSize =
    Math.min(numberContainer[0].clientHeight, numberContainer[0].clientWidth) *
    0.8;
  numberContainer.forEach((num) => {
    const textElement = num.querySelector(".number-text");
    textElement.style.fontSize = `${fontSize}px`;
  });
  resultContainer.style.fontSize = `${fontSize}px`;
}

function getCurrentNumSpace() {
  const numberContainer = document.querySelector(".number");
  if (screenMode === "horizontal") {
    return numberContainer.clientHeight / 0.8;
  }
  return numberContainer.clientWidth / 0.8;
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
          `<div class="element number"> <p class='number-text'> ${
            value !== 1 ? value : "1"
          }</p></div>`
      )
      .join("");
    innerStripes[index].innerHTML = stripeNumbers;
  });
}

function createObjectiveTotalHTML(objectiveNumber) {
  resultContainers[2].innerHTML = `<div id='result-number' class="element result-number"><p> ${objectiveNumber} </p></div>`;
  rowIndicators[2].innerHTML = `<img src="label-important-fill-svgrepo-com.svg" alt="" />
`;
}

/* 
================================
Hookup Listeners
================================
*/

window.addEventListener("resize", adjustFontSize);

window.addEventListener("mouseup", () => {
  isDragging = false;
});

function checkBoundary(innerStripeElement) {
  if (screenMode === "horizontal") {
    const topRange = [-220, 260];
    let topValue = innerStripeElement.offsetTop;
    if (topValue < topRange[0]) {
      innerStripeElement.style.top = `${topRange[0]}px`;
    } else if (topValue > topRange[1]) {
      innerStripeElement.style.top = `${topRange[1]}px`;
    }
  } else if (screenMode === "vertical") {
    let leftValue = innerStripeElement.offsetLeft;
  }
}

stripes.forEach((stripe, index) => {
  const innerStripe = stripe.querySelector(".inner-stripe");
  let offsetValue = offsetValueArray[index];

  function mouseDown(e) {
    isDragging = true;
    stripe.style.cursor = "grabbing";
    if (screenMode === "horizontal") {
      if (e.type === "touchstart") {
        startY = e.touches[0].clientY - innerStripe.offsetTop;
      } else {
        startY = e.clientY - innerStripe.offsetTop;
      }
    } else if (screenMode === "vertical") {
      if (e.type === "touchstart") {
        startX = e.touches[0].clientX - innerStripe.offsetLeft;
      } else {
        startX = e.clientX - innerStripe.offsetLeft;
      }
    }
  }

  function mouseEnter(e) {
    stripe.style.cursor = "grab";
  }

  function mouseUp(e) {
    const numberHeight = getCurrentNumSpace();
    const numberWidth = getCurrentNumSpace();
    stripe.style.cursor = "grab";
    if (screenMode === "horizontal") {
      let innerTop = innerStripe.getBoundingClientRect().top;
      offsetValue = Math.round(innerTop / numberHeight);
      let snapPos = offsetValue * numberHeight;
      innerStripe.style.top = `${snapPos}px`;
    } else if (screenMode === "vertical") {
      let innerLeft = innerStripe.getBoundingClientRect().left;
      offsetValue = Math.round(innerLeft / numberWidth);
      let snapPos = offsetValue * numberWidth;
      console.log(snapPos);
      innerStripe.style.left = `${snapPos}px`;
    }

    offsetValueArray[index] = offsetValue;
    checkWin();
  }

  function mouseMove(e) {
    if (!isDragging) {
      return;
    }
    e.preventDefault();
    if (screenMode === "horizontal") {
      if (e.type === "touchmove") {
        clientY = e.touches[0].clientY;
      } else {
        clientY = e.clientY;
      }
      innerStripe.style.top = `${clientY - startY}px`;
    } else if (screenMode === "vertical") {
      if (e.type === "touchmove") {
        clientX = e.touches[0].clientX;
      } else {
        clientX = e.clientX;
      }
      innerStripe.style.left = `${clientX - startX}px`;
    }
    checkBoundary(innerStripe);
  }

  stripe.addEventListener("mousedown", mouseDown);
  stripe.addEventListener("touchstart", mouseDown);

  stripe.addEventListener("mouseenter", mouseEnter);

  stripe.addEventListener("mouseup", mouseUp);
  stripe.addEventListener("touchend", mouseUp);

  stripe.addEventListener("mousemove", mouseMove);
  stripe.addEventListener("touchmove", mouseMove);
});

newGameBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    instructionsContainer.close();
    gameoverContainer.close();
    newGame();
  });
});
