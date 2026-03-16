// 数据库配置 (Configuração do banco de dados)
const DB_NAME = 'FocoMatinalDB';
const DB_VERSION = 1;
const STORE_PROFILE = 'user_profile';

// 1. 初始化并打开数据库 (Inicializar e abrir o banco de dados)
export function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        // 如果是第一次运行，或者版本号升级，就会触发 onupgradeneeded
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            // 创建一个名为 user_profile 的对象仓库 (存储空间)
            if (!db.objectStoreNames.contains(STORE_PROFILE)) {
                // 以 'id' 作为主键 (Chave primária)
                db.createObjectStore(STORE_PROFILE, { keyPath: 'id' });
                console.log('[DB] Armazém de dados criado. (数据仓库已创建)');
            }
        };

        request.onsuccess = (event) => {
            console.log('[DB] Banco de dados pronto! (数据库准备就绪!)');
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            console.error('[DB] Erro ao abrir o banco de dados:', event.target.error);
            reject(event.target.error);
        };
    });
}

// 2. 核心算法：读取或初始化用户的康复数据 (Ler ou inicializar os dados)
export async function getUserProfile() {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_PROFILE], 'readonly');
        const store = transaction.objectStore(STORE_PROFILE);
        const request = store.get('me'); // 'me' 是代表当前用户的唯一 ID

        request.onsuccess = () => {
            if (request.result) {
                // 如果数据库里有数据，直接返回
                resolve(request.result);
            } else {
                // 如果是新用户，初始化他的数据：满分100分，今天开始算
                const initialData = {
                    id: 'me',
                    vitalityScore: 100, // 初始生命力指数
                    startDateTimestamp: Date.now() // 按下开始按钮的精确毫秒时间戳
                };
                saveUserProfile(initialData).then(() => resolve(initialData));
            }
        };
        request.onerror = (err) => reject(err);
    });
}

// 3. 保存数据到数据库 (Salvar dados no banco de dados)
export async function saveUserProfile(data) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        // 开启一个读写事务 (Transação de leitura e escrita)
        const transaction = db.transaction([STORE_PROFILE], 'readwrite');
        const store = transaction.objectStore(STORE_PROFILE);
        
        // put 方法：有则更新，无则创建
        const request = store.put(data);
        
        request.onsuccess = () => resolve();
        request.onerror = (err) => reject(err);
    });
}

// 4. 动态计算真实坚持天数 (Calcular dias contínuos dinamicamente)
// 坚决抛弃 day++ 这种会导致断网漏签的错误逻辑！
export function calculateContinuousDays(startDateTimestamp) {
    const now = Date.now();
    const diffTime = Math.abs(now - startDateTimestamp);
    // 将毫秒差值转换为天数 (Converter milissegundos em dias)
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}
