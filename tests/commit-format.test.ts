/**
 * @zjex/git-workflow - Commit Message 格式化测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import { execSync } from 'child_process';

// Mock fs functions for testing
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return {
    ...actual,
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    existsSync: vi.fn(),
  };
});

const mockReadFileSync = vi.mocked(readFileSync);
const mockWriteFileSync = vi.mocked(writeFileSync);
const mockExistsSync = vi.mocked(existsSync);

// 导入要测试的函数（需要从脚本中提取）
const EMOJI_MAP = {
  feat: '✨',
  fix: '🐛', 
  docs: '📝',
  style: '💄',
  refactor: '♻️',
  perf: '⚡️',
  test: '✅',
  build: '📦',
  ci: '👷',
  chore: '🔧',
  revert: '⏪',
  merge: '🔀',
  release: '🔖',
  hotfix: '🚑',
  security: '🔒',
  breaking: '💥'
};

/**
 * 解析 commit message
 */
function parseCommitMessage(message: string) {
  const cleanMessage = message.trim();
  
  // 检测是否以 emoji 开头
  const emojiMatch = cleanMessage.match(/^(\p{Emoji})\s*/u);
  const hasEmoji = emojiMatch !== null;
  const currentEmoji = hasEmoji ? emojiMatch[1] : null;
  
  // 移除 emoji 后的消息
  const messageWithoutEmoji = hasEmoji 
    ? cleanMessage.replace(/^(\p{Emoji})\s*/u, '').trim()
    : cleanMessage;
  
  // 解析 Conventional Commits 格式: type(scope): subject
  const conventionalMatch = messageWithoutEmoji.match(/^(\w+)(\([^)]+\))?(!)?:\s*(.+)/);
  
  if (!conventionalMatch) {
    return {
      isConventional: false,
      hasEmoji,
      currentEmoji,
      originalMessage: message,
      cleanMessage: messageWithoutEmoji
    };
  }
  
  const [, type, scope, breaking, subject] = conventionalMatch;
  
  return {
    isConventional: true,
    hasEmoji,
    currentEmoji,
    type: type.toLowerCase(),
    scope: scope || '',
    breaking: breaking === '!',
    subject,
    originalMessage: message,
    cleanMessage: messageWithoutEmoji,
    messageWithoutEmoji
  };
}

/**
 * 获取正确的 emoji
 */
function getCorrectEmoji(type: string): string {
  return EMOJI_MAP[type as keyof typeof EMOJI_MAP] || EMOJI_MAP.chore;
}

/**
 * 检查 emoji 是否匹配 type
 */
function isEmojiCorrect(emoji: string, type: string): boolean {
  return emoji === getCorrectEmoji(type);
}

/**
 * 格式化 commit message
 */
function formatCommitMessage(message: string) {
  const parsed = parseCommitMessage(message);
  
  // 如果不是 Conventional Commits 格式，不处理
  if (!parsed.isConventional) {
    return {
      needsUpdate: false,
      originalMessage: message,
      formattedMessage: message,
      reason: 'Not a conventional commit format'
    };
  }
  
  const correctEmoji = getCorrectEmoji(parsed.type);
  let needsUpdate = false;
  let reason = '';
  
  // 检查是否需要更新
  if (!parsed.hasEmoji) {
    needsUpdate = true;
    reason = `Added missing emoji for type '${parsed.type}'`;
  } else if (!isEmojiCorrect(parsed.currentEmoji!, parsed.type)) {
    needsUpdate = true;
    reason = `Replaced incorrect emoji '${parsed.currentEmoji}' with '${correctEmoji}' for type '${parsed.type}'`;
  }
  
  // 构建格式化后的消息
  const formattedMessage = needsUpdate 
    ? `${correctEmoji} ${parsed.messageWithoutEmoji}`
    : message;
  
  return {
    needsUpdate,
    originalMessage: message,
    formattedMessage,
    reason,
    type: parsed.type,
    currentEmoji: parsed.currentEmoji,
    correctEmoji
  };
}

