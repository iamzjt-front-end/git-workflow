#!/usr/bin/env node

/**
 * Commit Message Emoji 格式化工具
 * 
 * 功能：
 * 1. 检测 commit message 是否包含 emoji
 * 2. 如果没有 emoji，根据 type 自动添加
 * 3. 如果有 emoji 但与 type 不匹配，自动替换
 * 4. 支持 Conventional Commits 规范
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import path from 'path';

// Emoji 映射表
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
 * @param {string} message - commit message
 * @returns {object} 解析结果
 */
function parseCommitMessage(message) {
  // 移除开头和结尾的空白字符
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
 * @param {string} type - commit type
 * @returns {string} emoji
 */
function getCorrectEmoji(type) {
  return EMOJI_MAP[type] || EMOJI_MAP.chore;
}

/**
 * 检查 emoji 是否匹配 type
 * @param {string} emoji - 当前 emoji
 * @param {string} type - commit type
 * @returns {boolean} 是否匹配
 */
function isEmojiCorrect(emoji, type) {
  return emoji === getCorrectEmoji(type);
}

/**
 * 格式化 commit message
 * @param {string} message - 原始 commit message
 * @returns {object} 格式化结果
 */
function formatCommitMessage(message) {
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
  } else if (!isEmojiCorrect(parsed.currentEmoji, parsed.type)) {
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

/**
 * 检查用户配置是否启用 emoji
 * @returns {boolean} 是否启用 emoji
 */
function isEmojiEnabled() {
  try {
    // 尝试读取配置文件
    const configPaths = ['.gwrc.json', '.gwrc', 'gw.config.json'];
    
    for (const configPath of configPaths) {
      try {
        if (existsSync(configPath)) {
          const config = JSON.parse(readFileSync(configPath, 'utf-8'));
          if (config.useEmoji !== undefined) {
            return config.useEmoji;
          }
        }
      } catch {
        // 继续尝试下一个配置文件
      }
    }
    
    // 尝试读取全局配置
    try {
      const globalConfigPath = path.join(homedir(), '.gwrc.json');
      if (existsSync(globalConfigPath)) {
        const globalConfig = JSON.parse(readFileSync(globalConfigPath, 'utf-8'));
        if (globalConfig.useEmoji !== undefined) {
          return globalConfig.useEmoji;
        }
      }
    } catch {
      // 忽略全局配置错误
    }
    
    // 默认启用 emoji
    return true;
  } catch {
    return true;
  }
}

/**
 * 主函数
 */
function main() {
  // 获取 commit message 文件路径
  const commitMsgFile = process.argv[2];
  
  if (!commitMsgFile) {
    console.error('Error: No commit message file provided');
    process.exit(1);
  }
  
  try {
    // 检查是否启用 emoji
    if (!isEmojiEnabled()) {
      // 如果禁用了 emoji，直接退出
      process.exit(0);
    }
    
    // 读取 commit message
    const originalMessage = readFileSync(commitMsgFile, 'utf-8').trim();
    
    // 跳过空消息或合并消息
    if (!originalMessage || originalMessage.startsWith('Merge ')) {
      process.exit(0);
    }
    
    // 格式化消息
    const result = formatCommitMessage(originalMessage);
    
    // 如果需要更新
    if (result.needsUpdate) {
      // 写入格式化后的消息
      writeFileSync(commitMsgFile, result.formattedMessage + '\n');
      
      // 输出提示信息
      console.log(`\n🎨 Commit message formatted:`);
      console.log(`   ${result.reason}`);
      console.log(`   Before: ${result.originalMessage}`);
      console.log(`   After:  ${result.formattedMessage}\n`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error formatting commit message:', error.message);
    process.exit(0); // 不阻止提交，只是跳过格式化
  }
}

// 运行主函数
main();