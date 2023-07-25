  let sentences;
  let currentSentenceIndex = 0;
  let currentWordIndex = 0;
  let timePerWord = 200; // 500 milliseconds = 0.5 second
  let timePerSentence = 1000; // 3000 milliseconds = 3 seconds
  let nextWordTime = 0;
  let nextSentenceTime;
  let startTime;
  let maxLineWidth = 250; // Maximum width of a line
  let lineHeight = 36; // Height of a line, should be larger than the text size
  let color;  

  function setup(p, font, arrLyrics, textColor) {
    sentences = arrLyrics.flat();
    color = textColor;
    p.textFont(font);
    p.textSize(32);
    p.textAlign(p.LEFT, p.CENTER);
    startTime = p.millis();

    nextSentenceTime = sentences[0].split(" ").length * timePerWord + timePerSentence;
  }
  
  function draw(p) {
    p.background(220);
    let elapsed = p.millis() - startTime;
  
    if (elapsed >= nextWordTime) {
      let sentence = sentences[currentSentenceIndex];
      let words = sentence.split(" ");
  
      if (currentWordIndex < words.length) {
        currentWordIndex++;
        nextWordTime += timePerWord;
      }
    }
  
    if (elapsed >= nextSentenceTime) {
      currentSentenceIndex++;
      currentWordIndex = 0;
  
      if (currentSentenceIndex >= sentences.length) {
        currentSentenceIndex = 0;
        startTime = p.millis();
        elapsed = 0;
      }
  
      let nextSentence = sentences[currentSentenceIndex];
      nextWordTime = elapsed + timePerWord;
      nextSentenceTime = elapsed + nextSentence.split(" ").length * timePerWord + timePerSentence;
    }
  
    if (currentSentenceIndex < sentences.length) {
      let sentence = sentences[currentSentenceIndex];
      let words = sentence.split(" ");
      //let displayedWords = words.slice(0, currentWordIndex);
  
      let lines = [];
      let currentLine = [];
      let currentLineWidth = 0;
  
      // Break down the words into lines
      for (let word of words) {
        let wordWidth = p.textWidth(word + " ");
        
        if (currentLineWidth + wordWidth > maxLineWidth && currentLine.length > 0) {
          lines.push(currentLine);
          currentLine = [];
          currentLineWidth = 0;
        }
        
        currentLine.push(word);
        currentLineWidth += wordWidth;
      }
      
      // Add the last line
      if (currentLine.length > 0) {
        lines.push(currentLine);
      }
  
      // Draw each line
      let wordCount = 0;
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let lineY = height / 2 - (lines.length - 1) * lineHeight / 2 + i * lineHeight;
        let lineX = (width - p.textWidth(line.join(" "))) / 2;
  
        for (let j = 0; j < line.length; j++) {
          if (wordCount < currentWordIndex) {
            p.fill(color);
            p.text(line[j], lineX, lineY);
          }
          lineX += p.textWidth(line[j] + " ");
          wordCount++;
        }
      }
    }
  }
  