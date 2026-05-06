// 国际化核心控制脚本
let translations = {};

// 初始化加载
async function initI18n() {
    try {
        const response = await fetch('locales.json');
        translations = await response.json();
        
        // 获取本地存储或浏览器默认语言
        const savedLang = localStorage.getItem('lang') || 'zh';
        setLang(savedLang);
    } catch (error) {
        console.error('Failed to load locales:', error);
    }
}

// 切换语言
function setLang(lang) {
    localStorage.setItem('lang', lang);
    
    if(translations[lang]) {
        // 替换所有带有 data-i18n 属性的文本
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) {
                if (el.tagName === 'INPUT' && (el.type === 'button' || el.type === 'submit')) {
                    el.value = translations[lang][key];
                } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = translations[lang][key];
                } else {
                    // 支持HTML内容的替换，如果文案里有 <br> 等标签
                    el.innerHTML = translations[lang][key];
                }
            }
        });
    }

    // 更新按钮高亮状态
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(`'${lang}'`)) {
            btn.classList.add('active');
        }
    });
    
    // 设置文档语言
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initI18n);