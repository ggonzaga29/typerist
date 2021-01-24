console.log("re-code");

const quoteElement = document.getElementById("quote");
const restartBtn = document.getElementById("restart");
const wordInput = document.getElementById("word-input");
const wpmText = document.querySelector(".wpm-text");
const wpmLi = document.querySelector(".wpm-acc");
const accText = document.querySelector(".acc-text");
const maxWordSelect = document.querySelector(".max-word-list");
const themeBtn = document.querySelector('.theme-btn');
const closeBtn = document.querySelector('.close');

wordInput.focus();

let wordList, wordElements;
let allWordsStr = "";
let allLettersTyped = "";
let testOngoing = false;
let uncorrectedErrors = [];
let errors = 0;
let maxWords = 50;
let curMax;

const testLengths = [10, 25, 50, 75, 100, 125];
const themes = ["default", "250388"];

// Render test lengths selection
testLengths.forEach((value) => {
	const HTMLstr = `<li class="max-${value}" onclick="setMaxWords(${value})"><span>${value}</span></li>`;
	// maxWordSelect.insertAdjacentHTML('afterbegin', HTMLstr);
	maxWordSelect.innerHTML += HTMLstr;
	console.log(HTMLstr);
});

if (
	/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
		navigator.userAgent
	)
) {
	alert("Sorry, this app is not yet optimized for mobile. :(");
}

curMax = document.querySelector(`.max-${maxWords}`);
curMax.classList.add("current-max");

function setMaxWords(num) {
	curMax = document.querySelector(`.max-${maxWords}`);
	curMax.classList.remove("current-max");
	const toNum = Number(num);
	maxWords = toNum;
	curMax = document.querySelector(`.max-${maxWords}`);
	curMax.classList.add("current-max");
	init();
}

const textColorClasses = {
	correct: "text-next",
	wrong: "text-wrong",
	next: "text-next",
};

const colors = {
	background: "",
};

let currentSource = "randomEnglish";

const sources = new Map();
sources.set(
	"quotable",
	"http://api.quotable.io/random?minLength=100&maxLength=120"
);
sources.set("randomEnglish", "texts/json");

async function getQuote() {
	const link = sources.get("quotable");

	let response = await fetch(link);
	let data = await response.json();
	return data;
}

// await function getData() {
//     const link = sources.get(currentSource);

// 	let response = await fetch(link);
// 	let data = await response.json();
// 	return data;
// }

// hello world

// test function
async function getEnglishWords() {
	let response = await fetch("texts/english.json");
	let data = await response.json();
	return data;
}

function renderEnglish() {
	getEnglishWords().then((data) => {
		let wordArr = data.text;

		let total = 1;
		let finalWordArr = [];

		for (let i = 0; i < wordArr.length; i++) {
			if (total <= maxWords) {
				const rand = Math.trunc(Math.random() * wordArr.length);

				finalWordArr.push(wordArr[rand]);
			}

			total++;
		}

		renderToHTML(finalWordArr);
	});
}

function init() {
	renderText(currentSource);
	clearInterval(timer);
	wpmText.textContent = "00";
    wpmLi.classList.remove("animate__tada");
    wpmLi.classList.remove("text-next");
	accText.textContent = "00";

	timer = null;
	testOngoing = false;

	currentWord = 0;
	correct = 0;
	allWordsStr = "";
	allLettersTyped = "";
	curTime = 0;
	uncorrectedErrors = [];
	console.clear();

	wordInput.focus();
	wordInput.value = "";
}

function renderQuote() {
	wordInput.disabled = true;

	getQuote().then((data) => {
		const words = data.content;

		renderToHTML(words);
	});
}

renderText(currentSource);
function renderText(link) {
	wordInput.disabled = false;

	switch (link) {
		case "quotable":
			renderQuote();
			break;

		case "randomEnglish":
			renderEnglish();
			break;
		default:
			break;
	}
}

function renderToHTML(arr) {
	if (typeof arr === "string") {
		wordList = arr
			.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
			.replace(/\s{2,}/g, " ")
			.toLowerCase()
			.split(" ");
	} else {
		wordList = arr;
	}

	wordElements = wordList.map((word, i) => {
		return `<span class="word-${i}">${word}</span>`;
	});

	wordList.forEach((word) => {
		allWordsStr += word;
	});

	quoteElement.innerHTML = "";
	wordElements.forEach((element) => {
		quoteElement.innerHTML += element;
		quoteElement.innerHTML += " ";
	});
	wordInput.disabled = false;
	document.querySelector(`.word-0`).classList.add("text-next");
	curWord = wordList[currentWord];
}

// renderQuote();
let currentWord = 0;
let correct = 0;
let curWord;

let timer;
let curTime;

