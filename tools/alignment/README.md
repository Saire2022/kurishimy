# Alignment prototype (offline, not app code)

A first attempt at generating word timings by sending chapter audio to the
`ctaguchi/killkan_asr` model on HuggingFace. It belongs to the offline content
pipeline (Phase 3 in the roadmap), not to the app: nothing under `app/` or
`src/` may import from this folder.

## Status: broken prototype

- `sendAudioToHuggingFace.js` was written to run inside the app (it uses
  `expo-asset`, `expo-file-system` and `alert`) and requires
  `assets/audio/1.mp3`, which no longer exists. It needs rewriting as a plain
  Node script before it can run.
- `calculateWordTiming.js` does not align anything — it spreads the words
  evenly across the duration by character count.

## API key

The script reads `HUGGING_FACE_API_KEY` from the environment. Never give it an
`EXPO_PUBLIC_` prefix: Expo inlines every `EXPO_PUBLIC_*` variable into the
shipped JS bundle, which would publish the key.
