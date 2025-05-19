import React, { useEffect, useState } from 'react';

// Helper component to position tooltips relative to target elements
const TutorialPositioner = ({ targetSelector, position, children }) => {
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const positionTooltip = () => {
      const targetElement = document.querySelector(targetSelector);
      
      if (!targetElement) {
        setVisible(false);
        return;
      }
      
      const rect = targetElement.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      let top = 0;
      let left = 0;
      
      switch (position) {
        case 'top':
          top = rect.top + scrollTop - 10;
          left = rect.left + scrollLeft + rect.width / 2;
          break;
        case 'bottom':
          top = rect.bottom + scrollTop + 10;
          left = rect.left + scrollLeft + rect.width / 2;
          break;
        case 'left':
          top = rect.top + scrollTop + rect.height / 2;
          left = rect.left + scrollLeft - 10;
          break;
        case 'right':
          top = rect.top + scrollTop + rect.height / 2;
          left = rect.right + scrollLeft + 10;
          break;
        default:
          top = rect.top + scrollTop + rect.height / 2;
          left = rect.left + scrollLeft + rect.width / 2;
      }
      
      setCoords({ top, left });
      setVisible(true);
    };
    
    positionTooltip();
    
    // Reposition on resize or scroll
    window.addEventListener('resize', positionTooltip);
    window.addEventListener('scroll', positionTooltip);
    
    return () => {
      window.removeEventListener('resize', positionTooltip);
      window.removeEventListener('scroll', positionTooltip);
    };
  }, [targetSelector, position]);
  
  if (!visible) return null;
  
  const tooltipStyle = {
    position: 'absolute',
    top: `${coords.top}px`,
    left: `${coords.left}px`,
    zIndex: 1000,
  };
  
  // Apply position-specific styles
  switch (position) {
    case 'top':
      tooltipStyle.transform = 'translate(-50%, -100%)';
      break;
    case 'bottom':
      tooltipStyle.transform = 'translate(-50%, 0)';
      break;
    case 'left':
      tooltipStyle.transform = 'translate(-100%, -50%)';
      break;
    case 'right':
      tooltipStyle.transform = 'translate(0, -50%)';
      break;
    default:
      tooltipStyle.transform = 'translate(-50%, -50%)';
  }
  
  return (
    <div 
      style={tooltipStyle} 
      className={`tutorial-tooltip ${position}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
};

export default TutorialPositioner;