// MorphDialog keeps Radix Dialog's behaviour (role, label, Escape); long forms can refuse Escape /
// outside clicks so typed input is not thrown away. jsdom has no layout, so the shared-layout exit
// never finishes here: the tests read Radix's open state instead of waiting for the panel to unmount
// (the browser e2e tests cover that).
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { MorphDialog } from "@/components/motion/MorphDialog";
import { DialogTitle } from "@/components/ui/dialog";

const Harness = ({ preventDismiss }: { preventDismiss?: boolean }) => {
  const [open, setOpen] = useState(false);
  return (
    <MorphDialog
      layoutId="test-morph"
      open={open}
      onOpenChange={setOpen}
      preventDismiss={preventDismiss}
      trigger={<button type="button">Create item</button>}
    >
      <DialogTitle>Create item</DialogTitle>
      <input aria-label="Name" />
    </MorphDialog>
  );
};

describe("MorphDialog", () => {
  it("opens as a labelled dialog from its trigger and closes with Escape", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "Create item" }));
    const dialog = await screen.findByRole("dialog", { name: "Create item" });
    expect(dialog).toHaveAttribute("data-state", "open");

    await user.keyboard("{Escape}");
    await waitFor(() => expect(dialog).toHaveAttribute("data-state", "closed"));
  });

  it("with preventDismiss, Escape keeps the form and its input; the Close button still closes it", async () => {
    const user = userEvent.setup();
    render(<Harness preventDismiss />);

    await user.click(screen.getByRole("button", { name: "Create item" }));
    const dialog = await screen.findByRole("dialog", { name: "Create item" });
    await user.type(screen.getByLabelText("Name"), "Cardiology");

    await user.keyboard("{Escape}");
    expect(dialog).toHaveAttribute("data-state", "open");
    expect(screen.getByLabelText("Name")).toHaveValue("Cardiology");

    await user.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(dialog).toHaveAttribute("data-state", "closed"));
  });
});
