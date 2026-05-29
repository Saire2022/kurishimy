import { useState, useCallback } from "react";
import type { ViewMode } from "@/types/lesson";

const VIEW_MODE_CYCLE: ViewMode[] = ["kichwa", "spanish", "dual"];

export function useViewMode(initial: ViewMode = "dual") {
  const [viewMode, setViewMode] = useState<ViewMode>(initial);

  const cycleViewMode = useCallback(() => {
    setViewMode((prev) => {
      const index = VIEW_MODE_CYCLE.indexOf(prev);
      return VIEW_MODE_CYCLE[(index + 1) % VIEW_MODE_CYCLE.length];
    });
  }, []);

  const viewModeLabel =
    viewMode === "kichwa"
      ? "Kichwa"
      : viewMode === "spanish"
        ? "Spanish"
        : "Kichwa / Spanish";

  const switchLabel =
    viewMode === "kichwa"
      ? "Switch to Spanish"
      : viewMode === "spanish"
        ? "Switch to Dual View"
        : "Switch to Kichwa";

  return { viewMode, cycleViewMode, viewModeLabel, switchLabel };
}
