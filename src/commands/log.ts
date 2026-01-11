/**
 * @zjex/git-workflow - Log 命令
 * 
 * 提供GitHub风格的时间线日志查看功能
 */

import { execSync } from "child_process";
import boxen from "boxen";
import { colors } from "../utils.js";
import { spawn } from "child_process";
import { createWriteStream } from "fs";
import { tmpdir } from "os";
import { join } from "path";

/**
 * 日志显示选项
 */
interface LogOptions {
  author?: string;
  since?: string;
  until?: string;
  grep?: string;
  limit?: number;
  all?: boolean;
  interactive?: boolean;
}

/**
 * 提交信息接口
 */
interface CommitInfo {
  hash: string;
  shortHash: string;
  subject: string;
  author: string;
  date: string;
  relativeDate: string;
  refs: string;
}

/**
 * 解析Git log输出为结构化数据
 */
function parseGitLog(output: string): CommitInfo[] {
  const commits: CommitInfo[] = [];
  const lines = output.trim().split('\n');
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    // 使用分隔符解析
    const parts = line.split('|');
    if (parts.length >= 6) {
      commits.push({
        hash: parts[0],
        shortHash: parts[1],
        subject: parts[2],
        author: parts[3],
        date: parts[4],
        relativeDate: parts[5],
        refs: parts[6] || ''
      });
    }
  }
  
  return commits;
}

/**
 * 获取提交类型图标
 */
function getCommitTypeIcon(subject: string): string {
  const lowerSubject = subject.toLowerCase();
  
  if (lowerSubject.includes('feat') || lowerSubject.includes('feature')) return '✨';
  if (lowerSubject.includes('fix') || lowerSubject.includes('bug')) return '🐛';
  if (lowerSubject.includes('docs') || lowerSubject.includes('doc')) return '📚';
  if (lowerSubject.includes('style')) return '💄';
  if (lowerSubject.includes('refactor')) return '♻️';
  if (lowerSubject.includes('test')) return '🧪';
  if (lowerSubject.includes('chore')) return '🔧';
  if (lowerSubject.includes('perf')) return '⚡';
  if (lowerSubject.includes('ci')) return '👷';
  if (lowerSubject.includes('build')) return '📦';
  if (lowerSubject.includes('revert')) return '⏪';
  if (lowerSubject.includes('merge')) return '🔀';
  if (lowerSubject.includes('release') || lowerSubject.includes('version')) return '🔖';
  
  return '📝';
}

/**
 * 按日期分组提交
 */
function groupCommitsByDate(commits: CommitInfo[]): Map<string, CommitInfo[]> {
  const groups = new Map<string, CommitInfo[]>();
  
  for (const commit of commits) {
    const date = commit.date;
    if (!groups.has(date)) {
      groups.set(date, []);
    }
    groups.get(date)!.push(commit);
  }
  
  return groups;
}

/**
 * 格式化相对时间为中文
 */
function formatRelativeTime(relativeDate: string): string {
  let result = relativeDate;
  
  // 先替换英文单词为中文
  const timeMap: { [key: string]: string } = {
    'second': '秒',
    'seconds': '秒',
    'minute': '分钟',
    'minutes': '分钟',
    'hour': '小时',
    'hours': '小时',
    'day': '天',
    'days': '天',
    'week': '周',
    'weeks': '周',
    'month': '个月',
    'months': '个月',
    'year': '年',
    'years': '年',
    'ago': '前'
  };
  
  for (const [en, zh] of Object.entries(timeMap)) {
    result = result.replace(new RegExp(`\\b${en}\\b`, 'g'), zh);
  }
  
  // 去掉数字和单位之间的空格，以及单位和"前"之间的空格
  // 例如："22 分钟 前" -> "22分钟前"
  result = result.replace(/(\d+)\s+(秒|分钟|小时|天|周|个月|年)\s+前/g, '$1$2前');
  
  // 简化显示格式
  const match = result.match(/(\d+)(分钟|小时|天|周|个月|年)前/);
  if (match) {
    const num = parseInt(match[1]);
    const unit = match[2];
    
    // 超过60分钟显示小时
    if (unit === '分钟' && num >= 60) {
      const hours = Math.floor(num / 60);
      return `${hours}小时前`;
    }
    
    // 超过24小时显示天数
    if (unit === '小时' && num >= 24) {
      const days = Math.floor(num / 24);
      return `${days}天前`;
    }
    
    // 超过7天显示周数
    if (unit === '天' && num >= 7 && num < 30) {
      const weeks = Math.floor(num / 7);
      return `${weeks}周前`;
    }
    
    // 超过30天显示月数
    if (unit === '天' && num >= 30) {
      const months = Math.floor(num / 30);
      return `${months}个月前`;
    }
    
    // 超过4周显示月数
    if (unit === '周' && num >= 4) {
      const months = Math.floor(num / 4);
      return `${months}个月前`;
    }
    
    // 超过12个月显示年数
    if (unit === '个月' && num >= 12) {
      const years = Math.floor(num / 12);
      return `${years}年前`;
    }
  }
  
  return result;
}

