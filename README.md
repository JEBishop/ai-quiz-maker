# Apify AI Agent Actor: Study Quiz Generator

## Overview
The **Study Quiz Generator** is an autonomous AI agent built on Apify that transforms user input into a structured study quiz. Given a user's request (e.g., "I need to study for a quiz about World War 2"), the agent extracts the core topic, scrapes relevant Wikipedia pages asynchronously, and generates a multi-difficulty quiz in various formats (Markdown, HTML, JSON).

## Features
- **Autonomous Topic Extraction**: The agent identifies key study topics from natural language input.
- **Asynchronous Web Scraping**: Retrieves data from multiple Wikipedia pages simultaneously for efficiency.
- **Intelligent Quiz Generation**: Constructs easy, medium, and hard questions based on extracted information.
- **Multi-Format Output**: Outputs quizzes in Markdown, HTML, and structured JSON format for various use cases.

## Workflow
![Workflow Diagram](https://raw.githubusercontent.com/JEBishop/ai-quiz-maker/main/agent_flow.png)
1. **User Input Processing**: The AI agent processes a free-text request to determine the main study topic.
2. **Web Scraping**: Asynchronously scrapes Wikipedia pages relevant to the extracted topic.
3. **Content Analysis**: Extracts key facts, events, and figures, organizing them into a structured knowledge base.
4. **Question Generation**: Creates quiz questions of varying difficulty levels.
5. **Multi-Format Export**: Outputs the quiz in Markdown (for readability), HTML (for web integration), and JSON (for programmatic use).

## How to Use
1. Deploy the Apify AI agent on the Apify platform.
2. Provide a study request as input.
3. The agent autonomously scrapes and processes data.
4. Retrieve the generated quiz in your preferred format.

## Example Input
```json
"I need to study for a quiz about World War 2"
```
## Output
### Be sure to check the "Storage > Key-value store output tab for the HTML/MD report files.

## Example Output Format
```json
{
    "easy": [
        {
            "question": "What year did World War 2 start?",
            "answers": ["1939", "1940", "1941", "1942"]
        }
        // 5 questions
    ],
    "medium": [
        {
            "question": "Which countries were part of the Axis powers?",
            "answers": ["Germany", "Italy", "Japan", "Hungary"]
        }
        // 5 questions
    ],
    "hard": [
        {
            "question": "What was Operation Barbarossa?",
            "answers": ["The German invasion of the Soviet Union"]
        }
        // 5 questions
    ]
}
```

![Sample output HTML](https://raw.githubusercontent.com/JEBishop/ai-quiz-maker/main/html_quiz.png)

This AI agent autonomously handles the entire study quiz generation process, making it a powerful tool for students, educators, and self-learners!

