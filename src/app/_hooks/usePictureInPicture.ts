"use client";

import { useCallback, useRef, useState } from "react";

interface UsePictureInPictureOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  isRunning: boolean;
  onPipOpen?: () => void;
  onPipClose?: () => void;
  onStart?: () => void;
  onPause?: () => void;
  onStop?: () => void;
}

interface PipWindow extends Window {
  __pipClickHandler?: (e: MouseEvent) => void;
}

export function usePictureInPicture({
  containerRef,
  isRunning,
  onPipOpen,
  onPipClose,
  onStart,
  onPause,
  onStop,
}: UsePictureInPictureOptions) {
  const pipWindowRef = useRef<Window | null>(null);
  const [isInPip, setIsInPip] = useState(false);
  const pipPermissionGrantedRef = useRef(false);

  // PIP 창 열기
  const openPipWindow = useCallback(async () => {
    if (typeof window === "undefined") return false;
    
    const isPipSupported = "documentPictureInPicture" in window;
    if (!isPipSupported) {
      console.warn("Document Picture-in-Picture API is not supported in this browser");
      return false;
    }

    if (isInPip || !containerRef.current || !isRunning) {
      return false;
    }

    try {
      const timerContainer = containerRef.current;
      if (!timerContainer) {
        return false;
      }
      const timerDial = timerContainer.querySelector('[class*="bg-neutral-50"]') as HTMLElement;
      const targetRect = timerDial?.getBoundingClientRect() || timerContainer.getBoundingClientRect();
      
      const pipWidth = Math.max(300, Math.ceil(targetRect.width) + 40);
      const pipHeight = Math.max(150, Math.ceil(targetRect.height) + 40);

      // PIP 창 열기
      const pipWindow = (await (window as unknown as Window & {
        documentPictureInPicture: {
          requestWindow: (options: { width: number; height: number }) => Promise<Window>;
        };
      }).documentPictureInPicture.requestWindow({
        width: pipWidth,
        height: pipHeight,
      })) as PipWindow;

      pipWindowRef.current = pipWindow;
      setIsInPip(true);
      pipPermissionGrantedRef.current = true;

      // 스타일 복사
      document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
        try {
          const newLink = pipWindow.document.createElement("link");
          newLink.rel = "stylesheet";
          newLink.href = (link as HTMLLinkElement).href;
          pipWindow.document.head.appendChild(newLink);
        } catch (error) {
          console.warn("Failed to copy stylesheet link:", error);
        }
      });

      document.querySelectorAll('style').forEach((style) => {
        try {
          const newStyle = pipWindow.document.createElement("style");
          newStyle.textContent = style.textContent || "";
          pipWindow.document.head.appendChild(newStyle);
        } catch (error) {
          console.warn("Failed to copy inline style:", error);
        }
      });

      // 기본 스타일
      const baseStyle = pipWindow.document.createElement("style");
      baseStyle.textContent = `
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
          overflow: hidden;
        }
      `;
      pipWindow.document.head.appendChild(baseStyle);

      timerContainer.style.margin = "0";
      timerContainer.style.padding = "20px";
      timerContainer.style.maxWidth = "100%";
      timerContainer.style.width = "100%";
      
      pipWindow.document.body.style.padding = "20px";
      pipWindow.document.body.style.width = "100%";
      pipWindow.document.body.style.height = "100%";
      pipWindow.document.body.style.overflow = "auto";
      
      pipWindow.document.body.appendChild(timerContainer);

      const handlePipClick = (e: MouseEvent) => {
        const button = (e.target as HTMLElement).closest('button');
        if (!button) return;

        e.preventDefault();
        e.stopPropagation();
        
        const action = button.getAttribute('data-pip-action');
        const buttonText = button.textContent?.trim();

        if (action === 'start' || buttonText === '시작할래요' || buttonText === '재개') {
          onStart?.();
        } else if (action === 'pause' || buttonText === '휴식') {
          onPause?.();
        } else if (action === 'stop' || buttonText === '종료') {
          onStop?.();
        }
      };

      pipWindow.document.addEventListener('click', handlePipClick, true);
      pipWindow.__pipClickHandler = handlePipClick;
      pipWindow.addEventListener("pagehide", () => {
        setIsInPip(false);
        pipWindowRef.current = null;
        
        if (pipWindow.__pipClickHandler) {
          pipWindow.document.removeEventListener('click', pipWindow.__pipClickHandler, true);
        }
        
        const originalParent = document.querySelector('[data-timer-container-parent]') as HTMLElement;
        if (originalParent && timerContainer) {
          originalParent.appendChild(timerContainer);
        }
        
        onPipClose?.();
      });

      onPipOpen?.();
      return true;
    } catch (error) {
      console.error("Failed to open Picture-in-Picture window:", error);
      return false;
    }
  }, [isRunning, isInPip, containerRef, onPipOpen, onPipClose, onStart, onPause, onStop]);
  const closePipWindow = useCallback(() => {
    if (pipWindowRef.current) {
      pipWindowRef.current.close();
      setIsInPip(false);
      pipWindowRef.current = null;
    }
  }, []);
  const hasPermission = useCallback(() => {
    return pipPermissionGrantedRef.current;
  }, []);

  return {
    isInPip,
    openPipWindow,
    closePipWindow,
    hasPermission,
  };
}

