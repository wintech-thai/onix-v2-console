import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TestRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  ruleDefinition: string;
}

export const TestRuleModal = ({
  isOpen,
  onClose,
  ruleDefinition,
}: TestRuleModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Test Rule</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded text-xs font-mono whitespace-pre-wrap max-h-[300px] overflow-auto">
            {ruleDefinition || "No rule definition"}
          </div>
          <div className="text-center text-muted-foreground py-8">
            Test functionality coming soon...
          </div>
          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
