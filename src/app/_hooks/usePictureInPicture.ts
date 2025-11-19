"use client";

import { useCallback, useRef, useState } from "react";

interface UsePictureInPictureOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  isRunning: boolean;
  onPipOpen?: () => void;
  onPipClose?: () => void;
}

type PipWindow = Window;

export function usePictureInPicture({
  containerRef,
  isRunning,
  onPipOpen,
  onPipClose,
}: UsePictureInPictureOptions) {
  const pipWindowRef = useRef<Window | null>(null);
  const [isInPip, setIsInPip] = useState(false);
  const pipPermissionGrantedRef = useRef(false);
  const originalStyleRef = useRef<{
    margin: string;
    padding: string;
    maxWidth: string;
    width: string;
  } | null>(null);
  const originalParentRef = useRef<HTMLElement | null>(null);
  const originalNextSiblingRef = useRef<Node | null>(null);
  const openPipWindow = useCallback(async () => {
    if (typeof window === "undefined") return false;
    
    const isPipSupported = "documentPictureInPicture" in window;
    if (!isPipSupported) {
      console.warn("Document Picture-in-Picture API 불가능한 브라우저입니다. ");
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
      originalParentRef.current = timerContainer.parentElement;
      originalNextSiblingRef.current = timerContainer.nextSibling;
      originalStyleRef.current = {
        margin: timerContainer.style.margin,
        padding: timerContainer.style.padding,
        maxWidth: timerContainer.style.maxWidth,
        width: timerContainer.style.width,
      };
      if (originalParentRef.current) {
        originalParentRef.current.setAttribute('data-timer-container-parent', 'true');
      }
      timerContainer.style.margin = "0";
      timerContainer.style.padding = "20px";
      timerContainer.style.maxWidth = "100%";
      timerContainer.style.width = "100%";
      
      pipWindow.document.body.style.padding = "20px";
      pipWindow.document.body.style.width = "100%";
      pipWindow.document.body.style.height = "100%";
      pipWindow.document.body.style.overflow = "auto";
      
      pipWindow.document.body.appendChild(timerContainer);

      pipWindow.addEventListener("pagehide", () => {
        setIsInPip(false);
        pipWindowRef.current = null;
        
        // 원래 상태 유지하도록 체크 
        const originalParent = originalParentRef.current || document.querySelector('[data-timer-container-parent]') as HTMLElement;
        if (originalParent && timerContainer && originalStyleRef.current) {
          timerContainer.style.margin = originalStyleRef.current.margin || "";
          timerContainer.style.padding = originalStyleRef.current.padding || "";
          timerContainer.style.maxWidth = originalStyleRef.current.maxWidth || "";
          timerContainer.style.width = originalStyleRef.current.width || "";
          if (originalNextSiblingRef.current && originalNextSiblingRef.current.parentNode === originalParent) {
            originalParent.insertBefore(timerContainer, originalNextSiblingRef.current);
          } else {
            originalParent.appendChild(timerContainer);
          }
          originalParent.removeAttribute('data-timer-container-parent');
          originalStyleRef.current = null;
          originalParentRef.current = null;
          originalNextSiblingRef.current = null;
        }
        
        onPipClose?.();
      });

      onPipOpen?.();
      return true;
    } catch (error) {
      console.error("Failed to open Picture-in-Picture window:", error);
      return false;
    }
  }, [isRunning, isInPip, containerRef, onPipOpen, onPipClose]);
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

