import { Audio } from "expo-av";

function AudioService() {
  let sound = null;
  let isPlaying = false;
  let position = 0;
  let duration = 0;
  let intervalId = null;

  async function loadAudio(audioPath) {
    try {
      if (sound) {
        console.log("Loading audio...");

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
        const status = await sound.getStatusAsync();
        position = status.positionMillis;
        updateTimeCallback(position);

        if (status.didJustFinish) {
          stop(updateTimeCallback);
        }
      }, 50);

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
      position = 0;
      isPlaying = false;

      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }

      updateTimeCallback(0);
      return true;
    } catch (error) {
      console.error("Error stopping audio:", error);
      return false;
    }
  }

  async function seekTo(position, updateTimeCallback) {
    if (!sound) return false;

    try {
      await sound.setPositionAsync(position);
      position = position;
      updateTimeCallback(position);
      return true;
    } catch (error) {
      console.error("Error seeking audio:", error);
      return false;
    }
  }

  function cleanup() {
    if (intervalId) {
      clearInterval(intervalId);
    }

    if (sound) {
      sound.unloadAsync();
      sound = null;
    }
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
  };
}
const audioService = AudioService();
export default audioService;
