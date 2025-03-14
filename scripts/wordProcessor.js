function processWordTimings(lessonData, language) {
  try {
    // Add proper checks to ensure the data structure exists
    if (!lessonData || !lessonData[language] || !lessonData[language].words) {
      console.error(
        `Missing data structure for ${language}. Expected lessonData[${language}].words`
      );
      return [];
    }

    const words = lessonData[language].words;

    // Check if words is an array
    if (!Array.isArray(words)) {
      console.error(
        `Expected words to be an array for ${language}, but got:`,
        typeof words
      );
      return [];
    }

    // Log the first word to help with debugging
    if (words.length > 0) {
      console.log(
        `First word object for ${language}:`,
        JSON.stringify(words[0])
      );
    } else {
      console.log(`No words found for ${language}`);
      return [];
    }

    // Process sentence-based timings into individual words
    return words.flatMap((sentenceObj, sentenceIndex) => {
      // Check if word property exists
      if (!sentenceObj.word) {
        console.error(
          `Missing 'word' property in sentence object at index ${sentenceIndex}`
        );
        return [];
      }

      // Check if start and end times exist
      if (sentenceObj.start === undefined || sentenceObj.end === undefined) {
        console.error(
          `Missing 'start' or 'end' property in sentence object at index ${sentenceIndex}`
        );
        return [];
      }

      const wordsInSentence = sentenceObj.word.split(/\s+/);
      const timePerWord =
        (sentenceObj.end - sentenceObj.start) / wordsInSentence.length;

      return wordsInSentence.map((word, idx) => ({
        id: `${language}-${sentenceObj.start}-${idx}`,
        word: word.trim(),
        start: sentenceObj.start + timePerWord * idx,
        end: sentenceObj.start + timePerWord * (idx + 1),
        sentenceId: sentenceObj.start,
        sentenceIndex,
      }));
    });
  } catch (error) {
    console.error(`Error processing ${language} word timings:`, error);
    return [];
  }
}

function formatTime(milliseconds) {
  if (milliseconds === undefined || milliseconds === null) {
    return "00:00"; // Return default if milliseconds is undefined
  }

  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

// Export both functions as named exports
export { processWordTimings, formatTime };

// Also export processWordTimings as the default
export default processWordTimings;
