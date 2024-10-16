// ==UserScript==
// @name         Moodle questions autocomplete
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  Script to automatically complete multiple-choice questions on Moodle using OpenAI's GPT-3 API.
// @author       Pedro Raposo
// @updateURL 	 https://raw.githubusercontent.com/PedroRaposo02/tampermonkey/refs/heads/main/MoodleGPTAutoComplete/MoodleGPTAutoComplete.js
// @downloadURL  https://raw.githubusercontent.com/PedroRaposo02/tampermonkey/refs/heads/main/MoodleGPTAutoComplete/MoodleGPTAutoComplete.js
// @match        https://moodle.isep.ipp.pt/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ipp.pt
// @grant        none
// ==/UserScript==

// Function to get or prompt for GPT API key
function getGPTKey() {
	let gptKey = localStorage.getItem("gptApiKey");

	// If the key isn't set, prompt the user to enter it
	if (!gptKey) {
		gptKey = prompt("Please enter your GPT API key:");

		// If the user provides a key, save it in localStorage
		if (gptKey) {
			localStorage.setItem("gptApiKey", gptKey);
		} else {
			alert("GPT API key is required for this script to work!");
		}
	}

	return gptKey;
}

// Function to clear the stored GPT API key and allow re-entry
function clearGPTKey() {
	localStorage.removeItem("gptApiKey");
	alert("GPT API key cleared. You will be prompted to enter a new key.");
}

// Base prompt to pass to GPT to ensure consistency of answers
const basePrompt = (questionText, answers) => {
	return `
You are a highly accurate AI that must evaluate multiple-choice questions.
Your task is to choose the correct answer from the following options.
Return your response **strictly** in the following JSON format:
{
  "text": "theCorrectAnswerQuestionText",
  "number": "theCorrectAnswerAnswerNumber"
}

Important:
- "text" must be the full correct answer as provided in the options below.
- "number" must be the answer's corresponding number (as shown in the options).
- Do not return anything other than this JSON object.

Here is the question and its possible answers:
Question: "${questionText}"
Answers:
${answers.map((answer) => `${answer.number} ${answer.text}`).join("\n")}

Choose the correct answer and return it in the specified JSON format.`;
};

// Function to make the api call to GPT api url
async function getGPTAnswer(question, answers) {
	const apiKey = getGPTKey(); // Use the stored key or prompt for one
	if (!apiKey) {
		console.error("GPT API key not provided!");
		return null;
	}

	const finalPrompt = basePrompt(question, answers);

	const response = await fetch("https://api.openai.com/v1/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model: "gpt-3.5-turbo", // Or whichever model you're using
			prompt: finalPrompt,
			max_tokens: 150,
		}),
	});

	const data = await response.json();

	console.log(data);

	try {
		// Parse and return JSON response
		const result = JSON.parse(data.choices[0].text.trim());
		return result;
	} catch (error) {
		console.error("Failed to parse GPT response: ", error);
	}
}

(function () {
	"use strict";
	let questionsData = [];

	// Select all divs whose ID starts with 'question-'
	const questions = document.querySelectorAll('div[id^="question-"]');

	questions.forEach((question) => {
		const questionTextElement = question.querySelector("div.qtext p");
		const questionText = questionTextElement
			? questionTextElement.innerText.trim()
			: "";

		const answers = [];
		const answerDiv = question.querySelector("div.answer");
		if (answerDiv) {
			answerDiv.querySelectorAll(":scope > div").forEach((answer) => {
				const inputElement = answer.querySelector("input");
				const answerNumberElement = answer.querySelector("span.answernumber");
				const answerTextElement = answer.querySelector("p");

				const answerData = {
					number: answerNumberElement
						? answerNumberElement.innerText.trim()
						: "",
					text: answerTextElement ? answerTextElement.innerText.trim() : "",
					input: inputElement,
				};
				answers.push(answerData);
			});
		}
		questionsData.push({
			questionText,
			answers,
			element: question,
			state: "Incomplete",
		});
	});

	questionsData.forEach((q) => {
		q.element.style.position = "relative";

		// Create a button for each question
		const button = document.createElement("button");
		button.innerText = "✓";

		// Apply styling to position the button at the top-right
		button.style.position = "absolute";
		button.style.bottom = "10px"; // Adjust as needed
		button.style.right = "10px"; // Adjust as needed
		button.style.zIndex = "10"; // Ensure it stays on top
		button.style.backgroundColor = "transparent"; // Button color (optional)
		button.style.color = "green"; // Button text color (optional)
		button.style.border = "none"; // Optional: remove border
		// button.style.padding = "5px 10px"; // Optional: padding for the button
		button.style.cursor = "pointer"; // Optional: make the button look clickable
		button.style.opacity = "0.1"; // Optional: reduce opacity to make it less obtrusive

		button.addEventListener("click", async function (event) {
			event.preventDefault(); // prevent button from submitting form

			// Your logic for fetching and setting the correct answer goes here
			getGPTAnswer(q.questionText, q.answers)
				.then((result) => {
					if (result) {
						console.log("Answer:", result);
						q.answers.forEach((answer) => {
							if (
								answer.text === result.text ||
								answer.number === result.number
							) {
								if (answer.input && !answer.input.disabled) {
									if (
										answer.input.type === "radio" ||
										answer.input.type === "checkbox"
									) {
										answer.input.checked = true; // Select the correct answer
									}
								}
							}
						});
					}
				})
				.catch((error) => {
					console.error("Error fetching GPT answer:", error);
				});
		});

		q.element.appendChild(button);
	});
})();
