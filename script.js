// Инициализация редактора
const easyMDE = new EasyMDE({
    element: document.getElementById('content'),
    spellChecker: false,
    placeholder: '## 1. Планирование\n\nСначала продумай всё...\n\n> 💡 Совет: Не забудь заложить бюджет\n\n## 2. Материалы\n\n- Древесина\n- Ткань\n- Поролон\n\n## 3. Инструкция\n\n1. Разобрать диван\n2. Заменить поролон\n3. Обшить новой тканью\n\n## 4. Пример таблицы\n\n| Товар | Цена |\n|-------|------|\n| Молоко | 80 ₽ |\n| Хлеб | 55 ₽ |',
    toolbar: [
        'bold', 'italic', 'heading', '|',
        'unordered-list', 'ordered-list', '|',
        'quote', 'link', 'image', '|',
        'preview', 'side-by-side', 'fullscreen'
    ],
    status: false,
    renderingConfig: {
        codeSyntaxHighlighting: false,
    },
    parsingConfig: {
        strikethrough: true,
    }
});

// Транслитерация
function transliterate(word) {
    if (!word) return 'statya';
    const map = {
        'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'e','ж':'zh','з':'z','и':'i',
        'й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t',
        'у':'u','ф':'f','х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'',
        'э':'e','ю':'yu','я':'ya','А':'A','Б':'B','В':'V','Г':'G','Д':'D','Е':'E','Ё':'E',
        'Ж':'Zh','З':'Z','И':'I','Й':'Y','К':'K','Л':'L','М':'M','Н':'N','О':'O','П':'P',
        'Р':'R','С':'S','Т':'T','У':'U','Ф':'F','Х':'H','Ц':'Ts','Ч':'Ch','Ш':'Sh','Щ':'Sch',
        'Ъ':'','Ы':'Y','Ь':'','Э':'E','Ю':'Yu','Я':'Ya'
    };
    let result = '';
    for (let i = 0; i < word.length; i++) {
        result += map[word[i]] || word[i];
    }
    result = result.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    return result || 'statya';
}

// Генерация ключевых слов
function generateKeywords(title, category) {
    const words = title.split(' ');
    const keywords = [...words, category, 'ремонт', 'своими руками', 'дом', 'уют'];
    const unique = [];
    for (let i = 0; i < keywords.length; i++) {
        if (unique.indexOf(keywords[i]) === -1 && keywords[i].length > 2) {
            unique.push(keywords[i]);
        }
    }
    return unique.slice(0, 8).join(', ');
}

// Экранирование HTML
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Экранирование для JSON
function escapeJson(str) {
    if (!str) return '';
    return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

// Кнопка скачивания
document.getElementById('downloadBtn').addEventListener('click', function() {
    const title = document.getElementById('title').value.trim();
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value.trim();
    const image = document.getElementById('image').value.trim();
    const content = easyMDE.value();
    
    if (!title) { alert('❌ Введите заголовок!'); return; }
    if (!content) { alert('❌ Напишите текст!'); return; }
    
    // Московское время
    const now = new Date();
    const mskTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));
    const dateTime = mskTime.toISOString().replace(/\.\d{3}Z$/, '+03:00');
    
    const year = mskTime.getFullYear();
    const month = String(mskTime.getMonth() + 1).padStart(2, '0');
    const day = String(mskTime.getDate()).padStart(2, '0');
    const hours = String(mskTime.getHours()).padStart(2, '0');
    const minutes = String(mskTime.getMinutes()).padStart(2, '0');
    const displayDateTime = day + '.' + month + '.' + year + ' ' + hours + ':' + minutes;
    
    const slug = transliterate(title);
    const keywords = generateKeywords(title, category);
    const siteUrl = 'https://уголдома.рф';
    const articleUrl = siteUrl + '/posts/' + slug + '/';
    const imageUrl = image ? siteUrl + '/images/' + image : '';
    const readingTime = Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
    
    // ========== СБОРКА ФАЙЛА (ИСПРАВЛЕНО) ==========
    let fileContent = '';
    
    // Frontmatter
    fileContent += '---\n';
    fileContent += 'title: "' + escapeJson(title) + '"\n';
    fileContent += 'date: "' + dateTime + '"\n';
    fileContent += 'category: "' + category + '"\n';
    fileContent += 'description: "' + escapeJson(description) + '"\n';
    fileContent += 'image: "/images/' + image + '"\n';
    fileContent += 'layout: layout.njk\n';
    fileContent += 'keywords: "' + keywords + '"\n';
    fileContent += 'author: "Угол Дома"\n';
    fileContent += 'robots: "index, follow"\n';
    fileContent += 'readingTime: "' + readingTime + '"\n';
    fileContent += '---\n\n';
    
    // ===== ВАЖНО: ТОЛЬКО ЧИСТЫЙ MARKDOWN КОНТЕНТ, БЕЗ HTML-ОБЁРТКИ! =====
    fileContent += content + '\n';
    
    // Скачивание
    const blob = new Blob([fileContent], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = slug + '.md';
    link.click();
    URL.revokeObjectURL(link.href);
    
    alert('✅ Статья "' + title + '" сохранена!\n📁 Файл: ' + slug + '.md');
});