/**
 * 解析提交主题，分离标题和子任务
 */
function parseCommitSubject(subject: string): { title: string; tasks: string[] } {
  // 检查是否包含 " - " 分隔的子任务
  if (subject.includes(' - ')) {
    const parts = subject.split(' - ');
    const title = parts[0].trim();
    const tasks = parts.slice(1).map(task => task.trim()).filter(task => task.length > 0);
    return { title, tasks };
  }
  
  return { title: subject, tasks: [] };
}

/**
 * 检查是否支持颜色输出
 */
function supportsColor(): boolean {
  // 在交互式模式下强制启用颜色
  return true;
}

/**
 * 格式化GitHub风格的时间线显示
 */
function formatTimelineStyle(commits: CommitInfo[]): string {
  const groupedCommits = groupCommitsByDate(commits);
  let output = '';
  
  // 按日期倒序排列
  const sortedDates = Array.from(groupedCommits.keys()).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );
  
  const useColors = supportsColor() || process.env.FORCE_COLOR;
  
  for (let dateIndex = 0; dateIndex < sortedDates.length; dateIndex++) {
    const date = sortedDates[dateIndex];
    const dateCommits = groupedCommits.get(date)!;
    
    // 日期标题 - 使用黄色突出显示
    const dateTitle = `📅 Commits on ${date}`;
    if (useColors) {
      output += '\n' + colors.bold(colors.yellow(dateTitle)) + '\n\n';
    } else {
      output += '\n' + dateTitle + '\n\n';
    }
    
    // 该日期下的提交
    for (let commitIndex = 0; commitIndex < dateCommits.length; commitIndex++) {
      const commit = dateCommits[commitIndex];
      const icon = getCommitTypeIcon(commit.subject);
      const { title, tasks } = parseCommitSubject(commit.subject);
      
      // 构建提交内容
      const commitContent = [];
      
      // 主标题 - 使用白色加粗
      if (useColors) {
        commitContent.push(`${icon} ${colors.bold(colors.white(title))}`);
      } else {
        commitContent.push(`${icon} ${title}`);
      }
      
      // 如果有子任务，添加子任务列表
      if (tasks.length > 0) {
        commitContent.push(''); // 空行分隔
        tasks.forEach(task => {
          if (useColors) {
            commitContent.push(`  ${colors.dim('–')} ${colors.dim(task)}`);
          } else {
            commitContent.push(`  – ${task}`);
          }
        });
      }
      
      // 空行分隔
      commitContent.push('');
      
      // 作者和时间信息
      if (useColors) {
        commitContent.push(`${colors.dim('👤')} ${colors.blue(commit.author)} ${colors.dim('committed')} ${colors.green(formatRelativeTime(commit.relativeDate))}`);
        // Hash信息 - 使用橙色
        commitContent.push(`${colors.dim('🔗')} ${colors.orange('#' + commit.shortHash)}`);
        // 如果有分支/标签信息 - 区分显示
        if (commit.refs && commit.refs.trim()) {
          const refs = commit.refs.trim();
          // 解析并分别显示分支和标签
          const refParts = refs.split(', ');
          const branches: string[] = [];
          const tags: string[] = [];
          
          refParts.forEach(ref => {
            if (ref.startsWith('tag: ')) {
              tags.push(ref.replace('tag: ', ''));
            } else if (ref.includes('/') || ref === 'HEAD') {
              branches.push(ref);
            } else {
              branches.push(ref);
            }
          });
          
          // 显示分支信息
          if (branches.length > 0) {
            commitContent.push(`${colors.dim('🌿')} ${colors.lightPurple(branches.join(', '))}`);
          }
          
          // 显示标签信息
          if (tags.length > 0) {
            const tagText = tags.map(tag => `tag ${tag}`).join(', ');
            commitContent.push(`${colors.dim('🔖')} ${colors.yellow(tagText)}`);
          }
        }
      } else {
        commitContent.push(`👤 ${commit.author} committed ${formatRelativeTime(commit.relativeDate)}`);
        commitContent.push(`🔗 #${commit.shortHash}`);
        if (commit.refs && commit.refs.trim()) {
          const refs = commit.refs.trim();
          // 解析并分别显示分支和标签
          const refParts = refs.split(', ');
          const branches: string[] = [];
          const tags: string[] = [];
          
          refParts.forEach(ref => {
            if (ref.startsWith('tag: ')) {
              tags.push(ref.replace('tag: ', ''));
            } else if (ref.includes('/') || ref === 'HEAD') {
              branches.push(ref);
            } else {
              branches.push(ref);
            }
          });
          
          // 显示分支信息
          if (branches.length > 0) {
            commitContent.push(`🌿 ${branches.join(', ')}`);
          }
          
          // 显示标签信息
          if (tags.length > 0) {
            const tagText = tags.map(tag => `tag ${tag}`).join(', ');
            commitContent.push(`🔖 ${tagText}`);
          }
        }
      }
      
      // 使用boxen
      const commitBox = boxen(commitContent.join('\n'), {
        padding: { top: 0, bottom: 0, left: 1, right: 1 },
        margin: { top: 0, bottom: 1, left: 0, right: 0 },
        borderStyle: 'round',
        borderColor: 'gray'
      });
      
      output += commitBox + '\n';
    }
  }
  
  return output;
}

