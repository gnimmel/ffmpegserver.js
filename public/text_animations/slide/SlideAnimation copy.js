  let sentences;
  let currentSentence = 0;
  let animatingIn = false; 
  let animatingOut = false; 
  let animationStartTime = 0;
  let baseTimePerLine = 700; 
  let timeIncreasePerLineIn = 50; 
  let timeIncreasePerLineOut = 25; 
  let timeBetweenSentences = 1500; 
  let delayStartTime = 0;
  let lines = [];
  let fontSize = 20;
  let leading = 22;
  let textColor;
  let textBoxWidth = 250;
  let textX, textY;
  
  
  function setup(p, font, arrLyrics, textColor) {
    sentences = arrLyrics.flat();
    this.textColor = textColor;
    p.textSize(fontSize);
    p.textLeading(leading);
    textX = width / 2;
    textY = height / 2;
    lines = splitIntoLines(p, sentences[currentSentence], textBoxWidth);
    animationStartTime = p.millis();
    delayStartTime = p.millis();
  }
  
  function draw(p) {
    p.textAlign(CENTER);
    let boxHeight = lines.length * leading;
    let boxTop = textY - boxHeight / 2;
  
    for (let i = 0; i < lines.length; i++) {
      let y;
      if (animatingIn && currentSentence !== 0) {
        let timePerLine = baseTimePerLine + (lines.length - 1 - i) * timeIncreasePerLineIn;
        let t = constrain((p.millis() - animationStartTime) / timePerLine, 0, 1);
        y = lerp(-leading, boxTop + i * leading, easeOutCubic(t));
      } else if (animatingOut) {
        let timePerLine = baseTimePerLine + (lines.length - 1 - i) * timeIncreasePerLineOut;
        let t = constrain((millis() - animationStartTime) / timePerLine, 0, 1);
        y = lerp(boxTop + i * leading, height + leading, easeInCubic(t));
      } else {
        y = boxTop + i * leading;
      }
      p.fill(this.textColor);
      p.text(lines[i], textX, y);
    }
  
    if (animatingIn && p.millis() - animationStartTime > baseTimePerLine + (lines.length - 1) * timeIncreasePerLineIn) {
      animatingIn = false;
      delayStartTime = p.millis();
    }
  
    if (!animatingIn && !animatingOut && p.millis() - delayStartTime > timeBetweenSentences) {
      animatingOut = true;
      animationStartTime = p.millis();
    }
  
    if (animatingOut && p.millis() - animationStartTime > baseTimePerLine + (lines.length - 1) * timeIncreasePerLineOut) {
      animatingOut = false;
      currentSentence = (currentSentence + 1) % sentences.length;
      lines = splitIntoLines(sentences[currentSentence], textBoxWidth);
      animationStartTime = p.millis();
      animatingIn = currentSentence !== 0;
      delayStartTime = currentSentence === 0 ? p.millis() : 0;
    }
  }
  
  function splitIntoLines(p, sentence, maxLineWidth) {
    let words = sentence.split(" ");
    let lines = [];
    let line = "";
    for (let i = 0; i < words.length; i++) {
      let newLine = line + (line === "" ? "" : " ") + words[i];
      if (p.textWidth(newLine) > maxLineWidth) {
        lines.push(line);
        line = words[i];
      } else {
        line = newLine;
      }
    }
    lines.push(line);
    return lines;
  }
  
  function easeInCubic(t) {
    return t * t * t;
  }
  
  function easeOutCubic(t) {
    return (--t) * t * t + 1;
  }
  