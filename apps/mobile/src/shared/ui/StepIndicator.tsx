import { View } from 'react-native';

type StepIndicatorProps = {
  stepCount: number;
  currentStepIndex: number;
  className?: string;
};

export function StepIndicator({
  stepCount,
  currentStepIndex,
  className,
}: StepIndicatorProps) {
  const steps = Array.from({ length: stepCount }, (_, stepIndex) => stepIndex);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 1,
        max: stepCount,
        now: currentStepIndex + 1,
      }}
      className={`flex-row gap-4 ${className ?? ''}`}
    >
      {steps.map((stepIndex) => (
        <View
          key={stepIndex}
          className={`h-[2px] flex-1 ${stepIndex <= currentStepIndex ? 'bg-gray-6' : 'bg-gray-2'}`}
        />
      ))}
    </View>
  );
}
