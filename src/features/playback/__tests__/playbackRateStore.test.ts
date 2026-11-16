import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  PLAYBACK_RATE_STORAGE_KEY,
  getPlaybackRate,
  loadPlaybackRate,
  resetPlaybackRateStoreForTests,
  savePlaybackRate,
} from "@/features/playback/playbackRateStore";

beforeEach(async () => {
  resetPlaybackRateStoreForTests();
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe("playbackRateStore", () => {
  it("starts at 1× when nothing is stored", async () => {
    expect(getPlaybackRate()).toBe(1);
    await loadPlaybackRate();
    expect(getPlaybackRate()).toBe(1);
  });

  it("survives a restart: a chosen speed is read back", async () => {
    await loadPlaybackRate();
    savePlaybackRate(0.75);
    expect(getPlaybackRate()).toBe(0.75);

    resetPlaybackRateStoreForTests();
    expect(getPlaybackRate()).toBe(1);
    await loadPlaybackRate();
    expect(getPlaybackRate()).toBe(0.75);
  });

  it("writes the speed to the device", async () => {
    savePlaybackRate(1.5);
    expect(await AsyncStorage.getItem(PLAYBACK_RATE_STORAGE_KEY)).toBe("1.5");
  });

  it("reads the device only once", async () => {
    await Promise.all([loadPlaybackRate(), loadPlaybackRate()]);
    await loadPlaybackRate();
    expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
  });

  it("keeps a speed picked while the first read is in flight", async () => {
    await AsyncStorage.setItem(PLAYBACK_RATE_STORAGE_KEY, "1.5");
    const loading = loadPlaybackRate();
    savePlaybackRate(1);
    await loading;
    expect(getPlaybackRate()).toBe(1);
  });

  it("falls back to 1× when the stored value is not an offered speed", async () => {
    await AsyncStorage.setItem(PLAYBACK_RATE_STORAGE_KEY, "3");
    await loadPlaybackRate();
    expect(getPlaybackRate()).toBe(1);
  });

  it("falls back to 1× when the device read fails", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error("io"));
    await loadPlaybackRate();
    expect(getPlaybackRate()).toBe(1);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
