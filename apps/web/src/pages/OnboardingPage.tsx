import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '@influix/ui';

const steps = [
  {
    title: 'Welcome to InfluiX',
    description: 'Let\'s set up your workspace to start understanding why content works.',
  },
  {
    title: 'What do you create?',
    description: 'This helps us tailor AI insights to your content type.',
  },
  {
    title: 'You\'re all set!',
    description: 'Start adding content to receive AI-powered insights.',
  },
];

const contentTypes = [
  { id: 'video', label: 'Short-form video', icon: '🎬' },
  { id: 'text', label: 'Written content', icon: '✍️' },
  { id: 'audio', label: 'Audio/Podcasts', icon: '🎙️' },
  { id: 'mixed', label: 'Multiple types', icon: '🎨' },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState('');

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <Card variant="bordered" padding="lg">
      <div className="space-y-6">
        {/* Progress */}
        <div className="flex gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-primary-500' : 'bg-surface-700'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center py-4">
          <h2 className="text-xl font-semibold text-surface-100">
            {steps[step].title}
          </h2>
          <p className="text-sm text-surface-400 mt-2">
            {steps[step].description}
          </p>
        </div>

        {/* Step content */}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-3">
            {contentTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  selectedType === type.id
                    ? 'border-primary-500 bg-primary-900/20'
                    : 'border-surface-700 hover:border-surface-600'
                }`}
              >
                <span className="text-2xl">{type.icon}</span>
                <p className="mt-2 text-sm font-medium text-surface-100">
                  {type.label}
                </p>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🚀</div>
            <p className="text-surface-300">
              Your workspace is ready. Let's discover what makes content work.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="secondary" onClick={handleBack}>
              Back
            </Button>
          )}
          <Button className="flex-1" onClick={handleNext}>
            {step === steps.length - 1 ? 'Go to Dashboard' : 'Continue'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
