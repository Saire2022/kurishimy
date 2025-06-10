import React, {
  forwardRef,
  memo,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import Word from "./Word";

// Types
interface WordTiming {
  key?: string;
  id?: string;
  word: string;
  start: number;
  end: number;
  segment: number;
}

interface WordProps {
  word: string;
  isActive: boolean;
  isApproaching: boolean;
  onPress: () => void;
}

interface LanguageTextProps {
  wordTimings: WordTiming[];
  currentTime: number;
  onWordPress: (word: WordTiming) => void;
  activeWordRef: React.RefObject<View>;
}

// Observer pattern for word timing updates
class WordTimingObserver {
  private static instance: WordTimingObserver;
  private subscribers: Set<(time: number) => void> = new Set();

  private constructor() {}

  static getInstance(): WordTimingObserver {
    if (!WordTimingObserver.instance) {
      WordTimingObserver.instance = new WordTimingObserver();
    }
    return WordTimingObserver.instance;
  }

  subscribe(callback: (time: number) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify(time: number): void {
    this.subscribers.forEach((callback) => callback(time));
  }
}

// Memoize the Word component with proper types
const MemoizedWord = memo(
  forwardRef<View, WordProps>((props, ref) => <Word {...props} ref={ref} />)
);

// Constants for timing precision
const TIMING_CONSTANTS = {
  ACTIVE_BUFFER: 10,
  APPROACHING_BUFFER: 50,
  UPDATE_INTERVAL: 16,
} as const;

// Custom hook for word timing logic with improved precision
const useWordTiming = (wordTimings: WordTiming[], currentTime: number) => {
  const observer = useMemo(() => WordTimingObserver.getInstance(), []);
  const lastUpdateTime = useRef<number>(0);

  const activeWord = useMemo(() => {
    const now = Date.now();
    // Throttle updates to prevent excessive re-renders
    if (now - lastUpdateTime.current < TIMING_CONSTANTS.UPDATE_INTERVAL) {
      return null;
    }
    lastUpdateTime.current = now;

    return wordTimings.find((word) => {
      const startTime = word.start * 1000;
      const endTime = word.end * 1000;
      return (
        currentTime >= startTime - TIMING_CONSTANTS.ACTIVE_BUFFER &&
        currentTime <= endTime + TIMING_CONSTANTS.ACTIVE_BUFFER
      );
    });
  }, [wordTimings, currentTime]);

  useEffect(() => {
    const unsubscribe = observer.subscribe((time) => {
      // Handle timing updates if needed
    });
    return () => unsubscribe();
  }, [observer]);

  return { activeWord };
};

// Main component
const LanguageText = memo(
  forwardRef<ScrollView, LanguageTextProps>(
    ({ wordTimings, currentTime, onWordPress, activeWordRef }, ref) => {
      const prevActiveWordRef = useRef<string | null>(null);
      const needsScroll = useRef(false);
      const { activeWord } = useWordTiming(wordTimings, currentTime);

      const handleWordPress = useCallback(
        (wordObj: WordTiming) => {
          onWordPress(wordObj);
        },
        [onWordPress]
      );

      useEffect(() => {
        if (activeWord) {
          const wordKey = activeWord.key || activeWord.id || null;
          if (wordKey !== prevActiveWordRef.current) {
            prevActiveWordRef.current = wordKey;
            needsScroll.current = true;
          }
        }
      }, [activeWord]);

      if (!wordTimings?.length) {
        return (
          <ScrollView
            ref={ref}
            horizontal={false}
            style={styles.scrollContainer}
            contentContainerStyle={styles.contentContainer}
          >
            <Text style={styles.noContentText}>No text content available</Text>
          </ScrollView>
        );
      }

      const renderedWords = useMemo(() => {
        return wordTimings.map((wordObj, index) => {
          const startTime = wordObj.start * 1000;
          const endTime = wordObj.end * 1000;

          const isActive =
            currentTime >= startTime - TIMING_CONSTANTS.ACTIVE_BUFFER &&
            currentTime <= endTime + TIMING_CONSTANTS.ACTIVE_BUFFER;

          const isApproaching =
            !isActive &&
            currentTime >= startTime - TIMING_CONSTANTS.APPROACHING_BUFFER &&
            currentTime <= endTime + TIMING_CONSTANTS.APPROACHING_BUFFER;

          const isNewSentence =
            index > 0 && wordObj.segment !== wordTimings[index - 1].segment;

          return (
            <React.Fragment key={wordObj.key || wordObj.id || index}>
              {isNewSentence && <View style={styles.lineBreak} />}
              <MemoizedWord
                ref={isActive ? activeWordRef : null}
                word={wordObj.word}
                isActive={isActive}
                isApproaching={isApproaching}
                onPress={() => handleWordPress(wordObj)}
              />
              <Text style={styles.wordSpace}> </Text>
            </React.Fragment>
          );
        });
      }, [wordTimings, currentTime, activeWordRef, handleWordPress]);

      return (
        <ScrollView
          ref={ref}
          horizontal={false}
          style={styles.scrollContainer}
          contentContainerStyle={styles.contentContainer}
          removeClippedSubviews={false}
        >
          <View style={styles.textContainer}>{renderedWords}</View>
        </ScrollView>
      );
    }
  )
);

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  contentContainer: {
    padding: 16,
  },
  textContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    alignItems: "flex-start",
  },
  wordContainer: {
    marginRight: 0,
    marginBottom: 8,
    borderRadius: 4,
  },
  wordSpace: {
    fontSize: 20,
  },
  activeWordContainer: {
    backgroundColor: "#E3F2FD",
  },
  word: {
    fontSize: 20,
    color: "#333333",
    lineHeight: 32,
  },
  highlightedWord: {
    color: "#2196F3",
    fontWeight: "bold",
  },
  lineBreak: {
    width: "100%",
    height: 16,
  },
  noContentText: {
    fontSize: 18,
    color: "#757575",
    padding: 20,
  },
});

export default LanguageText;
