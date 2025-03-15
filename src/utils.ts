// Format quiz as Markdown
export const formatMarkdown = (quizData: any) => {
    if (!quizData) return "# World War II Quiz\n\nError: No quiz data provided.";
    
    return ["# World War II Quiz", ...["easy", "medium", "hard"].map(difficulty => {
      const questions = quizData[difficulty];
      if (!Array.isArray(questions)) return `## ${difficulty[0].toUpperCase() + difficulty.slice(1)} Questions\n\nNo questions available.\n`;
      
      return `## ${difficulty[0].toUpperCase() + difficulty.slice(1)} Questions\n\n` +
        questions.map((q, i) => q ? `### Question ${i + 1}: ${q.question || "[No question text]"}\n\n` +
          (Array.isArray(q.answers) ? q.answers.map((a: any, j: any) => `- **${String.fromCharCode(65 + j)}.** ${a || "[Empty answer]"}`).join("\n") : "- No answer options available") + "\n"
        : `### Question ${i + 1}: [Missing question data]\n\n`).join("\n");
    })].join("\n\n");
  };
  
  // Format quiz as HTML
  export const formatHtml = (quizData: any) => {
    if (!quizData) return `<!DOCTYPE html><html><head><title>World War II Quiz</title></head><body><h1>World War II Quiz</h1><p class='error'>Error: No quiz data provided.</p></body></html>`;
    
    return `<!DOCTYPE html>
  <html>
  <head>
    <title>World War II Quiz</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 800px; margin: auto; padding: 20px; }
      h1, h2, h3 { color: #333; }
      .difficulty { padding: 10px; margin-top: 30px; border-radius: 5px; background: #eee; }
      .easy { border-left: 5px solid #4CAF50; }
      .medium { border-left: 5px solid #2196F3; }
      .hard { border-left: 5px solid #f44336; }
      .error { color: #f44336; font-style: italic; }
      .question { margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-radius: 5px; }
      .answer-option { margin: 10px 0; }
      .option-letter { font-weight: bold; margin-right: 10px; }
    </style>
  </head>
  <body>
    <h1>World War II Quiz</h1>
    ${["easy", "medium", "hard"].map(difficulty => {
      const questions = quizData[difficulty];
      if (!Array.isArray(questions)) return `<div class='difficulty ${difficulty}'><h2>${difficulty[0].toUpperCase() + difficulty.slice(1)} Questions</h2><p class='error'>No questions available.</p></div>`;
      
      return `<div class='difficulty ${difficulty}'><h2>${difficulty[0].toUpperCase() + difficulty.slice(1)} Questions</h2>` +
        questions.map((q, i) => q ? `<div class='question'><h3>Question ${i + 1}: ${q.question || "<span class='error'>[No question text]</span>"}</h3>` +
          (Array.isArray(q.answers) ? q.answers.map((a: any, j: any) => `<div class='answer-option'><span class='option-letter'>${String.fromCharCode(65 + j)}.</span> ${a || "<span class='error'>[Empty answer]</span>"}</div>`).join("") : "<p class='error'>No answer options available</p>") +
          "</div>"
        : `<div class='question'><h3>Question ${i + 1}: <span class='error'>[Missing question data]</span></h3></div>`).join("") +
        "</div>";
    }).join("")}
  </body>
  </html>`.replace(/\s+/g, ' ').trim();
  };
  