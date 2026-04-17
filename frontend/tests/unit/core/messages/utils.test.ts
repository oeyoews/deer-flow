import { expect, test } from "vitest";

import {
  extractContentFromMessage,
  extractReasoningContentFromMessage,
} from "@/core/messages/utils";

test("splits inline <think>...</think> from assistant content", () => {
  const message = {
    type: "ai",
    content: "<think>\n这是思考。\n</think>\n\n这是回答。",
    additional_kwargs: {},
  } as any;

  expect(extractContentFromMessage(message)).toBe("这是回答。");
  expect(extractReasoningContentFromMessage(message)).toBe("这是思考。");
});

test("handles unclosed <think> tag by treating remainder as reasoning", () => {
  const message = {
    type: "ai",
    content: "这是回答前缀。\n<think>\n这是思考但没有闭合标签",
    additional_kwargs: {},
  } as any;

  expect(extractContentFromMessage(message)).toBe("这是回答前缀。");
  expect(extractReasoningContentFromMessage(message)).toBe(
    "这是思考但没有闭合标签",
  );
});

