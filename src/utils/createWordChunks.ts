import type { WordChunk, WordTiming } from "@/types/lesson";

export function createWordChunks(
  wordTimings: WordTiming[],
  chunkSize: number
): WordChunk[] {
  const chunks: WordChunk[] = [];
  let currentChunk: WordChunk["words"] = [];
  let chunkStartTime = 0;
  let chunkEndTime = 0;

  wordTimings.forEach((wordObj, index) => {
    currentChunk.push({
      ...wordObj,
      wordIndex: index,
      displayText: wordObj.word + " ",
    });

    if (currentChunk.length === 1) {
      chunkStartTime = wordObj.start;
    }
    chunkEndTime = wordObj.end;

    if (currentChunk.length === chunkSize || index === wordTimings.length - 1) {
      chunks.push({
        words: currentChunk,
        start: chunkStartTime,
        end: chunkEndTime,
      });
      currentChunk = [];
    }
  });

  return chunks;
}
