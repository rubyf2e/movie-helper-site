import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FloatingAIBot from "../FloatingAIBot";

// Mock Lottie React
jest.mock("lottie-react", () => {
  return function MockLottie(props) {
    return <div data-testid="lottie-animation" style={props.style} />;
  };
});

describe("FloatingAIBot", () => {
  beforeEach(() => {
    // Reset window.scrollY
    Object.defineProperty(window, "scrollY", {
      writable: true,
      value: 0,
    });
  });

  test("不在初始位置顯示", () => {
    render(<FloatingAIBot />);
    expect(screen.queryByText("AI 電影小幫手")).not.toBeInTheDocument();
  });

  test("滾動超過 200px 後顯示", async () => {
    render(<FloatingAIBot />);

    // 模擬滾動
    Object.defineProperty(window, "scrollY", {
      writable: true,
      value: 250,
    });

    fireEvent.scroll(window);

    await waitFor(() => {
      expect(document.querySelector(".floating-ai-bot")).toBeInTheDocument();
    });
  });

  test("點擊按鈕展開聊天介面", async () => {
    render(<FloatingAIBot />);

    // 先觸發滾動讓客服顯示
    Object.defineProperty(window, "scrollY", {
      writable: true,
      value: 250,
    });
    fireEvent.scroll(window);

    await waitFor(() => {
      const botButton = document.querySelector(".ai-bot-button");
      expect(botButton).toBeInTheDocument();
    });

    // 點擊客服按鈕
    const botButton = document.querySelector(".ai-bot-button");
    fireEvent.click(botButton);

    await waitFor(() => {
      expect(screen.getByText("AI 電影小幫手")).toBeInTheDocument();
      expect(
        screen.getByText("👋 嗨！我是電影小幫手 AI，有什麼可以幫助您的嗎？")
      ).toBeInTheDocument();
    });
  });

  test("聊天選項按鈕可以點擊", async () => {
    // Mock alert
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    render(<FloatingAIBot />);

    // 觸發滾動和展開
    Object.defineProperty(window, "scrollY", {
      writable: true,
      value: 250,
    });
    fireEvent.scroll(window);

    await waitFor(() => {
      const botButton = document.querySelector(".ai-bot-button");
      fireEvent.click(botButton);
    });

    await waitFor(() => {
      const movieOption = screen.getByText("🎬 推薦電影");
      fireEvent.click(movieOption);
      expect(alertSpy).toHaveBeenCalled();
    });

    alertSpy.mockRestore();
  });

  test("可以關閉聊天介面", async () => {
    render(<FloatingAIBot />);

    // 觸發滾動和展開
    Object.defineProperty(window, "scrollY", {
      writable: true,
      value: 250,
    });
    fireEvent.scroll(window);

    await waitFor(() => {
      const botButton = document.querySelector(".ai-bot-button");
      fireEvent.click(botButton);
    });

    await waitFor(() => {
      const closeButton = screen.getByText("×");
      fireEvent.click(closeButton);
      expect(screen.queryByText("AI 電影小幫手")).not.toBeInTheDocument();
    });
  });

  test("滾動回頂部時隱藏客服", async () => {
    render(<FloatingAIBot />);

    // 先滾動到顯示位置
    Object.defineProperty(window, "scrollY", {
      writable: true,
      value: 250,
    });
    fireEvent.scroll(window);

    await waitFor(() => {
      expect(document.querySelector(".floating-ai-bot")).toBeInTheDocument();
    });

    // 滾動回頂部
    Object.defineProperty(window, "scrollY", {
      writable: true,
      value: 100,
    });
    fireEvent.scroll(window);

    await waitFor(() => {
      expect(
        document.querySelector(".floating-ai-bot")
      ).not.toBeInTheDocument();
    });
  });

  test("顯示備用方案當 Lottie 載入失敗", async () => {
    // Mock fetch 失敗
    global.fetch = jest.fn().mockRejectedValue(new Error("Failed to load"));

    render(<FloatingAIBot />);

    Object.defineProperty(window, "scrollY", {
      writable: true,
      value: 250,
    });
    fireEvent.scroll(window);

    await waitFor(() => {
      const fallbackIcon = document.querySelector(".ai-bot-fallback");
      expect(fallbackIcon).toBeInTheDocument();
    });
  });
});
