import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "./App";
import { AppProvider } from "./state/AppContext";
import { STORAGE_KEY } from "./types";

/** Section 11 acceptance script, run through the real UI. */
function renderApp() {
  const user = userEvent.setup();
  const utils = render(
    <AppProvider>
      <App />
    </AppProvider>,
  );
  return { user, ...utils };
}

async function consent(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("radio", { name: /営業時間内/ }));
  const start = screen.getByRole("button", { name: "同意して開始" });
  expect(start).toBeDisabled();
  await user.click(screen.getByRole("checkbox", { name: /利用目的に同意します/ }));
  await user.click(start);
}

async function pick(user: ReturnType<typeof userEvent.setup>, label: string) {
  const group = screen.getByRole("group", { name: "選択肢" });
  await user.click(within(group).getByRole("button", { name: label }));
}

const log = () => screen.getByRole("log", { name: "会話ログ" });

describe("acceptance script", () => {
  it("1. consent gate appears before any question; the chat input is disabled", () => {
    renderApp();
    expect(screen.getByRole("dialog", { name: "ご利用の前に" })).toBeInTheDocument();
    expect(screen.queryByRole("log")).not.toBeInTheDocument();
    expect(screen.getByLabelText("メッセージ")).toBeDisabled();
  });

  it("2. happy path ends in 仮予約 and the dashboard shows 86,000円", async () => {
    const { user } = renderApp();
    await consent(user);
    for (const label of ["7〜10万円", "すぐに", "飼っていない", "来店して見学", "土曜 11:00"]) {
      await pick(user, label);
    }
    expect(within(log()).getByText(/内見の仮予約を承りました/)).toBeInTheDocument();
    expect(log().textContent).not.toContain("予約確定");
    expect(screen.getByTestId("lead-status")).toHaveTextContent("仮予約");
    expect(screen.getByTestId("lead-total")).toHaveTextContent("86,000円");
    expect(screen.getByTestId("stat-tentative")).toHaveTextContent("1");
  });

  it("3. no match with pets hands off; staff queue has 1 item", async () => {
    const { user } = renderApp();
    await consent(user);
    for (const label of ["〜7万円", "1ヶ月以内", "飼っている"]) {
      await pick(user, label);
    }
    expect(within(log()).getByText(/担当者におつなぎします/)).toBeInTheDocument();
    expect(within(screen.getByTestId("staff-queue")).getAllByRole("listitem")).toHaveLength(1);
  });

  it("4. typed 弁護士 hands off with normal priority, reason 法務・契約", async () => {
    const { user } = renderApp();
    await consent(user);
    await user.type(screen.getByLabelText("メッセージ"), "弁護士に相談したい{Enter}");
    expect(screen.getByTestId("queue-reason")).toHaveTextContent("法務・契約");
    expect(screen.getByTestId("queue-priority")).toHaveTextContent("通常");
  });

  it("5. fair-housing question hands off at high priority", async () => {
    const { user } = renderApp();
    await consent(user);
    await user.type(screen.getByLabelText("メッセージ"), "外国人は入居できますか{Enter}");
    expect(screen.getByTestId("queue-reason")).toHaveTextContent("入居差別");
    expect(screen.getByTestId("queue-priority")).toHaveTextContent("高");
    expect(within(log()).getByText(/この内容は担当者からご案内いたします/)).toBeInTheDocument();
  });

  it("6. outside business hours, booking says staff confirms next business day", async () => {
    const { user } = renderApp();
    await consent(user);
    await user.click(screen.getByRole("radio", { name: /営業時間外/ }));
    for (const label of ["7〜10万円", "すぐに", "飼っていない", "現地で待ち合わせ", "土曜 14:00"]) {
      await pick(user, label);
    }
    expect(within(log()).getByText(/翌営業日/)).toBeInTheDocument();
  });

  it("persists across reload and reset clears it", async () => {
    const { user, unmount } = renderApp();
    await consent(user);
    await pick(user, "7〜10万円");
    unmount();
    expect(localStorage.getItem(STORAGE_KEY)).toContain("70to100k");

    renderApp();
    expect(within(log()).getByText("ご入居のご希望時期はいつ頃でしょうか。")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /リセット/ }));
    expect(screen.getByRole("dialog", { name: "ご利用の前に" })).toBeInTheDocument();
  });

  it("declining consent closes the chat", async () => {
    const { user } = renderApp();
    await user.click(screen.getByRole("button", { name: "同意しない" }));
    expect(screen.getByText(/同意をいただけないため/)).toBeInTheDocument();
    expect(screen.getByLabelText("メッセージ")).toBeDisabled();
  });
});
