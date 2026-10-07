"use client";
// A dialog that grows out of the element that opened it: the trigger and the panel share a
// layoutId, so the button's box morphs into the panel (and back on close) instead of a modal
// popping up. Built on Radix Dialog, so focus trapping, Escape, role="dialog", labelling and focus
// return are unchanged. While open, an invisible copy keeps the trigger's space, so nothing around
// it jumps. With reduced motion the panel simply appears.
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Dialog as DialogPrimitive } from "radix-ui";
import type { ReactElement, ReactNode } from "react";

interface MorphDialogProps {
  // unique per trigger on the page, e.g. `book-${doctorId}`
  layoutId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // the element that opens the dialog (usually a Button); it becomes the morph's start shape
  trigger: ReactElement;
  triggerClassName?: string;
  // classes for the panel (size, padding)
  className?: string;
  children: ReactNode;
  showCloseButton?: boolean;
  // long forms: a stray click outside or Escape must not throw the typed input away (close with
  // the X or Cancel instead)
  preventDismiss?: boolean;
}

const RADIUS = 14;
const keepOpen = (event: Event) => event.preventDefault();

export function MorphDialog({
  layoutId,
  open,
  onOpenChange,
  trigger,
  triggerClassName,
  className,
  children,
  showCloseButton = true,
  preventDismiss = false,
}: MorphDialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {open ? (
        // keeps the trigger's exact size in the layout while the panel is open
        <span className={cn("invisible inline-flex", triggerClassName)} aria-hidden inert>
          {trigger}
        </span>
      ) : (
        <motion.span layoutId={layoutId} transition={springs.morph} style={{ borderRadius: RADIUS }} className={cn("inline-flex", triggerClassName)}>
          <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
        </motion.span>
      )}

      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </DialogPrimitive.Overlay>
            {/* centring with flexbox: the panel's own transform belongs to the morph */}
            <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
              <DialogPrimitive.Content
                asChild
                forceMount
                onInteractOutside={preventDismiss ? keepOpen : undefined}
                onEscapeKeyDown={preventDismiss ? keepOpen : undefined}
              >
                <motion.div
                  layoutId={layoutId}
                  transition={springs.morph}
                  style={{ borderRadius: RADIUS }}
                  data-slot="dialog-content"
                  className={cn(
                    "pointer-events-auto relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden border text-sm text-popover-foreground shadow-2xl outline-none",
                    className,
                  )}
                >
                  {/* contents appear once the shape has grown, and leave first on close */}
                  <motion.div
                    className="flex min-h-0 flex-1 flex-col"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: 0.12, duration: 0.18 } }}
                    exit={{ opacity: 0, transition: { duration: 0.08 } }}
                  >
                    {children}
                  </motion.div>
                  {showCloseButton && (
                    <DialogPrimitive.Close
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                      aria-label="Close"
                    >
                      <XIcon className="h-4 w-4" aria-hidden />
                    </DialogPrimitive.Close>
                  )}
                </motion.div>
              </DialogPrimitive.Content>
            </div>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
