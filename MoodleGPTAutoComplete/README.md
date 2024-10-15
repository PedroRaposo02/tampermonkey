# GPT Answer Selector Tampermonkey Script

## Overview

The **GPT Answer Selector** is a Tampermonkey script designed to enhance the user experience on web pages containing multiple-choice questions. It leverages the OpenAI GPT API to analyze questions and provide suggested answers, which it then automatically selects based on the user's interaction.

## Features

- Detects multiple-choice questions on the page.
- Uses the GPT API to evaluate the question and provide the correct answer.
- Displays a button next to each question that triggers the answer retrieval process.
- Automatically selects the correct answer based on GPT's response.

## Requirements

- **Tampermonkey**: A browser extension that allows you to run custom user scripts on web pages.
- **OpenAI GPT API Key**: You will need an API key to interact with the GPT model.

## Installation

1. **Install Tampermonkey**:
   - For Chrome, visit the [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey) and install the extension.
   - For Firefox, visit the [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) page and install it.
   - For other browsers, check the [Tampermonkey website](https://www.tampermonkey.net/).

2. **Create a New Script**:
   - Click the Tampermonkey icon in your browser toolbar.
   - Select **Create a New Script**.

3. **Copy and Paste the Script**:
   - Copy the provided Tampermonkey script code (see below).
   - Paste it into the Tampermonkey editor.

4. **Save the Script**:
   - Click the **File** menu and select **Save** (or press `Ctrl+S`).

5. **Get Your OpenAI API Key**:
   - Sign up at [OpenAI](https://openai.com) and create an API key.

## Usage

1. **Access a Web Page with Multiple-Choice Questions**:
   - Navigate to any web page that contains multiple-choice questions formatted with specific `div` and `class` attributes.

2. **Enter Your API Key**:
   - When the script runs for the first time, it will prompt you to enter your OpenAI API key. Enter your key and click **OK**. This key will be stored for future use.

3. **Click the Button**:
   - For each detected question, a button labeled **Get Answer** will appear at the top right of the question.
   - Click the button to request an answer from the GPT API.

4. **Automatic Answer Selection**:
   - Once the GPT API returns the suggested answer, the script will automatically select the corresponding input option for the question.

## How It Works

1. **DOM Manipulation**: The script identifies question elements in the DOM based on specific IDs and classes, allowing it to gather necessary information such as question text and possible answers.

2. **API Interaction**:
   - The script formats the question and answers into a prompt for the GPT model, asking it to evaluate the correct answer.
   - It sends a request to the GPT API and expects a JSON response containing the correct answer text and its corresponding number.

3. **Answer Selection**: Upon receiving the response, the script finds the appropriate input element for the correct answer and selects it.

## Example Code Snippet

Here’s a simplified version of how the core functionality works:

```javascript
async function getGPTAnswer(questionText, answers) {
    const prompt = basePrompt(questionText, answers);
    const response = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model: 'gpt-3.5-turbo', prompt: prompt, max_tokens: 150 }),
    });
    const data = await response.json();
    return JSON.parse(data.choices[0].text.trim());
}
