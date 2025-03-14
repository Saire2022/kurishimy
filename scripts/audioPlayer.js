import { Audio } from "expo-av";

const audiopath = require("../assets/audio/cap1.mp3");
// Load Audio

async function loadSound(setSound) {
  try {
    // Request audio permissions first
    const permission = await Audio.requestPermissionsAsync();
    if (permission.status !== "granted") {
      alert("Need audio permissions to play");
      return null;
    }

    // Set audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      staysActiveInBackground: true,
      playThroughEarpieceAndroid: false,
    });

    // Load audio (but don't play)
    const { sound: newSound } = await Audio.Sound.createAsync(audiopath, {
      shouldPlay: false,
    });

    // Set the sound state
    setSound(newSound);
    return newSound;
  } catch (error) {
    console.error("Error loading sound:", error);
    alert("Error loading audio file");
    return null;
  }
}

async function playAudio(setSound, setIsPlaying, setCurrentTime, intervalRef) {
  try {
    // Request audio permissions first
    const permission = await Audio.requestPermissionsAsync();
    if (permission.status !== "granted") {
      alert("Need audio permissions to play");
      return;
    }

    // Load and play audio
    const { sound: newSound } = await Audio.Sound.createAsync(audiopath, {
      shouldPlay: true,
    });

    setSound(newSound);
    setIsPlaying(true);

    // Update current time
    intervalRef.current = setInterval(async () => {
      const status = await newSound.getStatusAsync();
      setCurrentTime(status.positionMillis / 1000);

      // Stop interval when audio ends
      if (status.didJustFinish) {
        clearInterval(intervalRef.current);
        setIsPlaying(false);
        setCurrentTime(0);
      }
    }, 100);
  } catch (error) {
    console.error("Error loading audio:", error);
    alert("Error loading audio file");
  }
}

// Pause Audio
async function pauseAudio(sound, setIsPlaying, intervalRef) {
  try {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
      //clearInterval(intervalRef.current);
    }
  } catch (error) {
    console.error("Error pausing audio:", error);
  }
}

// Stop Audio
async function stopAudio(sound, setCurrentTime, setIsPlaying, intervalRef) {
  try {
    if (sound) {
      await sound.stopAsync();
      await sound.setPositionAsync(0);
      setCurrentTime(0);
      setIsPlaying(false);
      clearInterval(intervalRef.current);
    }
  } catch (error) {
    console.error("Error stopping audio:", error);
  }
}

export { loadSound, playAudio, pauseAudio, stopAudio };
