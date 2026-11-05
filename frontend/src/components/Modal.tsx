import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  }[maxWidth];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      {/* Backdrop with smooth blur */}
      <div 
        className="fixed inset-0 bg-[#050303]/75 dark:bg-[#050303]/85 backdrop-blur-md transition-opacity duration-200" 
        onClick={onClose} 
      />

      {/* Modal Dialog Card */}
      <div
        className={`relative w-full ${maxWidthClass} bg-white dark:bg-[#0b0b0b] border border-[#e3dede] dark:border-[#373535] rounded-[24px] shadow-2xl overflow-hidden z-10 animate-slide-up`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eee8e8] dark:border-[#1e1c1c]">
          <h3 id="modal-title" className="text-base sm:text-lg font-medium tracking-normal font-sans text-[#0c0909] dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#9b9a9a] hover:text-[#0c0909] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#ea2845]/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-[#0c0909] dark:text-[#f2efef]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
