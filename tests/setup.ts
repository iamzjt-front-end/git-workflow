import { vi } from "vitest";

// 在测试环境中抑制console输出，保持测试输出清洁
// 但仍然允许测试验证console.log的调用

// 保存原始的console方法
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
};

// Mock console方法，但不输出到终端
console.log = vi.fn();
console.error = vi.fn();
console.warn = vi.fn();
console.info = vi.fn();

// 如果需要在测试中实际输出（调试用），可以使用这些方法
(global as any).originalConsole = originalConsole;