import { fireEvent, render, screen } from "@testing-library/react";
import { ChatInput } from "./ChatInput";

function setup() {
  const onSend = vi.fn();
  render(<ChatInput onSend={onSend} />);
  const input = screen.getByLabelText("メッセージ");
  return { onSend, input };
}

describe("ChatInput (IME-safe)", () => {
  it("does not send on Enter while IME composition is active", () => {
    const { onSend, input } = setup();
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: "べんごし" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSend).not.toHaveBeenCalled();
    expect(input).toHaveValue("べんごし");
  });

  it("sends on Enter after composition ends", () => {
    const { onSend, input } = setup();
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: "弁護士" } });
    fireEvent.compositionEnd(input);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSend).toHaveBeenCalledWith("弁護士");
    expect(input).toHaveValue("");
  });

  it("ignores Enter flagged isComposing or keyCode 229 (Safari order)", () => {
    const { onSend, input } = setup();
    fireEvent.change(input, { target: { value: "てすと" } });
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    fireEvent.keyDown(input, { key: "Enter", keyCode: 229 });
    expect(onSend).not.toHaveBeenCalled();
  });

  it("does not send blank input", () => {
    const { onSend, input } = setup();
    fireEvent.change(input, { target: { value: "　 " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSend).not.toHaveBeenCalled();
  });
});