/**
 * 启动交互式分页查看器
 */
function startInteractivePager(content: string): void {
  // 使用系统的 less 命令作为分页器，启用颜色支持
  const pager = process.env.PAGER || 'less';
  
  try {
    // -R: 支持ANSI颜色代码
    // -S: 不换行长行
    // -F: 如果内容少于一屏则直接退出
    // -X: 不清屏
    // -i: 忽略大小写搜索
    const pagerProcess = spawn(pager, ['-R', '-S', '-F', '-X', '-i'], {
      stdio: ['pipe', 'inherit', 'inherit'],
      env: { ...process.env, LESS: '-R -S -F -X -i' }
    });
    
    // 将内容写入分页器
    pagerProcess.stdin.write(content);
    pagerProcess.stdin.end();
    
    // 处理分页器退出
    pagerProcess.on('exit', () => {
      // 分页器退出后不需要额外处理
    });
    
    // 处理错误
    pagerProcess.on('error', (err) => {
      // 如果分页器启动失败，直接输出内容
      console.log(content);
    });
    
  } catch (error) {
    // 如果出错，直接输出内容
    console.log(content);
  }
}

/**
 * 执行Git log并显示时间线风格结果
 */
function executeTimelineLog(options: LogOptions): void {
  try {
    // 构建Git命令
    let cmd = 'git log --pretty=format:"%H|%h|%s|%an|%ad|%ar|%D" --date=short';
    
    // 添加选项
    if (options.limit && !options.interactive) cmd += ` -${options.limit}`;
    if (options.author) cmd += ` --author="${options.author}"`;
    if (options.since) cmd += ` --since="${options.since}"`;
    if (options.until) cmd += ` --until="${options.until}"`;
    if (options.grep) cmd += ` --grep="${options.grep}"`;
    if (options.all) cmd += ` --all`;
    
    // 交互式模式默认显示更多提交
    if (options.interactive && !options.limit) {
      cmd += ` -50`; // 默认显示50个提交
    }

    const output = execSync(cmd, { 
      encoding: 'utf8',
      stdio: 'pipe',
      maxBuffer: 1024 * 1024 * 10
    });

    if (output.trim()) {
      const commits = parseGitLog(output);
      
      // 构建完整输出
      let fullOutput = '';
      
      // 显示标题
      const title = `📊 共显示 ${commits.length} 个提交`;
      fullOutput += '\n' + boxen(title, {
        padding: { top: 0, bottom: 0, left: 2, right: 2 },
        margin: { top: 0, bottom: 1, left: 0, right: 0 },
        borderStyle: 'double',
        borderColor: 'green',
        textAlignment: 'center'
      }) + '\n';
      
      // 显示时间线
      const timelineOutput = formatTimelineStyle(commits);
      fullOutput += timelineOutput;
      
      // 根据是否交互式模式选择输出方式
      if (options.interactive) {
        startInteractivePager(fullOutput);
      } else {
        console.log(fullOutput);
      }
      
    } else {
      const noCommitsMsg = '\n' + boxen('📭 没有找到匹配的提交记录', {
        padding: { top: 0, bottom: 0, left: 2, right: 2 },
        borderStyle: 'round',
        borderColor: 'yellow',
        textAlignment: 'center'
      });
      
      if (options.interactive) {
        startInteractivePager(noCommitsMsg);
      } else {
        console.log(noCommitsMsg);
      }
    }
  } catch (error: any) {
    let errorMessage = '❌ 执行失败';
    if (error.status === 128) {
      errorMessage = '❌ Git仓库错误或没有提交记录';
    } else {
      errorMessage = `❌ 执行失败: ${error.message}`;
    }
    
    const errorBox = '\n' + boxen(errorMessage, {
      padding: { top: 0, bottom: 0, left: 2, right: 2 },
      borderStyle: 'round',
      borderColor: 'red',
      textAlignment: 'center'
    });
    
    if (options.interactive) {
      startInteractivePager(errorBox);
    } else {
      console.log(errorBox);
    }
  }
}

/**
 * 主要的log命令函数
 */
export async function log(options: LogOptions = {}): Promise<void> {
  // 默认启用交互式模式
  if (options.interactive === undefined) {
    options.interactive = true;
  }
  
  // 交互式模式下不设置默认limit
  if (!options.interactive && !options.limit) {
    options.limit = 10;
  }
  
  executeTimelineLog(options);
}

/**
 * 快速日志查看
 */
export async function quickLog(limit: number = 10): Promise<void> {
  const options: LogOptions = { limit };
  executeTimelineLog(options);
}