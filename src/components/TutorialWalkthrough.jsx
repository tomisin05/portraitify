import React, { useState } from "react";
import { createPortal } from "react-dom";

const TutorialWalkthrough = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);

  // Define tutorial steps - images will be added later
  const tutorialSteps = [
    {
      title: "Welcome to Portraitify!",
      content:
        "This quick tutorial will guide you through creating professional AI portraits. Let's get started!",
      image: null,
    },
    {
      title: "Step 1: Train Your Model",
      content:
        "First, you'll need to train an AI model with your photos. Upload 10-15 clear photos of yourself (you should be the only person in the photo and your face must be visible) and give your model a name. Training costs 2.50 credits.",
      image: "/train.png",
    },
    {
      title: "Step 2: Select Your Model",
      content:
        "After training, your model will appear in the dropdown menu. You can train multiple models and select which one to use for generating portraits.",
      image: "/select.png",
    },
    {
      title: "Step 3: Customize Your Portrait I",
      content:
        "Choose between using the guided form with specific options for attire, setting, style, lighting, and pose, or write your own custom prompt for complete creative control.",
      image: "/customize.png",
    },
    {
      title: "Step 3: Customize Your Portrait II",
      content:
        "Or use the AI Prompt Generator to create detailed portrait prompts. Upload a reference photo or provide a description, and our AI will generate a professional prompt that you can use or customize further.",
      image: "/prompt-generator.png",
    },
    {
      title: "Step 4: Generate Your Portrait",
      content:
        "Click 'Generate Portrait' to create your AI portrait. Each generation costs 0.25 credits and the result will be saved to your gallery automatically.",
      image: "/generate.png",
    },
    {
      title: "Adding Credits",
      content: (
        <div>
          <p>You'll need credits to use Portraitify:</p>
          <ul className="list-disc pl-5 mt-2">
            <li>Training a model costs 2.50 credits</li>
            <li>Generating a portrait costs 0.25 credits</li>
          </ul>
          <p className="mt-2 font-bold">
            $10.00 is only a suggestion - you can purchase more or less credits
            based on your needs!
          </p>
        </div>
      ),
      image: "/credit.png",
    },
    {
      title: "View Your Gallery",
      content:
        "All your generated portraits will be saved in your gallery. You can access them anytime and download your favorites.",
      image: "gallery.png",
    },
    {
      title: "You're All Set!",
      content:
        "You now know how to use Portraitify. Enjoy creating stunning professional portraits!",
      image: null,
    },
  ];

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const handleBack = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = (e) => {
    e.preventDefault();
    e.stopPropagation();
    completeTutorial();
  };

  const completeTutorial = () => {
    setShowTutorial(false);
    if (onComplete) {
      onComplete();
    }
    localStorage.setItem("tutorialCompleted", "true");
  };

  if (!showTutorial) {
    return null;
  }

  const step = tutorialSteps[currentStep];

  return createPortal(
    <div
      className="tutorial-overlay"
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "auto",
      }}
    >
      <div className="bg-white rounded-lg p-6 max-w-md mx-auto shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-purple-700">{step.title}</h2>

        <div className="mb-6 text-gray-700">{step.content}</div>

        {/* Image placeholder - will be replaced with actual screenshots */}
        {step.image && (
          <div className="my-4 border rounded overflow-hidden">
            <img
              src={step.image}
              alt={`Tutorial step ${currentStep + 1}`}
              style={{
                maxWidth: "100%",
                maxHeight: "350px",
                objectFit: "contain",
              }}
            />
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`px-4 py-2 rounded ${
              currentStep === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gray-500 hover:bg-gray-600 text-white"
            }`}
            type="button"
          >
            Back
          </button>
          <button
            onClick={handleSkip}
            className="px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white"
            type="button"
          >
            Skip Tutorial
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white"
            type="button"
          >
            {currentStep === tutorialSteps.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TutorialWalkthrough;