describe('Commit Message 格式化', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('parseCommitMessage', () => {
    it('应该正确解析没有emoji的conventional commit', () => {
      const result = parseCommitMessage('feat(auth): 添加用户登录功能');
      
      expect(result.isConventional).toBe(true);
      expect(result.hasEmoji).toBe(false);
      expect(result.type).toBe('feat');
      expect(result.subject).toBe('添加用户登录功能');
    });

    it('应该正确解析带emoji的conventional commit', () => {
      const result = parseCommitMessage('✨ feat(auth): 添加用户登录功能');
      
      expect(result.isConventional).toBe(true);
      expect(result.hasEmoji).toBe(true);
      expect(result.currentEmoji).toBe('✨');
      expect(result.type).toBe('feat');
      expect(result.subject).toBe('添加用户登录功能');
    });

    it('应该正确解析没有scope的commit', () => {
      const result = parseCommitMessage('fix: 修复bug');
      
      expect(result.isConventional).toBe(true);
      expect(result.type).toBe('fix');
      expect(result.scope).toBe('');
      expect(result.subject).toBe('修复bug');
    });

    it('应该识别非conventional格式的commit', () => {
      const result = parseCommitMessage('add new feature');
      
      expect(result.isConventional).toBe(false);
      expect(result.hasEmoji).toBe(false);
    });

    it('应该正确处理breaking change', () => {
      const result = parseCommitMessage('feat!: 重大更新');
      
      expect(result.isConventional).toBe(true);
      expect(result.breaking).toBe(true);
      expect(result.type).toBe('feat');
    });
  });

  describe('getCorrectEmoji', () => {
    it('应该返回正确的emoji', () => {
      expect(getCorrectEmoji('feat')).toBe('✨');
      expect(getCorrectEmoji('fix')).toBe('🐛');
      expect(getCorrectEmoji('docs')).toBe('📝');
      expect(getCorrectEmoji('chore')).toBe('🔧');
    });

    it('应该为未知类型返回默认emoji', () => {
      expect(getCorrectEmoji('unknown')).toBe('🔧');
    });
  });

  describe('isEmojiCorrect', () => {
    it('应该正确判断emoji是否匹配', () => {
      expect(isEmojiCorrect('✨', 'feat')).toBe(true);
      expect(isEmojiCorrect('🐛', 'feat')).toBe(false);
      expect(isEmojiCorrect('🐛', 'fix')).toBe(true);
    });
  });

  describe('formatCommitMessage', () => {
    it('应该为没有emoji的commit添加emoji', () => {
      const result = formatCommitMessage('feat(auth): 添加用户登录功能');
      
      expect(result.needsUpdate).toBe(true);
      expect(result.formattedMessage).toBe('✨ feat(auth): 添加用户登录功能');
      expect(result.reason).toBe("Added missing emoji for type 'feat'");
    });

    it('应该替换错误的emoji', () => {
      const result = formatCommitMessage('🐛 feat(auth): 添加用户登录功能');
      
      expect(result.needsUpdate).toBe(true);
      expect(result.formattedMessage).toBe('✨ feat(auth): 添加用户登录功能');
      expect(result.reason).toBe("Replaced incorrect emoji '🐛' with '✨' for type 'feat'");
    });

    it('应该保持正确的emoji不变', () => {
      const result = formatCommitMessage('✨ feat(auth): 添加用户登录功能');
      
      expect(result.needsUpdate).toBe(false);
      expect(result.formattedMessage).toBe('✨ feat(auth): 添加用户登录功能');
    });

    it('应该不处理非conventional格式的commit', () => {
      const result = formatCommitMessage('add new feature');
      
      expect(result.needsUpdate).toBe(false);
      expect(result.formattedMessage).toBe('add new feature');
      expect(result.reason).toBe('Not a conventional commit format');
    });

    it('应该处理各种commit类型', () => {
      const testCases = [
        { input: 'fix: 修复bug', expected: '🐛 fix: 修复bug' },
        { input: 'docs: 更新文档', expected: '📝 docs: 更新文档' },
        { input: 'style: 代码格式化', expected: '💄 style: 代码格式化' },
        { input: 'refactor: 重构代码', expected: '♻️ refactor: 重构代码' },
        { input: 'test: 添加测试', expected: '✅ test: 添加测试' },
        { input: 'chore: 更新依赖', expected: '🔧 chore: 更新依赖' },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = formatCommitMessage(input);
        expect(result.formattedMessage).toBe(expected);
        expect(result.needsUpdate).toBe(true);
      });
    });

    it('应该处理带scope的commit', () => {
      const result = formatCommitMessage('feat(api): 添加新接口');
      
      expect(result.needsUpdate).toBe(true);
      expect(result.formattedMessage).toBe('✨ feat(api): 添加新接口');
    });

    it('应该处理breaking change', () => {
      const result = formatCommitMessage('feat!: 重大更新');
      
      expect(result.needsUpdate).toBe(true);
      expect(result.formattedMessage).toBe('✨ feat!: 重大更新');
    });

    describe('所有commit类型测试', () => {
      it('应该正确处理所有支持的commit类型', () => {
        const allTypes = [
          { type: 'feat', emoji: '✨', desc: '新增功能' },
          { type: 'fix', emoji: '🐛', desc: '修复bug' },
          { type: 'docs', emoji: '📝', desc: '更新文档' },
          { type: 'style', emoji: '💄', desc: '代码格式化' },
          { type: 'refactor', emoji: '♻️', desc: '重构代码' },
          { type: 'perf', emoji: '⚡️', desc: '性能优化' },
          { type: 'test', emoji: '✅', desc: '添加测试' },
          { type: 'build', emoji: '📦', desc: '构建相关' },
          { type: 'ci', emoji: '👷', desc: 'CI配置' },
          { type: 'chore', emoji: '🔧', desc: '杂项' },
          { type: 'revert', emoji: '⏪', desc: '回滚' },
          { type: 'merge', emoji: '🔀', desc: '合并' },
          { type: 'release', emoji: '🔖', desc: '发布' },
          { type: 'hotfix', emoji: '🚑', desc: '热修复' },
          { type: 'security', emoji: '🔒', desc: '安全修复' }
        ];

        allTypes.forEach(({ type, emoji, desc }) => {
          const input = `${type}: ${desc}`;
          const expected = `${emoji} ${type}: ${desc}`;
          const result = formatCommitMessage(input);
          
          expect(result.needsUpdate).toBe(true);
          expect(result.formattedMessage).toBe(expected);
          expect(result.type).toBe(type);
          expect(result.correctEmoji).toBe(emoji);
        });
      });
    });

    describe('错误emoji替换测试', () => {
      it('应该替换所有类型的错误emoji', () => {
        const wrongEmojiTests = [
          { input: '🐛 feat: 新功能', expected: '✨ feat: 新功能', wrongEmoji: '🐛', correctEmoji: '✨' },
          { input: '✨ fix: 修复bug', expected: '🐛 fix: 修复bug', wrongEmoji: '✨', correctEmoji: '🐛' },
          { input: '🔧 docs: 更新文档', expected: '📝 docs: 更新文档', wrongEmoji: '🔧', correctEmoji: '📝' },
          { input: '📝 style: 格式化', expected: '💄 style: 格式化', wrongEmoji: '📝', correctEmoji: '💄' },
          { input: '💄 refactor: 重构', expected: '♻️ refactor: 重构', wrongEmoji: '💄', correctEmoji: '♻️' }
        ];

        wrongEmojiTests.forEach(({ input, expected, wrongEmoji, correctEmoji }) => {
          const result = formatCommitMessage(input);
          
          expect(result.needsUpdate).toBe(true);
          expect(result.formattedMessage).toBe(expected);
          expect(result.currentEmoji).toBe(wrongEmoji);
          expect(result.correctEmoji).toBe(correctEmoji);
          expect(result.reason).toContain(`Replaced incorrect emoji '${wrongEmoji}' with '${correctEmoji}'`);
        });
      });
    });

    describe('复杂scope测试', () => {
      it('应该处理各种复杂的scope格式', () => {
        const scopeTests = [
          { input: 'feat(api): 添加接口', expected: '✨ feat(api): 添加接口' },
          { input: 'fix(ui/button): 修复按钮', expected: '🐛 fix(ui/button): 修复按钮' },
          { input: 'docs(readme): 更新说明', expected: '📝 docs(readme): 更新说明' },
          { input: 'chore(deps): 更新依赖', expected: '🔧 chore(deps): 更新依赖' },
          { input: 'feat(user-auth): OAuth登录', expected: '✨ feat(user-auth): OAuth登录' }
        ];

        scopeTests.forEach(({ input, expected }) => {
          const result = formatCommitMessage(input);
          expect(result.formattedMessage).toBe(expected);
          expect(result.needsUpdate).toBe(true);
        });
      });
    });

    describe('breaking change测试', () => {
      it('应该处理各种breaking change格式', () => {
        const breakingTests = [
          { input: 'feat!: 重大更新', expected: '✨ feat!: 重大更新' },
          { input: 'fix!: 破坏性修复', expected: '🐛 fix!: 破坏性修复' },
          { input: 'feat(api)!: 重构接口', expected: '✨ feat(api)!: 重构接口' },
          { input: 'refactor(core)!: 核心重构', expected: '♻️ refactor(core)!: 核心重构' }
        ];

        breakingTests.forEach(({ input, expected }) => {
          const result = formatCommitMessage(input);
          expect(result.formattedMessage).toBe(expected);
          expect(result.needsUpdate).toBe(true);
        });
      });
    });

    describe('大小写处理测试', () => {
      it('应该正确处理不同大小写的commit类型', () => {
        const caseTests = [
          { input: 'FEAT: 大写功能', expected: '✨ FEAT: 大写功能' },
          { input: 'Fix: 首字母大写', expected: '🐛 Fix: 首字母大写' },
          { input: 'DoCs: 混合大小写', expected: '📝 DoCs: 混合大小写' }
        ];

        caseTests.forEach(({ input, expected }) => {
          const result = formatCommitMessage(input);
          expect(result.formattedMessage).toBe(expected);
          expect(result.needsUpdate).toBe(true);
        });
      });
    });

    describe('未知类型处理', () => {
      it('应该为未知类型使用默认emoji', () => {
        const unknownTests = [
          { input: 'unknown: 未知类型', expected: '🔧 unknown: 未知类型' },
          { input: 'custom: 自定义类型', expected: '🔧 custom: 自定义类型' },
          { input: 'deploy: 部署相关', expected: '🔧 deploy: 部署相关' }
        ];

        unknownTests.forEach(({ input, expected }) => {
          const result = formatCommitMessage(input);
          expect(result.formattedMessage).toBe(expected);
          expect(result.needsUpdate).toBe(true);
          expect(result.correctEmoji).toBe('🔧');
        });
      });
    });

    describe('多语言支持测试', () => {
      it('应该支持中英文混合的commit message', () => {
        const multiLangTests = [
          { input: 'feat: add user authentication', expected: '✨ feat: add user authentication' },
          { input: 'fix: resolve login issue', expected: '🐛 fix: resolve login issue' },
          { input: 'docs: update API documentation', expected: '📝 docs: update API documentation' },
          { input: 'feat(api): 添加用户认证接口', expected: '✨ feat(api): 添加用户认证接口' },
          { input: 'fix(ui): 修复登录页面样式问题', expected: '🐛 fix(ui): 修复登录页面样式问题' }
        ];

        multiLangTests.forEach(({ input, expected }) => {
          const result = formatCommitMessage(input);
          expect(result.formattedMessage).toBe(expected);
          expect(result.needsUpdate).toBe(true);
        });
      });
    });
  });

  describe('边界情况', () => {
    it('应该处理空消息', () => {
      const result = formatCommitMessage('');
      
      expect(result.needsUpdate).toBe(false);
      expect(result.formattedMessage).toBe('');
    });

    it('应该处理只有空格的消息', () => {
      const result = formatCommitMessage('   ');
      
      expect(result.needsUpdate).toBe(false);
      expect(result.formattedMessage).toBe('   ');
    });

    it('应该处理merge commit', () => {
      const result = formatCommitMessage('Merge branch "feature" into main');
      
      expect(result.needsUpdate).toBe(false);
      expect(result.formattedMessage).toBe('Merge branch "feature" into main');
    });

    it('应该处理多行commit message', () => {
      const multilineMessage = `feat: 添加新功能

这是详细描述
- 功能1
- 功能2`;
      
      const result = formatCommitMessage(multilineMessage);
      
      expect(result.needsUpdate).toBe(true);
      expect(result.formattedMessage).toContain('✨ feat: 添加新功能');
    });

    describe('特殊格式处理', () => {
      it('应该处理多个空格的commit', () => {
        const result = formatCommitMessage('feat:    添加功能');
        expect(result.formattedMessage).toBe('✨ feat:    添加功能');
        expect(result.needsUpdate).toBe(true);
      });

      it('应该处理带tab的commit', () => {
        const result = formatCommitMessage('feat:\t添加功能');
        expect(result.formattedMessage).toBe('✨ feat:\t添加功能');
        expect(result.needsUpdate).toBe(true);
      });

      it('应该处理前后有空格的commit', () => {
        const result = formatCommitMessage('  feat: 添加功能  ');
        expect(result.formattedMessage).toBe('✨ feat: 添加功能');
        expect(result.needsUpdate).toBe(true);
      });
    });

    describe('特殊commit类型', () => {
      it('应该跳过Merge类型的commit', () => {
        const mergeTests = [
          'Merge branch "feature" into main',
          'Merge pull request #123 from feature/branch',
          'Merge remote-tracking branch "origin/main"'
        ];

        mergeTests.forEach(input => {
          const result = formatCommitMessage(input);
          expect(result.needsUpdate).toBe(false);
          expect(result.formattedMessage).toBe(input);
        });
      });

      it('应该跳过Revert类型的Git commit', () => {
        const revertCommit = 'Revert "feat: 添加新功能"';
        const result = formatCommitMessage(revertCommit);
        
        expect(result.needsUpdate).toBe(false);
        expect(result.formattedMessage).toBe(revertCommit);
      });
    });

    describe('emoji边界测试', () => {
      it('应该处理emoji后有多个空格的情况', () => {
        const result = formatCommitMessage('✨   feat: 添加功能');
        expect(result.needsUpdate).toBe(false);
        expect(result.formattedMessage).toBe('✨   feat: 添加功能');
      });

      it('应该处理emoji和类型之间没有空格的情况', () => {
        const result = formatCommitMessage('✨feat: 添加功能');
        expect(result.needsUpdate).toBe(false);
        expect(result.formattedMessage).toBe('✨feat: 添加功能');
      });
    });

    describe('长消息处理', () => {
      it('应该处理超长的commit消息', () => {
        const longMessage = 'feat: ' + 'a'.repeat(200);
        const result = formatCommitMessage(longMessage);
        
        expect(result.needsUpdate).toBe(true);
        expect(result.formattedMessage).toBe('✨ ' + longMessage);
      });

      it('应该处理包含特殊字符的commit', () => {
        const specialChars = 'feat: 添加功能 @#$%^&*()_+-=[]{}|;:,.<>?';
        const result = formatCommitMessage(specialChars);
        
        expect(result.needsUpdate).toBe(true);
        expect(result.formattedMessage).toBe('✨ ' + specialChars);
      });
    });
  });
});