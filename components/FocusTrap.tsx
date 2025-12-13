import React, { useEffect, useRef } from 'react';

interface FocusTrapProps {
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
  role?: string;
  'aria-modal'?: boolean;
  'aria-label'?: string;
}

const FocusTrap: React.FC<FocusTrapProps> = ({ 
  children, 
  isActive = true, 
  className = "",
  role = "dialog",
  'aria-modal': ariaModal = true,
  'aria-label': ariaLabel
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    // Salvar o elemento que tinha foco antes de abrir o modal
    previousFocus.current = document.activeElement as HTMLElement;

    const focusableElementsSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const modalElement = containerRef.current;

    if (modalElement) {
      // Focar no primeiro elemento focável ou no próprio container
      const focusableContent = modalElement.querySelectorAll(focusableElementsSelector);
      if (focusableContent.length > 0) {
        (focusableContent[0] as HTMLElement).focus();
      } else {
        modalElement.focus();
      }

      const handleTabKey = (e: KeyboardEvent) => {
        const focusables = modalElement.querySelectorAll(focusableElementsSelector);
        const firstElement = focusables[0] as HTMLElement;
        const lastElement = focusables[focusables.length - 1] as HTMLElement;

        if (e.shiftKey) { // Shift + Tab
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else { // Tab
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          handleTabKey(e);
        }
      };

      modalElement.addEventListener('keydown', handleKeyDown);

      return () => {
        modalElement.removeEventListener('keydown', handleKeyDown);
        // Retornar o foco ao elemento anterior ao fechar
        if (previousFocus.current) {
          previousFocus.current.focus();
        }
      };
    }
  }, [isActive]);

  return (
    <div 
      ref={containerRef} 
      className={className} 
      role={role} 
      aria-modal={ariaModal}
      aria-label={ariaLabel}
      tabIndex={-1}
    >
      {children}
    </div>
  );
};

export default FocusTrap;