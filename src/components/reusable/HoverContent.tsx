import React, { useState, useRef, useEffect, MouseEvent } from 'react';
import { HoverContentProps } from '../../types/HoverContent.types.ts';

const HoverContent: React.FC<HoverContentProps> = ({
  children,
  hoverContent,
  position = 'top',
  maxHeight = '300px',
  className = '',
}) => {
  const [showContent, setShowContent] = useState<boolean>(false);
  const [hoverPosition, setHoverPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearHideTimeout = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const scheduleHide = () => {
    clearHideTimeout();
    hideTimeoutRef.current = setTimeout(() => {
      setShowContent(false);
    }, 300); // 300ms delay before hiding
  };

  const calculateOptimalPosition = (rect: DOMRect) => {
    let top: number, left: number;

    // Initial position calculation
    switch (position) {
      case 'bottom':
        top = rect.bottom + 2;
        left = rect.left + rect.width / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left - 2;
        break;
      case 'right':
        top = rect.top + rect.height / 2;
        left = rect.right + 2;
        break;
      case 'top':
      default:
        top = rect.top - 2;
        left = rect.left + rect.width / 2;
        break;
    }

    // Estimate content dimensions (conservative estimates)
    const estimatedWidth = 300;
    const estimatedHeight = 200;

    // Apply transform calculations to get final bounds
    let finalLeft = left;
    let finalTop = top;

    switch (position) {
      case 'bottom':
        finalLeft = left - estimatedWidth / 2;
        break;
      case 'left':
        finalLeft = left - estimatedWidth;
        finalTop = top - estimatedHeight / 2;
        break;
      case 'right':
        finalTop = top - estimatedHeight / 2;
        break;
      case 'top':
      default:
        finalLeft = left - estimatedWidth / 2;
        finalTop = top - estimatedHeight;
        break;
    }

    // Viewport boundary checks with immediate adjustment
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if (finalLeft + estimatedWidth > windowWidth) {
      left = windowWidth - estimatedWidth - 10;
    } else if (finalLeft < 0) {
      left = 10;
    }

    if (finalTop + estimatedHeight > windowHeight) {
      top = windowHeight - estimatedHeight - 10;
    } else if (finalTop < 0) {
      if (position === 'top') {
        top = 10 + estimatedHeight;
      } else {
        top = 10;
      }
    }

    return { top, left };
  };

  const handleMouseEnter = () => {
    clearHideTimeout();

    if (triggerRef.current && hoverContent) {
      const rect = triggerRef.current.getBoundingClientRect();
      const optimalPosition = calculateOptimalPosition(rect);

      setHoverPosition(optimalPosition);
      setShowContent(true);
    }
  };

  const handleMouseLeave = (e: MouseEvent) => {
    if (contentRef.current && contentRef.current.contains(e.relatedTarget as Node)) {
      return;
    }
    scheduleHide();
  };

  const handleContentMouseEnter = () => {
    clearHideTimeout();
  };

  const handleContentMouseLeave = (e: MouseEvent) => {
    if (triggerRef.current && triggerRef.current.contains(e.relatedTarget as Node)) {
      return;
    }
    scheduleHide();
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };

  const getTransform = () => {
    switch (position) {
      case 'bottom':
        return 'translate(-50%, 0)';
      case 'left':
        return 'translate(-100%, -50%)';
      case 'right':
        return 'translate(0, -50%)';
      case 'top':
      default:
        return 'translate(-50%, -100%)';
    }
  };

  // Handle clicking outside to close hover content (mobile-friendly)
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (
        showContent &&
        triggerRef.current &&
        contentRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        !contentRef.current.contains(event.target as Node)
      ) {
        setShowContent(false);
      }
    };

    if (showContent) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showContent]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      clearHideTimeout();
    };
  }, []);

  return (
    <div
      className={`relative inline-block ${className}`}
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseEnter} // Touch support for mobile
    >
      {children}

      {showContent && (
        <div
          ref={contentRef}
          className="fixed bg-white border border-input rounded-lg p-3 shadow-lg overflow-y-auto whitespace-normal break-words pointer-events-auto select-text z-[9999]  animate-fadeIn scrollbar-thin"
          style={{
            top: `${hoverPosition.top}px`,
            left: `${hoverPosition.left}px`,
            transform: getTransform(),
            maxHeight,
            width: 'auto',
            maxWidth: '90vw',
          }}
          onMouseEnter={handleContentMouseEnter}
          onMouseLeave={handleContentMouseLeave}
          onWheel={handleWheel}
          onTouchStart={(e) => e.stopPropagation()} // Prevent touch conflicts
        >
          {hoverContent}
        </div>
      )}
    </div>
  );
};

export default HoverContent;
