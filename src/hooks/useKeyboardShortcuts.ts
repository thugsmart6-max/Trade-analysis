"use client";

import { useEffect } from "react";

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  handler: () => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      for (const shortcut of shortcuts) {
        const ctrl = shortcut.ctrlKey || shortcut.metaKey;
        const isCtrl = ctrl ? (e.ctrlKey || e.metaKey) : true;
        const isShift = shortcut.shiftKey ? e.shiftKey : !e.shiftKey || !shortcut.shiftKey;

        if (
          e.key.toLowerCase() === shortcut.key.toLowerCase() &&
          isCtrl &&
          isShift
        ) {
          // Don't fire in text inputs unless it's Ctrl+S / Ctrl+Enter
          const target = e.target as HTMLElement;
          const isInput =
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable;

          if (isInput && !ctrl) continue;

          e.preventDefault();
          shortcut.handler();
          break;
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}
