import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Ensures every route change starts at the very top of the page.
 * Uses instant scroll + rAF retries to defeat async content that
 * shifts layout after mount (images, lazy chunks, TipTap render).
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Skip if navigating to an in-page anchor
    if (window.location.hash) return;

    const jump = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    jump();
    // Retry after paint(s) — content loaded async can push scroll down
    const r1 = requestAnimationFrame(() => {
      jump();
      const r2 = requestAnimationFrame(jump);
      (jump as any)._r2 = r2;
    });
    const t = setTimeout(jump, 150);

    return () => {
      cancelAnimationFrame(r1);
      clearTimeout(t);
    };
  }, [pathname]);

  return null;
};

export default ScrollToTop;
