import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  PROGRESS_STORAGE_KEY,
  getProgressState,
  loadProgress,
  resetProgressStoreForTests,
  saveChapterProgress,
} from "@/features/progress/progressStore";

const bookmark = (positionMs: number) => ({
  positionMs,
  completed: false,
  lastOpenedAt: 1,
});

beforeEach(async () => {
  resetProgressStoreForTests();
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe("progressStore", () => {
  it("is not loaded until the device has been read", async () => {
    expect(getProgressState()).toEqual({ loaded: false, byChapter: {} });
    await loadProgress();
    expect(getProgressState()).toEqual({ loaded: true, byChapter: {} });
  });

  it("loads what a previous session stored", async () => {
    await AsyncStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({ "1": bookmark(660_000) }),
    );
    await loadProgress();
    expect(getProgressState().byChapter).toEqual({ "1": bookmark(660_000) });
  });

  it("survives a restart: a saved position is read back", async () => {
    await loadProgress();
    saveChapterProgress("1", bookmark(660_000));

    resetProgressStoreForTests();
    await loadProgress();
    expect(getProgressState().byChapter["1"]).toEqual(bookmark(660_000));
  });

  it("keeps other chapters when one is saved", async () => {
    await loadProgress();
    saveChapterProgress("1", bookmark(1000));
    saveChapterProgress("2", bookmark(2000));
    saveChapterProgress("1", bookmark(3000));

    const stored = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);
    expect(JSON.parse(stored as string)).toEqual({
      "1": bookmark(3000),
      "2": bookmark(2000),
    });
  });

  it("reads the device only once", async () => {
    await Promise.all([loadProgress(), loadProgress()]);
    await loadProgress();
    expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
  });

  it("keeps a save made while the first read is in flight", async () => {
    await AsyncStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({ "1": bookmark(1000), "2": bookmark(2000) }),
    );
    const loading = loadProgress();
    saveChapterProgress("1", bookmark(9000));
    await loading;

    expect(getProgressState().byChapter).toEqual({
      "1": bookmark(9000),
      "2": bookmark(2000),
    });
  });

  it("starts empty when the stored data is corrupt", async () => {
    await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, "{not json");
    await loadProgress();
    expect(getProgressState()).toEqual({ loaded: true, byChapter: {} });
  });

  it("starts empty when the device read fails", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error("io"));
    await loadProgress();
    expect(getProgressState()).toEqual({ loaded: true, byChapter: {} });
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
