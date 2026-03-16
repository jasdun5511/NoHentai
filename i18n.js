// 引入我们在第0阶段定义的字典 (Dicionário)
import { translations } from './i18n_config.js'; 

class I18nService {
  constructor() {
    // 检测浏览器语言 (Detectar o idioma do navegador)
    const navLang = navigator.language || navigator.userLanguage;
    
    // 如果是 pt-BR 就用葡语，否则退化为通用英语 en-US
    this.currentLang = navLang.includes('pt') ? 'pt-BR' : 'en-US';
    this.dictionary = translations[this.currentLang];
  }

  // 核心翻译方法 (Método de tradução)
  t(keyString) {
    const keys = keyString.split('.');
    let result = this.dictionary;
    
    // 解析类似 "ui_elements.panic_button" 的嵌套键值
    for (const key of keys) {
      if (result[key] === undefined) return keyString; // 找不到就返回原字符串
      result = result[key];
    }
    return result;
  }

  // 渲染整个页面的文本 (Renderizar o texto da página)
  renderDOM() {
    // 假设我们在 HTML 里这么写: <button data-i18n="ui_elements.panic_button"></button>
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.innerText = this.t(key);
    });
    
    console.log(`[i18n] Idioma carregado: ${this.currentLang} (语言已加载)`);
  }
}

// 导出一个单例 (Exportar um singleton)
export const i18n = new I18nService();
