function calculateWordTiming(words, totalDuration = 10) {
  // Calculate total characters
  const totalCharacters = words.reduce((sum, word) => sum + word.length, 0);

  // Calculate time per character
  const timePerChar = totalDuration / totalCharacters;

  let currentTime = 0;
  return words.map((word) => {
    const wordDuration = word.length * timePerChar;
    const timing = {
      word,
      start: currentTime,
      end: currentTime + wordDuration,
    };
    currentTime += wordDuration;
    return timing;
  });
}

export { calculateWordTiming };
