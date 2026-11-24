import { Modal, View } from 'react-native';

import { Button } from '@/shared/ui/Button';
import { Text } from '@/shared/ui/Text';

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  description: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  isConfirming?: boolean;
};

export function ConfirmDialog({
  visible,
  title,
  description,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
  isConfirming = false,
}: ConfirmDialogProps) {
  function handleCancel() {
    if (isConfirming) return;
    onCancel();
  }

  function handleConfirm() {
    onConfirm();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View className="flex-1 items-center justify-center bg-black/60 px-24">
        <View className="rounded-30 bg-surface-default pt-30 pb-30 w-full px-20">
          <Text className="text-strong text-heading-1 text-center font-semibold">
            {title}
          </Text>
          <Text className="text-primary text-body-2 mt-[22px] text-center font-semibold">
            {description}
          </Text>
          <View className="mt-[42px] flex-row gap-12">
            <Button
              label={cancelLabel}
              variant="light"
              onPress={handleCancel}
              isDisabled={isConfirming}
              className="bg-gray-1 flex-1"
            />
            <Button
              label={confirmLabel}
              variant="error"
              onPress={handleConfirm}
              isDisabled={isConfirming}
              className="flex-1"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
