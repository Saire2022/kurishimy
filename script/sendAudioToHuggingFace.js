import axios from "axios";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import { calculateWordTiming } from "./calculateWordTiming";

// Add helper function for converting audio to base64
const convertAudioToBase64 = async (sound) => {
  try {
    if (!sound) {
      throw new Error("No sound object provided");
    }

    const asset = Asset.fromModule(require("../assets/audio/1.mp3"));
    await asset.downloadAsync();

    const fileInfo = await FileSystem.getInfoAsync(asset.localUri);
    if (!fileInfo.exists) {
      throw new Error("Audio file not found");
    }

    const audioData = await FileSystem.readAsStringAsync(asset.localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return audioData;
  } catch (error) {
    console.error("Error in convertAudioToBase64:", error);
    throw error;
  }
};

async function sendAudioToHuggingFace(sound, setWords, maxRetries = 5) {
  // Helper function for delay
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Retry function
  async function tryRequest(retryCount = 0) {
    try {
      if (!sound) {
        alert("No audio loaded to process");
        return;
      }

      const HUGGING_FACE_API_KEY = process.env.EXPO_PUBLIC_HUGGING_FACE_API_KEY;
      const MODEL_URL =
        "https://api-inference.huggingface.co/models/ctaguchi/killkan_asr";

      console.log("Converting audio to base64...");
      const audioBase64 = await convertAudioToBase64(sound);

      if (!audioBase64) {
        throw new Error("Failed to convert audio to base64");
      }

      console.log(
        `Attempt ${retryCount + 1} of ${maxRetries}: Sending to HuggingFace API...`
      );
      const response = await axios.post(
        MODEL_URL,
        { inputs: audioBase64 },
        {
          headers: {
            Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      // If response includes an "error" about the model loading, throw an error to trigger retry
      if (response.data.error && response.data.error.includes("loading")) {
        throw new Error("Model still loading");
      }

      if (response.data && response.data.text) {
        const text = response.data.text;
        const words = text.split(" ");
        const duration = sound
          ? (await sound.getStatusAsync()).durationMillis / 1000
          : 10;
        const wordsWithTiming = calculateWordTiming(words, duration);
        setWords(wordsWithTiming);
        return response.data.text;
      }
    } catch (error) {
      // Check if we should retry
      if (
        retryCount < maxRetries &&
        (error.response?.status === 503 ||
          error.message === "Model still loading")
      ) {
        console.log(`Retrying in ${2 ** retryCount} seconds...`);
        await delay(2 ** retryCount * 1000); // Exponential backoff
        return tryRequest(retryCount + 1);
      }

      // If we're out of retries or it's a different error, throw it
      throw error;
    }
  }

  try {
    return await tryRequest();
  } catch (error) {
    if (error.response?.status === 401) {
      console.error("Authentication failed. Please check your API key.");
      alert("Authentication failed. Please check your API key.");
    } else {
      console.error("Error details:", error.message, error.response?.data);
      alert(
        `Error processing audio after ${maxRetries} attempts: ${error.message}`
      );
    }
  }
}
export { sendAudioToHuggingFace };
