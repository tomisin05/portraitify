import React, { useState, useEffect } from 'react';
import TutorialWalkthrough from './TutorialWalkthrough';

const TutorialButton = () => {
  const [showTutorial, setShowTutorial] = useState(false);

  const handleTutorialToggle = () => {
    setShowTutorial(true);
    // When manually showing the tutorial, remove the completed flag
    localStorage.removeItem('tutorialCompleted');
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

  return (
    <>
      {!showTutorial && (
        <button 
          className="tutorial-button"
          onClick={handleTutorialToggle}
          aria-label="Show tutorial"
          title="Show Tutorial"
        >
          ?
        </button>
      )}
      
      {showTutorial && (
        <TutorialWalkthrough onComplete={handleTutorialComplete} />
      )}
    </>
  );
};

export default TutorialButton;