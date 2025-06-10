import { Audio } from "expo-av";

function AudioService() {
  let sound = null;
  let isPlaying = false;
  let currentPosition = 0;
  let duration = 0;
  let intervalId = null;

  async function loadAudio(audioPath) {
    try {
      if (sound) {
        console.log("Unloading previous audio...");
        await sound.unloadAsync();
      }
      console.log("Loading audio...");

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: true,
        playThroughEarpieceAndroid: false,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(audioPath, {
        shouldPlay: false,
      });

      sound = newSound;
      const status = await sound.getStatusAsync();
      duration = status.durationMillis;
      return true;
    } catch (error) {
      console.error("Error loading audio:", error);
      return false;
    }
  }

  async function play(updateTimeCallback) {
    if (!sound) return false;

    try {
      await sound.playAsync();
      isPlaying = true;

      // Clear existing interval if any
      if (intervalId) {
        clearInterval(intervalId);
      }

      // Track playback position
      intervalId = setInterval(async () => {
        try {
          const status = await sound.getStatusAsync();
          currentPosition = status.positionMillis;

          if (updateTimeCallback) {
            updateTimeCallback(currentPosition);
          }

          if (status.didJustFinish) {
            stop(updateTimeCallback);
          }
        } catch (error) {
          console.error("Error in playback interval:", error);
          clearInterval(intervalId);
        }
      }, 33);

      return true;
    } catch (error) {
      console.error("Error playing audio:", error);
      return false;
    }
  }

  async function pause() {
    if (!sound || !isPlaying) return false;

    try {
      await sound.pauseAsync();
      isPlaying = false;

      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }

      return true;
    } catch (error) {
      console.error("Error pausing audio:", error);
      return false;
    }
  }

  async function stop(updateTimeCallback) {
    if (!sound) return false;

    try {
      await sound.stopAsync();
      await sound.setPositionAsync(0);
      currentPosition = 0;
      isPlaying = false;

      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }

      if (updateTimeCallback) {
        updateTimeCallback(0);
      }

      return true;
    } catch (error) {
      console.error("Error stopping audio:", error);
      return false;
    }
  }

  async function seekTo(newPosition, updateTimeCallback) {
    if (!sound) return false;

    try {
      // Ensure position is within valid range
      newPosition = Math.max(0, Math.min(newPosition, duration));

      await sound.setPositionAsync(newPosition);
      currentPosition = newPosition;

      if (updateTimeCallback) {
        updateTimeCallback(newPosition);
      }

      return true;
    } catch (error) {
      console.error("Error seeking audio:", error);
      return false;
    }
  }

  function cleanup() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }

    if (sound) {
      sound.unloadAsync();
      sound = null;
    }

    isPlaying = false;
    currentPosition = 0;
    duration = 0;
  }

  return {
    loadAudio,
    play,
    pause,
    stop,
    seekTo,
    cleanup,
    get duration() {
      return duration;
    },
    get position() {
      return currentPosition;
    },
    get isPlaying() {
      return isPlaying;
    },
  };
}

const audioService = AudioService();
export default audioService;
