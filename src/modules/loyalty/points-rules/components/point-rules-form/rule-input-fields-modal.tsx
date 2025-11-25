import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";
import { getRuleInputFieldsApi } from "../../api/fetch-rule-input-field.api";
import { useParams } from "next/navigation";

interface RuleInputFieldsModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggeredEvent: string;
}

export const RuleInputFieldsModal = ({
  isOpen,
  onClose,
  triggeredEvent,
}: RuleInputFieldsModalProps) => {
  const params = useParams();
  const orgId = params?.orgId as string;

  const { data, isLoading } = getRuleInputFieldsApi.useGetRuleInputFields(
    { triggeredEvent, orgId },
    isOpen
  );

  const fields = data?.data || [];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${text} to clipboard`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Available Input Fields</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : fields.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No input fields found for this event.
            </div>
          ) : (
            <div className="space-y-2">
              {fields.map((field) => (
                <div
                  key={field.fieldName}
                  className="flex items-center justify-between p-2 border rounded hover:bg-muted/50"
                >
                  <div>
                    <div className="font-medium">{field.fieldName}</div>
                    <div className="text-xs text-muted-foreground">
                      {field.fieldType}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(field.fieldName)}
                  >
                    <CopyIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