restartBtn.addEventListener("click", init);

document.addEventListener("keypress", (event) => {
	wordInput.focus();
});

let typed = "";

wordInput.addEventListener("keypress", (event) => {
	!testOngoing ? (testOngoing = true) : (testOngoing = false);

	if (event.key === "Backspace") {
		typed = typed.slice(-1);
	}

	// Timer
	if (!timer) {
		let start = Date.now();
		timer = setInterval(function () {
			const delta = Date.now() - start; // milliseconds elapsed since start
			curTime = Math.floor(delta / 1000); // in seconds
			// console.log(curTime);
		}, 1000); // update about every second
	}

	if (event.code !== "Space") {
		allLettersTyped += event.key;
	}

	curWord = wordList[currentWord];

	const curWordEl = document.querySelector(`.word-${currentWord}`);

	// if (curWord) {
	// 	let curLetterIndex = 0;
	// 	let curLetter = curWord[curLetterIndex];
	// 	typed = typed.concat(event.key);

	// 	if (typed.length > curWord.length) {
	// 	} else if (typed[typed.length - 1] !== curWord[typed.length - 1]) {
	// 		wordInput.classList.add("error");
	// 	} else {
	// 		wordInput.classList.remove("error");
	// 	}
	// }

	if (event.code === "Space") {
		if (typed.length !== 0) {
			event.preventDefault();
			curWordEl.classList.remove("text-next");

			let typedWord = wordInput.value;

			// if (typed.length === wordList[currentWord]) {
			if (typedWord === wordList[currentWord]) {
				// Highlight correct words
				curWordEl.classList.add("text-correct");

				correct++;
				wordInput.value = "";
			} else if (typedWord !== wordList[currentWord]) {
				// Highlight wrong words

				curWordEl.classList.add("text-wrong");
				wordInput.value = "";
				uncorrectedErrors.push(typed);
			}
			// }

			typed = "";

			wordInput.value = "";

			if (currentWord !== wordList.length) {
				currentWord++;
			}

			if (currentWord === wordList.length) {
				wordInput.disabled = true;
				console.log(allWordsStr, allLettersTyped);
				clearInterval(timer);
				wpmText.textContent = wpm();
				wpmLi.classList.add("animate__tada");
				wpmLi.classList.add("text-next");
				accText.textContent = accuracy();
			}
		}
	}
});

function netWpm(text, time) {
	const timeMinutes = time / 60;
	const gross = text.length / 5;
	const uncorrected = uncorrectedErrors.length;

	return Math.trunc((gross - uncorrected) / timeMinutes);
}

function cpm() {
	return (allLettersTyped.length / curTime) * 60;
}

function wpm() {
	return Math.round(((allLettersTyped.length / 5) / curTime) * 60);
}

function accuracy() {
	return Math.trunc((allWordsStr.length / allLettersTyped.length) * 100);
}

// Highlight current word
// function hightlightWord() {
// 	console.log(`.word-${currentWord}`);
// 	let el = document.querySelector(`.word-${currentWord}`);
// 	el.classList.add("text-blue-500");
// 	currentWord++;
// }

// Restart test on tab keypress

document.addEventListener("keydown", function (event) {
	if (event.ctrlKey && (event.key === "Z" || event.key === "z")) {
		init();
	}
});

///// TODO: Highlight current word
///// TODO: Calculate WPM
// TODO: Calculate Accuracy
// TODO: Highlight wrong words in input
// TODO: Calculate accuracy using levenshtein distance

setInterval(() => {
	if (wordInput.value === "") {
		wordInput.classList.remove("error");
		typed = "";
	}

	if (wordInput.value === " ") {
		wordInput.value = "";
	}

	if (curWord) {
		typed = wordInput.value;
		if (typed) {
			// cut the current word based on typed's length
			const tempWord = curWord.slice(0, typed.length);

			if (typed.length > curWord.length) {
				wordInput.classList.add("error");
			}

			if (typed !== tempWord) {
				wordInput.classList.add("error");
			} else {
				wordInput.classList.remove("error");
			}
		}

		let nextWordEl;

		if (currentWord !== 0) {
			nextWordEl = document.querySelector(`.word-${currentWord}`);
		} else {
			nextWordEl = document.querySelector(`.word-${currentWord}`);
		}

		if (nextWordEl) {
			nextWordEl.classList.add("text-next");
		}
	}
}, 1);

themeBtn.addEventListener("click", () => {
    const footer = document.querySelector('.theme-select');
    footer.classList.toggle("theme-select-open")
    closeBtn.classList.toggle("close-open");
});

closeBtn.addEventListener("click", () => {
    const footer = document.querySelector('.theme-select');
    footer.classList.remove("theme-select-open")
    closeBtn.classList.remove("close-open");
});