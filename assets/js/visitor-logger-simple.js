/**
 * 访问日志记录脚本 - 简化版（适用于GitHub Pages）
 * 
 * 这个版本使用最简单的方法：
 * 1. 将日志保存到localStorage
 * 2. 定期通过GitHub API或第三方服务上传
 * 3. 或者使用GitHub Actions定期处理localStorage中的数据
 * 
 * 推荐方案：使用免费的第三方日志服务
 * - Logtail (https://logtail.com) - 免费层：每月500MB
 * - Loggly (https://www.loggly.com) - 免费层：200MB/天
 * - Better Stack (https://betterstack.com) - 有免费层
 */
(function() {
  'use strict';
  
  // ========== 配置区域 ==========
  
  // 方案1：使用Logtail（推荐，免费且简单）
  const LOGTAIL_SOURCE_TOKEN = ''; // 从 https://logtail.com 获取
  
  // 方案2：使用自定义API端点（需要自己搭建）
  const CUSTOM_API_URL = ''; // 例如：https://your-api.vercel.app/api/log
  
  // 方案3：使用GitHub Gist（需要token，不推荐在客户端使用）
  const USE_GITHUB_GIST = false;
  
  // ========== 配置结束 ==========
  
  // 获取当前页面信息
  function getPageInfo() {
    return {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      path: window.location.pathname,
      title: document.title || '',
      referrer: document.referrer || 'direct',
      userAgent: navigator.userAgent || '',
      language: navigator.language || '',
      screen: {
        width: window.screen.width,
        height: window.screen.height
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      sessionId: getSessionId()
    };
  }
  
  // 获取或创建会话ID
  function getSessionId() {
    let sessionId = sessionStorage.getItem('visit_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('visit_session_id', sessionId);
    }
    return sessionId;
  }
  
  // 记录访问日志
  async function logVisit() {
    const pageInfo = getPageInfo();
    
    // 优先尝试使用配置的服务
    if (LOGTAIL_SOURCE_TOKEN) {
      await logToLogtail(pageInfo);
    } else if (CUSTOM_API_URL) {
      await logToCustomAPI(pageInfo);
    } else {
      // 默认：保存到localStorage，等待后续处理
      logToLocalStorage(pageInfo);
    }
  }
  
  // 发送到Logtail
  async function logToLogtail(pageInfo) {
    try {
      await fetch('https://in.logtail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + LOGTAIL_SOURCE_TOKEN
        },
        body: JSON.stringify({
          dt: pageInfo.timestamp,
          level: 'info',
          message: 'Page visit',
          ...pageInfo
        })
      });
    } catch (error) {
      console.debug('Logtail日志记录失败:', error);
      logToLocalStorage(pageInfo); // 失败时保存到localStorage
    }
  }
  
  // 发送到自定义API
  async function logToCustomAPI(pageInfo) {
    try {
      await fetch(CUSTOM_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pageInfo)
      });
    } catch (error) {
      console.debug('自定义API日志记录失败:', error);
      logToLocalStorage(pageInfo);
    }
  }
  
  // 保存到localStorage（备用方案）
  function logToLocalStorage(pageInfo) {
    try {
      let logs = JSON.parse(localStorage.getItem('visit_logs') || '[]');
      logs.push(pageInfo);
      
      // 只保留最近1000条
      if (logs.length > 1000) {
        logs = logs.slice(-1000);
      }
      
      localStorage.setItem('visit_logs', JSON.stringify(logs));
      localStorage.setItem('visit_logs_updated', new Date().toISOString());
      
      // 如果日志数量超过100条，尝试批量上传（如果有配置服务）
      if (logs.length >= 100 && (LOGTAIL_SOURCE_TOKEN || CUSTOM_API_URL)) {
        uploadBatchedLogs(logs);
      }
    } catch (e) {
      console.debug('localStorage日志记录失败:', e);
    }
  }
  
  // 批量上传日志
  async function uploadBatchedLogs(logs) {
    // 这里可以实现批量上传逻辑
    // 上传成功后清空localStorage中的日志
  }
  
  // 页面加载完成后记录访问
  if (document.readyState === 'complete') {
    logVisit();
  } else {
    window.addEventListener('load', logVisit);
  }
})();

