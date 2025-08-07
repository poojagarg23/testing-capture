import React from 'react';
import usePullToRefresh from '../../hooks/usePullToRefresh';

const SPINNER_SIZE = 36;
const RING_RADIUS = 14; // in px
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const HEADER_HEIGHT = 60; // Overlay height in px

const ProgressRing: React.FC<{ progress: number }> = ({ progress }) => (
  <svg width={SPINNER_SIZE} height={SPINNER_SIZE} viewBox="0 0 32 32" className="text-primary">
    {/* Background ring */}
    <circle
      cx="16"
      cy="16"
      r={RING_RADIUS}
      stroke="currentColor"
      strokeWidth="3"
      className="opacity-10"
      fill="none"
    />
    {/* Progress arc */}
    <circle
      cx="16"
      cy="16"
      r={RING_RADIUS}
      stroke="currentColor"
      strokeWidth="3"
      fill="none"
      strokeDasharray={CIRCUMFERENCE}
      strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
      strokeLinecap="round"
      className="transition-[stroke-dashoffset] ease-out duration-75"
    />
  </svg>
);

const Spinner: React.FC = () => (
  <svg
    className="animate-spin text-primary"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    style={{ width: SPINNER_SIZE, height: SPINNER_SIZE }}
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
    />
  </svg>
);

const Arrow: React.FC<{ progress: number }> = ({ progress }) => {
  const rotation = progress * 180;
  const bounceClass = progress >= 1 ? 'animate-bounce' : '';
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ width: SPINNER_SIZE, height: SPINNER_SIZE, transform: `rotate(${rotation}deg)` }}
      className={`transition-transform duration-100 ease-out ${bounceClass}`}
    >
      <path d="M12 15.172l-5.364-5.364a1 1 0 011.414-1.414L12 12.343l3.95-3.95a1 1 0 111.414 1.414L12 15.172z" />
    </svg>
  );
};

const PullToRefreshOverlay: React.FC = () => {
  const [isDesktop, setIsDesktop] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return true; // Assume desktop during SSR
    return window.matchMedia('(min-width: 1024px)').matches;
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    // Safari < 14 uses `addListener` instead of `addEventListener`.
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      mediaQuery.addListener(handler);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, []);

  // Disable the pull-to-refresh hook on desktop devices.
  const { isRefreshing, progress } = usePullToRefresh(undefined, { disabled: isDesktop });

  // If we're on desktop or there's no active gesture/refreshing, render nothing.
  if (isDesktop || (progress === 0 && !isRefreshing)) return null;

  // Translate the entire overlay down. Starts hidden (above viewport) and slides down up to the
  // full HEADER_HEIGHT based on the drag progress. When refreshing we keep it fully visible.
  const translateY = isRefreshing ? HEADER_HEIGHT : progress * HEADER_HEIGHT;

  return (
    <div className="fixed inset-x-0 pointer-events-none z-50" style={{ top: -HEADER_HEIGHT }}>
      <div
        style={{ transform: `translateY(${translateY}px)` }}
        className="w-full flex flex-col items-center transition-transform duration-200 ease-out"
      >
        {/* Header bar */}
        <div className="w-full bg-white backdrop-blur-md rounded-b-xl shadow-lg flex flex-col items-center justify-center py-3">
          {/* Icon */}
          {isRefreshing ? (
            <Spinner />
          ) : (
            <div className="relative">
              <ProgressRing progress={progress} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Arrow progress={progress} />
              </div>
            </div>
          )}

          {/* Text label */}
          <span className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-300 select-none">
            {isRefreshing
              ? 'Refreshing…'
              : progress >= 1
                ? 'Release to refresh'
                : 'Pull to refresh'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PullToRefreshOverlay;
