import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type AppSubmitButtonProps = {
  isPending?: boolean;
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  disabled?: boolean;
};

const AppSubmitButton = ({
  isPending,
  children,
  pendingLabel = "Submitting...",
  className,
  disabled = false,
}: AppSubmitButtonProps) => {
  const isDisabled = isPending || disabled;
  return (
    <Button
      type="submit"
      className={cn("w-full", className)}
      disabled={isDisabled}
    >
      {isPending ? (
        <>
          {" "}
          <Loader2 className="animate-spin" aria-hidden="true" />
          {pendingLabel ? pendingLabel : children}{" "}
        </>
      ) : (
        children
      )}
    </Button>
  );
};
export default AppSubmitButton;
