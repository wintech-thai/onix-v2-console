import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface BatchOperationOptions<T> {
  items: T[];
  operation: (item: T) => Promise<void>;
  onComplete?: () => void;
  getItemId?: (item: T) => string;
}

interface BatchOperationState {
  isOpen: boolean;
  total: number;
  current: number;
  errors: number;
  currentItem: string;
  isCompleted: boolean;
}

export const useBatchOperation = () => {
  const router = useRouter();
  const isCancelledRef = useRef(false);

  const [state, setState] = useState<BatchOperationState>({
    isOpen: false,
    total: 0,
    current: 0,
    errors: 0,
    currentItem: "",
    isCompleted: false,
  });

  const execute = useCallback(
    async <T,>({
      items,
      operation,
      onComplete,
      getItemId = (item: T) => String(item).substring(0, 8),
    }: BatchOperationOptions<T>) => {
      // Reset cancellation flag
      isCancelledRef.current = false;

      // Initialize progress modal
      setState({
        isOpen: true,
        total: items.length,
        current: 0,
        errors: 0,
        currentItem: "",
        isCompleted: false,
      });

      let errorCount = 0;

      // Process items sequentially with progress updates
      for (let i = 0; i < items.length; i++) {
        // Check if cancelled
        if (isCancelledRef.current) {
          break;
        }

        const item = items[i];

        // Update current item being processed
        setState((prev) => ({
          ...prev,
          currentItem: getItemId(item),
        }));

        try {
          await operation(item);
        } catch (error) {
          errorCount++;
          console.error("Failed to process item:", error);
        }

        // Update progress
        setState((prev) => ({
          ...prev,
          current: i + 1,
          errors: errorCount,
        }));
      }

      // Call onComplete callback if provided
      if (onComplete) {
        await onComplete();
      }

      // Set completion state
      setState((prev) => ({
        ...prev,
        isCompleted: true,
        currentItem: "",
      }));
    },
    []
  );

  const cancel = useCallback(() => {
    isCancelledRef.current = true;
  }, []);

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
    router.back();
  }, [router]);

  const reset = useCallback(() => {
    setState({
      isOpen: false,
      total: 0,
      current: 0,
      errors: 0,
      currentItem: "",
      isCompleted: false,
    });
    isCancelledRef.current = false;
  }, []);

  return {
    state,
    execute,
    cancel,
    close,
    reset,
  };
};
