# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Audio assets

Chapter audio ships inside the binary, so the encode is the ceiling on how much content
the app can hold. Every chapter is stored as **48 kbps mono AAC** in `assets/audio/`,
which keeps a 13-minute chapter at roughly 4.8 MB — about 20 chapters before the Play
Store's 200 MB AAB limit forces Play Asset Delivery.

Encode every new chapter with exactly this command so all chapters match:

```bash
ffmpeg -i cap1.mp3 -c:a aac -b:a 48k -ac 1 -ar 44100 cap1.m4a
```

Mono because the narration is a single voice, and 48 kbps because speech has far less
spectral content than music. Commit only the `.m4a`.

### Masters

Do **not** commit the high-bitrate masters — they are 5× the size of the shipped encode
and only needed to re-encode. The 256 kbps stereo master for chapter 1 is archived
outside the repo at:

```
~/Documents/react-native/kurishimy-audio-masters/cap1.mp3
```

That path is a working archive on one machine, not a backup — mirror it to cloud storage
so a re-encode is possible from any checkout.

### Timings

Re-encoding does not change duration, so the word timings in
`src/content/chapters/Chapter1.json` stay valid. If you replace an audio file, confirm the
new file is sample-aligned with the old one before assuming the timings still hold.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
