import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import '../styles/BackToTop.css';

const BackToTop = (): JSX.Element => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const toggleVisibility = (): void => {
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = (): void => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className={`back-to-top-container ${isVisible ? 'visible' : ''}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="back-to-top"
              onClick={scrollToTop}
              aria-label="Back to top"
            >
              <ArrowUp className="back-to-top-icon" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="font-medium">
            Back to Top
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default BackToTop;
