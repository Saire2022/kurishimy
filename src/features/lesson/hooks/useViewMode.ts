import { useState, useCallback } from "react";
import type { ViewMode } from "@/types/lesson";
import { es } from "@/i18n/es";

const VIEW_MODE_CYCLE: ViewMode[] = ["kichwa", "spanish", "dual"];

const MODE_LABELS: Record<ViewMode, string> = es.viewModes;

export function useViewMode(initial: ViewMode = "dual") {
  const [viewMode, setViewMode] = useState<ViewMode>(initial);

  const cycleViewMode = useCallback(() => {
    setViewMode((prev) => {
      const index = VIEW_MODE_CYCLE.indexOf(prev);
      return VIEW_MODE_CYCLE[(index + 1) % VIEW_MODE_CYCLE.length];
    });
  }, []);

  const nextMode =
    VIEW_MODE_CYCLE[
      (VIEW_MODE_CYCLE.indexOf(viewMode) + 1) % VIEW_MODE_CYCLE.length
    ];

  return {
    viewMode,
    cycleViewMode,
    /** Label of the mode the switch button will change to. */
    nextModeLabel: MODE_LABELS[nextMode],
  };
}
