import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import '../styles/BackToTop.css';

const BackToTop = (): JSX.Element => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

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
    <div 
      className={`back-to-top-container ${isVisible ? 'visible' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        className="back-to-top"
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <ArrowUp className="back-to-top-icon" />
        {isHovered && <span className="back-to-top-text">Back to Top</span>}
      </button>
    </div>
  );
};

export default BackToTop;
