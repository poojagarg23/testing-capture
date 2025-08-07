import { useEffect, useRef, useState } from 'react';

/**
 * usePullToRefresh – Adds a simple cross-platform pull-to-refresh gesture.
 *
 * How it works:
 * 1. When the user presses (pointerdown) while the page is scrolled to the very top (scrollY === 0),
 *    we remember the starting Y position.
 * 2. While the pointer is held (pointermove) we watch for a downward drag that exceeds the given
 *    threshold.
 * 3. Once the threshold is reached we invoke the callback (defaults to full page reload).
 *
 * This behaviour mimics the native pull-to-refresh in many mobile apps and is also usable with a
 * mouse (click + hold + drag down).
 */
export interface PullToRefreshState {
  isDragging: boolean;
  progress: number; // 0 → 1 where 1 means threshold reached
  isRefreshing: boolean;
}

export default function usePullToRefresh(
  callback?: () => void,
  options?: { threshold?: number; disabled?: boolean },
): PullToRefreshState {
  const { threshold = 80, disabled = false } = options || {};

  const [state, setState] = useState<PullToRefreshState>({
    isDragging: false,
    progress: 0,
    isRefreshing: false,
  });

  const startYRef = useRef<number | null>(null);
  const triggeredRef = useRef(false);
  const prevUserSelectRef = useRef<string>('');
  const userSelectDisabledRef = useRef<boolean>(false);

  useEffect(() => {
    if (disabled) return undefined;

    const onPointerDown = (e: PointerEvent) => {
      // Check if the event target is an input, textarea, contenteditable, or draggable element
      const target = e.target as HTMLElement;

      // Check for form elements
      const isFormElement =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.contentEditable === 'true' ||
        target.closest('[contenteditable="true"]') !== null ||
        target.closest('textarea') !== null ||
        target.closest('input') !== null;

      // Check for draggable elements
      const isDraggableElement =
        target.draggable === true ||
        target.getAttribute('draggable') === 'true' ||
        target.classList.contains('draggable') ||
        target.classList.contains('drag-handle') ||
        target.closest('[draggable="true"]') !== null ||
        target.closest('.draggable') !== null ||
        target.closest('.drag-handle') !== null ||
        !!target.closest('[data-draggable]') ||
        // React Beautiful DND specific classes
        target.closest('[data-rbd-draggable-id]') !== null ||
        target.closest('[data-rbd-drag-handle-draggable-id]') !== null;

      // Skip pull-to-refresh for form elements or draggable elements
      if (isFormElement || isDraggableElement) {
        startYRef.current = null;
        return;
      }

      // Only initiate if at top of the page.
      if (window.scrollY === 0 || document.documentElement.scrollTop === 0) {
        startYRef.current = e.clientY;
        triggeredRef.current = false;
        userSelectDisabledRef.current = false; // reset flag for new interaction
        setState({ isDragging: true, progress: 0, isRefreshing: false });
      } else {
        startYRef.current = null;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (startYRef.current === null || triggeredRef.current) return;

      // Also check during move events if we're now interacting with form elements or draggables
      const activeTarget = document.activeElement as HTMLElement;
      const moveTarget = e.target as HTMLElement;

      // Check if we're focused on a form element
      const isFormElementActive =
        activeTarget &&
        (activeTarget.tagName === 'INPUT' ||
          activeTarget.tagName === 'TEXTAREA' ||
          activeTarget.tagName === 'SELECT' ||
          activeTarget.getAttribute('contenteditable') === 'true');

      // Check if we're interacting with a draggable element
      const isDraggableElementActive =
        moveTarget &&
        (moveTarget.draggable === true ||
          moveTarget.getAttribute('draggable') === 'true' ||
          moveTarget.classList.contains('draggable') ||
          moveTarget.classList.contains('drag-handle') ||
          moveTarget.closest('[draggable="true"]') !== null ||
          moveTarget.closest('.draggable') !== null ||
          moveTarget.closest('.drag-handle') !== null ||
          !!moveTarget.closest('[data-draggable]') ||
          // React Beautiful DND specific classes
          moveTarget.closest('[data-rbd-draggable-id]') !== null ||
          moveTarget.closest('[data-rbd-drag-handle-draggable-id]') !== null);

      if (isFormElementActive || isDraggableElementActive) {
        // Cancel pull-to-refresh if we're focused on form element or interacting with draggable
        startYRef.current = null;
        setState({ isDragging: false, progress: 0, isRefreshing: false });
        return;
      }

      const delta = e.clientY - startYRef.current;
      if (delta < 0) return; // Ignore upward movement

      const progress = Math.min(delta / threshold, 1);
      setState((prev) => ({ ...prev, progress }));

      if (delta >= threshold) {
        triggeredRef.current = true;
        setState({ isDragging: false, progress: 1, isRefreshing: true });

        // Give the UI a brief moment to show the spinner before the reload.
        const executeRefresh = () => (callback || (() => window.location.reload()))();
        // 150 ms delay feels snappy yet visible.
        setTimeout(executeRefresh, 150);
      }

      // Disable text selection only when a real downward drag occurs. This allows long-press text
      // selection when the user simply taps/holds without moving.
      if (delta > 0 && !userSelectDisabledRef.current) {
        prevUserSelectRef.current = document.body.style.userSelect;
        document.body.style.userSelect = 'none';
        userSelectDisabledRef.current = true;
      }
    };

    const reset = () => {
      startYRef.current = null;
      triggeredRef.current = false;
      setState({ isDragging: false, progress: 0, isRefreshing: false });
      if (userSelectDisabledRef.current) {
        document.body.style.userSelect = prevUserSelectRef.current;
      }
    };

    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', reset, { passive: true });
    window.addEventListener('pointercancel', reset, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', reset);
      window.removeEventListener('pointercancel', reset);
    };
  }, [callback, threshold, disabled]);

  return state;
}
