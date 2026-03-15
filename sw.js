// 缓存版本号 (Versão do cache) - 每次更新UI或逻辑时，必须更改此版本号
const CACHE_NAME = 'foco-matinal-v1';

// 需要在应用首次加载时强制“预缓存 (Pré-cache)”的核心资源数组
const ASSETS_TO_CACHE = [
  '/', // 根路径
  '/index.html', // 应用骨架 (Esqueleto do aplicativo)
  '/manifest.json', // 隐蔽化清单
  '/css/style.css', // 临床安抚色彩与呼吸动画样式
  '/js/app.js', // 核心业务逻辑
  '/js/psychology_domain.js', // 心理学状态机模型
  '/icons/icon-192x192.png', // 必要的图标
  '/icons/icon-512x512.png'
  // 提示：未来如果你加入了急救的白噪音音频，也要放在这里，例如 '/assets/audio/breathe.mp3'
];

// 1. Instalação (安装阶段)
// 当浏览器首次检测到 sw.js 时触发。我们将在这里把核心文件塞进离线缓存。
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Fazendo pré-cache dos recursos base... (正在预缓存基础资源...)');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        // 强制当前处于 waiting 状态的 Service Worker 立即激活
        return self.skipWaiting(); 
      })
  );
});

// 2. Ativação (激活阶段)
// 主要用于清理旧版本的缓存 (Limpar caches antigos)，防止占用用户手机存储空间。
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removendo cache antigo: (移除旧缓存:)', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // 立即接管所有页面控制权
  return self.clients.claim();
});

// 3. Interceptação de Rede (网络拦截阶段) - 核心急救逻辑！
// 任何从页面发出的请求都会经过这里。
self.addEventListener('fetch', (event) => {
  // 策略：缓存优先，回退到网络 (Cache First, falling back to Network)
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // 如果在缓存里找到了 (例如急救按钮的 CSS 动画)，立刻返回离线版本，不等待网络！
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // 如果缓存里没有，才去尝试走网络请求
        return fetch(event.request).catch(() => {
          // 如果连网络也断了，且请求的是页面，可以返回一个离线的 fallback 页面
          // if (event.request.mode === 'navigate') {
          //   return caches.match('/offline.html');
          // }
        });
      })
  );
});
