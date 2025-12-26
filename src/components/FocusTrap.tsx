import React, { useEffect, useRef } from 'react';

interface FocusTrapProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const FocusTrap: React.FC<FocusTrapProps> = ({ children, ...props }) => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const focusableElements = root.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    root.addEventListener('keydown', handleTab);
    // Focar no primeiro elemento ao montar
    if (firstElement) firstElement.focus();

    return () => root.removeEventListener('keydown', handleTab);
  }, []);

  return <div ref={rootRef} {...props}>{children}</div>;
};

export default FocusTrap;
