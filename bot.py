import asyncio
import logging
from datetime import datetime
from typing import Optional
import aiohttp
from bs4 import BeautifulSoup
from telegram import Update
from telegram.ext import Application, MessageHandler, CommandHandler, filters, ContextTypes
from supabase import create_client, Client
import re

# ============ НАСТРОЙКИ ============
TELEGRAM_TOKEN = "8540569762:AAFnvJS9v7P6mlfhK1sfGSpQ_nIsY2bbM6s"
SUPABASE_URL = "https://dqpqhvaikapnnmablvxh.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxcHFodmFpa2Fwbm5tYWJsdnhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTQ5MzE3MywiZXhwIjoyMDg1MDY5MTczfQ.bNsJE5orouvDoCHa4q9p0FwbaMDgsLuhXSIGmN9h7Qc"
CHANNEL_ID = "@iqsafety_news"

# Логирование
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Supabase клиент
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ============ КЛЮЧЕВЫЕ СЛОВА ДЛЯ ФИЛЬТРАЦИИ ============
KEYWORDS = [
    # Видеонаблюдение
    r'видеонаблюден', r'камер', r'cctv', r'ip-камер', r'видеорегистратор',
    r'nvr', r'dvr', r'видеоаналитик',
    
    # СКУД
    r'скуд', r'контроль доступ', r'турникет', r'шлагбаум', r'домофон',
    r'видеодомофон', r'считыватель', r'карт-ридер', r'электрозамок',
    
    # Пожарная безопасность
    r'пожарн', r'огнетушител', r'датчик дым', r'пожаротушен',
    r'спринклер', r'опс', r'аупт', r'пожарная сигнализац',
    
    # Охранная сигнализация
    r'сигнализац', r'охран', r'датчик движен', r'датчик разбит',
    r'периметр', r'ограждение', r'тревожн',
    
    # Биометрия
    r'биометр', r'распознавание лиц', r'отпечаток', r'сканер лиц',
    r'face recognition', r'идентификац', r'аутентификац',
    
    # Бренды мировые
    r'hikvision', r'dahua', r'axis', r'bosch', r'siemens', r'hanwha',
    r'honeywell', r'hochiki', r'schneider electric', r'panasonic',
    
    # Бренды российские/СНГ
    r'болид', r'рубеж', r'perco', r'parsec', r'орион', r'itv', r'сигма',
    r'smartec', r'beward', r'dssl', r'fort', r'tantos',
    
    # Общие термины
    r'безопасност', r'охрана', r'security', r'система безопасност',
    r'комплекс безопасност', r'интеграция систем',
    
    # Умные технологии
    r'умный дом', r'smart home', r'iot', r'интернет вещей',
    r'автоматизация', r'интеллектуальн',
    
    # Сети
    r'ip-систем', r'сетев', r'ethernet', r'poe', r'wi-fi камер',
    r'облачн', r'cloud'
]

def check_keywords(text: str) -> bool:
    """Проверяет наличие ключевых слов в тексте"""
    if not text:
        return False
    
    text_lower = text.lower()
    
    for keyword in KEYWORDS:
        if re.search(keyword, text_lower):
            return True
    
    return False


# ============ СОХРАНЕНИЕ В БАЗУ ============
async def save_news(source: str, title: str, content: str, image_url: str = None, post_url: str = None):
    """Сохраняет новость в Supabase с проверкой ключевых слов"""
    
    # Проверяем ключевые слова
    combined_text = f"{title} {content}"
    if not check_keywords(combined_text):
        logger.info(f"⏭️  Пропущено (нет ключевых слов): {title[:50]}...")
        return None
    
    # КРИТИЧЕСКАЯ ПРОВЕРКА: НЕ сохраняем placeholder-ы!
    if image_url:
        placeholder_patterns = [
            'R0lGODlhAQABAIABAP',          # 1x1 прозрачный GIF
            'R0lGODlhAQABAIAAAA',          # 1x1 любой цвет GIF  
            'PHN2ZyB4bWxu',                 # SVG placeholder
            'PHN2ZyB4bWxuc',                # SVG вариации
            'data:image/svg+xml;base64,PHN2', # SVG base64
            'data:image/gif;base64,R0lGOD', # Маленькие GIF
            'placeholder',
            'blank.gif',
            'blank.png',
            'loading.gif',
            '1x1.gif',
            '1x1.png',
        ]
        
        # Если это placeholder - сохраняем NULL вместо него
        for pattern in placeholder_patterns:
            if pattern in image_url:
                logger.info(f"⚠️  Обнаружен placeholder, сохраняем NULL")
                image_url = None
                break
    
    try:
        data = {
            "source": source,
            "title": title,
            "content": content,
            "image_url": image_url,
            "post_url": post_url,
            "deleted": False
        }
        result = supabase.table("news").insert(data).execute()
        logger.info(f"✅ Сохранено: {title[:50]}...")
        if image_url:
            logger.info(f"📸 С картинкой: {image_url[:60]}...")
        return result
    except Exception as e:
        logger.error(f"❌ Ошибка сохранения: {e}")
        return None


# ============ КОМАНДЫ БОТА ============
async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Команда /start"""
    await update.message.reply_text(
        "🤖 Бот новостей IQ Safety запущен!\n\n"
        "📋 Доступные команды:\n"
        "/parse - Запустить парсинг новостей вручную\n"
        "/list - Показать последние новости с ID\n"
        "/delete <ID> - Удалить новость по ID\n"
        "/stats - Статистика новостей\n"
        "/sources - Список источников"
    )


async def parse_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Команда /parse - запуск парсинга вручную"""
    await update.message.reply_text("🔄 Запускаю парсинг новостей...")
    
    try:
        await parse_all_sites()
        await update.message.reply_text("✅ Парсинг завершён! Проверьте базу данных.")
    except Exception as e:
        await update.message.reply_text(f"❌ Ошибка парсинга: {e}")
        logger.error(f"Ошибка в parse_command: {e}")


async def list_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Команда /list - показать последние новости"""
    try:
        response = supabase.table('news').select('id, title, source, deleted').order('created_at', desc=True).limit(15).execute()
        
        if not response.data:
            await update.message.reply_text("📭 Новостей пока нет")
            return
        
        message = "📰 Последние новости:\n\n"
        for news in response.data:
            deleted_mark = " ❌" if news.get('deleted') else ""
            source = news.get('source', 'N/A')
            title = news.get('title', 'Без названия')[:60]
            message += f"ID: {news['id']} | {source}\n{title}...{deleted_mark}\n\n"
        
        await update.message.reply_text(message)
    except Exception as e:
        await update.message.reply_text(f"❌ Ошибка: {e}")
        logger.error(f"Ошибка в list_command: {e}")


async def delete_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Команда /delete <ID> - пометить новость как удалённую"""
    if not context.args:
        await update.message.reply_text("❌ Используйте: /delete <ID новости>\n\nПример: /delete 5")
        return
    
    try:
        news_id = int(context.args[0])
        
        response = supabase.table('news').update({
            'deleted': True
        }).eq('id', news_id).execute()
        
        if response.data:
            await update.message.reply_text(f"✅ Новость #{news_id} удалена из виджета")
        else:
            await update.message.reply_text(f"❌ Новость #{news_id} не найдена")
    except ValueError:
        await update.message.reply_text("❌ ID должен быть числом!")
    except Exception as e:
        await update.message.reply_text(f"❌ Ошибка: {e}")
        logger.error(f"Ошибка в delete_command: {e}")


async def stats_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Команда /stats - статистика новостей"""
    try:
        all_news = supabase.table('news').select('id, source, deleted').execute()
        
        total = len(all_news.data)
        deleted = len([n for n in all_news.data if n.get('deleted')])
        active = total - deleted
        
        sources = {}
        for news in all_news.data:
            if not news.get('deleted'):
                source = news.get('source', 'Unknown')
                sources[source] = sources.get(source, 0) + 1
        
        message = f"📊 Статистика новостей:\n\n"
        message += f"📰 Всего новостей: {total}\n"
        message += f"✅ Активных: {active}\n"
        message += f"❌ Удалённых: {deleted}\n\n"
        message += "📍 Активные по источникам:\n"
        for source, count in sorted(sources.items(), key=lambda x: x[1], reverse=True):
            message += f"  • {source}: {count}\n"
        
        await update.message.reply_text(message)
    except Exception as e:
        await update.message.reply_text(f"❌ Ошибка: {e}")
        logger.error(f"Ошибка в stats_command: {e}")


async def sources_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Команда /sources - список источников"""
    message = """🌐 Источники новостей:

🌍 Зарубежные:
• Hikvision
• Dahua
• Axis
• Bosch
• Siemens
• Hochiki
• Hanwha Vision
• Cloudflare

🇷🇺 Российские:
• Болид
• Рубеж
• Perco
• DSSL
• RGSec
• SKUD-System

🇰🇿 Казахстанские:
• Orion M2M
• Intant
• Inform.kz

📋 Всего: 21 источник
🔄 Обновление: каждые 2 часа
🔍 Фильтрация: ~90 ключевых слов"""
    
    await update.message.reply_text(message)


# ============ TELEGRAM HANDLER ============
async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обрабатывает все входящие сообщения"""
    message = update.message or update.channel_post
    if not message:
        return
    
    text = message.text or message.caption or ""
    
    if text.startswith('/'):
        return
    
    image_url = None
    if message.photo:
        photo = message.photo[-1]
        file = await context.bot.get_file(photo.file_id)
        image_url = file.file_path
    
    post_url = None
    if update.channel_post:
        post_url = f"https://t.me/{CHANNEL_ID.replace('@', '')}/{message.message_id}"
    
    title = text.split('\n')[0][:100] if text else "Новость IQ Safety"
    
    # ДЛЯ КАНАЛА IQ SAFETY - БЕЗ ФИЛЬТРА!
    # Сохраняем всё что публикуется в канале
    if update.channel_post:
        try:
            data = {
                "source": "IQ Safety",
                "title": title,
                "content": text,
                "image_url": image_url,
                "post_url": post_url,
                "deleted": False
            }
            result = supabase.table("news").insert(data).execute()
            logger.info(f"✅ Сохранено из канала: {title[:50]}...")
        except Exception as e:
            logger.error(f"❌ Ошибка сохранения: {e}")
    else:
        # Для личных сообщений боту - с фильтром
        result = await save_news(
            source="IQ Safety",
            title=title,
            content=text,
            image_url=image_url,
            post_url=post_url
        )
        
        if update.message and result:
            try:
                if image_url:
                    await context.bot.send_photo(
                        chat_id=CHANNEL_ID,
                        photo=image_url,
                        caption=text
                    )
                else:
                    await context.bot.send_message(
                        chat_id=CHANNEL_ID,
                        text=text
                    )
                await update.message.reply_text("✅ Опубликовано в канале!")
            except Exception as e:
                logger.error(f"Ошибка публикации в канал: {e}")
                await update.message.reply_text(f"❌ Ошибка публикации: {e}")


# ============ УНИВЕРСАЛЬНЫЙ ПАРСЕР ИЗОБРАЖЕНИЙ ============
def extract_image(item, base_url: str) -> Optional[str]:
    """Универсальный парсер изображений со всеми условиями"""
    
    # Список всех возможных селекторов для картинок
    img_selectors = [
        'img',
        'picture img',
        'picture source',
        '.image img',
        '.thumbnail img',
        '.news-image img',
        '.post-image img',
        '.featured-image img',
        '[class*="image"] img',
        '[class*="photo"] img',
        '[class*="pic"] img',
    ]
    
    # Ищем по всем селекторам
    img_elements = []
    for selector in img_selectors:
        elements = item.select(selector)
        img_elements.extend(elements)
    
    if not img_elements:
        return None
    
    # Список всех возможных атрибутов где может быть URL картинки
    # ВАЖНО: порядок имеет значение! Сначала проверяем data-атрибуты (реальные картинки)
    img_attributes = [
        'data-original',      # Часто используется для lazy loading
        'data-src',           # Популярный для lazy loading
        'data-lazy-src',      # Lazy load
        'data-srcset',        # Responsive lazy loading
        'data-image',         # Кастомный атрибут
        'data-url',           # Кастомный атрибут
        'srcset',             # Responsive images
        'src',                # Стандартный (может быть placeholder!)
    ]
    
    best_image = None
    best_score = 0
    
    # Проверяем каждый найденный img элемент
    for img_el in img_elements:
        # Пробуем извлечь URL из атрибутов
        for attr in img_attributes:
            value = img_el.get(attr)
            if not value:
                continue
            
            # Если srcset - берём первую (обычно самую большую) картинку
            if 'srcset' in attr and ' ' in value:
                value = value.split(',')[0].split(' ')[0].strip()
            
            value = value.strip()
            
            if not value or len(value) < 10:
                continue
            
            # КРИТИЧЕСКАЯ ПРОВЕРКА: игнорируем известные placeholder-ы
            placeholder_signatures = [
                'R0lGODlhAQABAIABAP',          # 1x1 transparent GIF
                'R0lGODlhAQABAIAAAA',          # 1x1 любой цвет GIF
                'PHN2ZyB4bWxu',                 # SVG placeholder
                'data:image/gif;base64,R0lGOD', # Короткие GIF
                'data:image/svg+xml',           # SVG в base64
                '//:0',                         # Пустой протокол
                'placeholder',
                'blank',
                'loading',
                'spinner',
                'default',
                'noimage',
                'no-image',
            ]
            
            is_placeholder = False
            for sig in placeholder_signatures:
                if sig in value:
                    is_placeholder = True
                    break
            
            if is_placeholder:
                continue
            
            # Оцениваем качество найденного URL
            score = 0
            
            # Бонусы за data-атрибуты (обычно там реальные картинки)
            if attr.startswith('data-'):
                score += 10
            
            # Бонусы за длину URL (длинные обычно реальные)
            if len(value) > 50:
                score += 5
            
            # Бонусы за расширения изображений
            if any(ext in value.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                score += 3
            
            # Штрафы за подозрительные паттерны
            if any(bad in value.lower() for bad in ['icon', 'logo', 'avatar', 'thumb']):
                score -= 5
            
            # Если это лучший найденный вариант - сохраняем
            if score > best_score:
                best_score = score
                best_image = value
    
    if not best_image:
        return None
    
    # Конвертируем относительные пути в абсолютные
    if best_image.startswith('//'):
        best_image = f"https:{best_image}"
    elif best_image.startswith('/'):
        best_image = f"{base_url}{best_image}"
    elif not best_image.startswith('http') and not best_image.startswith('data:'):
        best_image = f"{base_url}/{best_image}"
    
    return best_image


# ============ УНИВЕРСАЛЬНЫЙ ПАРСЕР НОВОСТЕЙ ============
async def parse_generic_site(site_name: str, url: str, selectors: dict) -> int:
    """
    Универсальный парсер для любого сайта
    
    selectors = {
        'items': '.news-item, article',  # CSS селектор новостей
        'title': 'h2, h3, .title',       # CSS селектор заголовка
        'link': 'a[href]',               # CSS селектор ссылки
        'content': 'p, .description',    # CSS селектор контента
    }
    """
    logger.info(f"🌐 Парсинг {site_name}...")
    html = await fetch_html(url)
    if not html:
        return 0
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select(selectors.get('items', 'article'))[:5]
    
    count = 0
    for item in news_items:
        try:
            # Заголовок
            title_el = item.select_one(selectors.get('title', 'h2, h3'))
            title = title_el.get_text(strip=True) if title_el else None
            
            # Валидация заголовка
            if not title or len(title) < 15:
                continue
            
            # Пропускаем телефоны
            if title.startswith('+'):
                continue
            
            # Ссылка - сначала ищем в заголовке, потом везде
            link = None
            
            # 1. Ссылка в заголовке (приоритет!)
            if title_el and title_el.name == 'a':
                link = title_el.get('href')
            elif title_el:
                title_link = title_el.find_parent('a') or title_el.find('a')
                if title_link:
                    link = title_link.get('href')
            
            # 2. Если не нашли - ищем первую ссылку в элементе
            if not link:
                link_el = item.select_one(selectors.get('link', 'a[href]'))
                link = link_el.get('href') if link_el else None
            
            # Валидация ссылки
            if link:
                if link.startswith('tel:') or link.startswith('mailto:'):
                    link = None
                elif not link.startswith('http'):
                    base = url.rsplit('/', 1)[0] if '/' in url else url
                    link = f"{base}{link}" if link.startswith('/') else f"{base}/{link}"
            
            # Контент
            content_el = item.select_one(selectors.get('content', 'p, .description'))
            content = content_el.get_text(strip=True) if content_el else title
            
            # Изображение (универсальный парсер)
            base_url = '/'.join(url.split('/')[:3])  # https://example.com
            image = extract_image(item, base_url)
            
            # Проверка дубликатов
            if title and len(title) > 10:
                existing = supabase.table("news").select("id").eq("title", title).execute()
                if not existing.data:
                    result = await save_news(site_name, title, content or "", image, link)
                    if result:
                        count += 1
        except Exception as e:
            logger.error(f"Ошибка парсинга {site_name}: {e}")
    
    logger.info(f"📊 {site_name}: добавлено {count} новостей")
    return count


# ============ ПАРСИНГ САЙТОВ ============
async def fetch_html(url: str) -> Optional[str]:
    """Загружает HTML страницы"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=30, headers=headers) as response:
                if response.status == 200:
                    return await response.text()
    except Exception as e:
        logger.error(f"❌ Ошибка загрузки {url}: {e}")
    return None


# ============ ЗАРУБЕЖНЫЕ САЙТЫ ============

async def parse_hikvision():
    """Hikvision - специальный парсер"""
    logger.info("🌐 Парсинг Hikvision...")
    url = "https://www.hikvision.com/en/newsroom/latest-news/"
    html = await fetch_html(url)
    if not html:
        return 0
    
    soup = BeautifulSoup(html, 'html.parser')
    
    # Hikvision использует разные структуры - пробуем все варианты
    news_items = (
        soup.select('article') or 
        soup.select('.news-item') or 
        soup.select('.content-item') or
        soup.select('[class*="card"]') or
        soup.select('.latest-news-item')
    )[:5]
    
    count = 0
    for item in news_items:
        try:
            # Ищем заголовок
            title_el = (
                item.select_one('h2 a') or 
                item.select_one('h3 a') or 
                item.select_one('.title a') or
                item.select_one('a h2') or
                item.select_one('a h3') or
                item.select_one('h2') or
                item.select_one('h3')
            )
            
            if not title_el:
                continue
            
            title = title_el.get_text(strip=True)
            
            if not title or len(title) < 15:
                continue
            
            # Ищем ссылку - проверяем несколько вариантов
            link = None
            
            # Вариант 1: Ссылка в самом заголовке
            if title_el.name == 'a':
                link = title_el.get('href')
            
            # Вариант 2: Родитель заголовка - ссылка
            if not link and title_el.parent and title_el.parent.name == 'a':
                link = title_el.parent.get('href')
            
            # Вариант 3: Ссылка внутри заголовка
            if not link:
                inner_link = title_el.find('a')
                if inner_link:
                    link = inner_link.get('href')
            
            # Вариант 4: Первая ссылка в элементе новости
            if not link:
                first_link = item.select_one('a[href]')
                if first_link:
                    link = first_link.get('href')
            
            # Вариант 5: Ссылка в атрибуте data-url или data-link
            if not link:
                link = item.get('data-url') or item.get('data-link')
            
            # Делаем абсолютную ссылку
            if link:
                if link.startswith('/'):
                    link = f"https://www.hikvision.com{link}"
                elif not link.startswith('http'):
                    link = f"https://www.hikvision.com/en/newsroom/{link}"
            else:
                # Если ссылку не нашли - используем общую страницу новостей
                link = "https://www.hikvision.com/en/newsroom/latest-news/"
            
            # Контент
            content_el = (
                item.select_one('p') or 
                item.select_one('.description') or
                item.select_one('.excerpt')
            )
            content = content_el.get_text(strip=True) if content_el else title
            
            # Изображение
            image = extract_image(item, 'https://www.hikvision.com')
            
            # Сохраняем
            if title:
                existing = supabase.table("news").select("id").eq("title", title).execute()
                if not existing.data:
                    result = await save_news("Hikvision", title, content, image, link)
                    if result:
                        count += 1
        except Exception as e:
            logger.error(f"Ошибка парсинга Hikvision: {e}")
    
    logger.info(f"📊 Hikvision: добавлено {count} новостей")
    return count


async def parse_bolid():
    """Болид"""
    logger.info("🇷🇺 Парсинг Болид...")
    url = "https://bolid.ru/about/news/"
    html = await fetch_html(url)
    if not html:
        return 0
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('.news-item, article, .news-list-item')[:5]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://bolid.ru{link}"
            
            content_el = item.select_one('p, .description, .anons')
            content = content_el.get_text(strip=True) if content_el else title
            
            img_el = item.select_one('img')
            image = img_el.get('src') if img_el else None
            if image and not image.startswith('http'):
                image = f"https://bolid.ru{image}"
            
            if title and len(title) > 10:
                existing = supabase.table("news").select("id").eq("title", title).execute()
                if not existing.data:
                    result = await save_news("Болид", title, content or "", image, link)
                    if result:
                        count += 1
        except Exception as e:
            logger.error(f"Ошибка парсинга Болид: {e}")
    
    logger.info(f"📊 Болид: добавлено {count} новостей")
    return count


async def parse_perco():
    """Perco"""
    logger.info("🌐 Парсинг Perco...")
    url = "https://www.perco.ru/novosti/"
    html = await fetch_html(url)
    if not html:
        return 0
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('.news-item, article, .post')[:5]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://www.perco.ru{link}"
            
            content_el = item.select_one('p, .description')
            content = content_el.get_text(strip=True) if content_el else title
            
            img_el = item.select_one('img')
            image = img_el.get('src') if img_el else None
            
            if title and len(title) > 10:
                existing = supabase.table("news").select("id").eq("title", title).execute()
                if not existing.data:
                    result = await save_news("Perco", title, content or "", image, link)
                    if result:
                        count += 1
        except Exception as e:
            logger.error(f"Ошибка парсинга Perco: {e}")
    
    logger.info(f"📊 Perco: добавлено {count} новостей")
    return count


async def parse_dahua():
    """Dahua"""
    logger.info("🌐 Парсинг Dahua...")
    url = "https://www.dahuasecurity.com/ea/newsEvents"
    html = await fetch_html(url)
    if not html:
        return 0
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('.news-item, article, .news-list li')[:5]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://www.dahuasecurity.com{link}"
            
            content_el = item.select_one('p, .description')
            content = content_el.get_text(strip=True) if content_el else title
            
            img_el = item.select_one('img')
            image = img_el.get('src') if img_el else None
            
            if title and len(title) > 10:
                existing = supabase.table("news").select("id").eq("title", title).execute()
                if not existing.data:
                    result = await save_news("Dahua", title, content or "", image, link)
                    if result:
                        count += 1
        except Exception as e:
            logger.error(f"Ошибка парсинга Dahua: {e}")
    
    logger.info(f"📊 Dahua: добавлено {count} новостей")
    return count


async def parse_axis():
    """Axis Communications"""
    logger.info("🌐 Парсинг Axis...")
    url = "https://newsroom.axis.com/"
    html = await fetch_html(url)
    if not html:
        return 0
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('article, .news-item, .post')[:5]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://newsroom.axis.com{link}"
            
            content_el = item.select_one('p, .description')
            content = content_el.get_text(strip=True) if content_el else title
            
            # Ищем картинку в picture > source или img
            image = None
            picture_el = item.select_one('picture source[srcset]')
            if picture_el:
                srcset = picture_el.get('srcset', '')
                # Берём первый URL из srcset
                if srcset:
                    image = srcset.split(',')[0].split(' ')[0].strip()
                    if image and not image.startswith('http'):
                        image = f"https://newsroom.axis.com{image}"
            
            # Если не нашли в picture, ищем обычный img
            if not image:
                img_el = item.select_one('img')
                if img_el:
                    image = img_el.get('src') or img_el.get('data-src')
                    if image and not image.startswith('http'):
                        image = f"https://newsroom.axis.com{image}"
            
            if title and len(title) > 10:
                existing = supabase.table("news").select("id").eq("title", title).execute()
                if not existing.data:
                    result = await save_news("Axis", title, content or "", image, link)
                    if result:
                        count += 1
        except Exception as e:
            logger.error(f"Ошибка парсинга Axis: {e}")
    
    logger.info(f"📊 Axis: добавлено {count} новостей")
    return count


async def parse_bosch():
    """Bosch"""
    logger.info("🌐 Парсинг Bosch...")
    url = "https://www.boschbuildingtechnologies.com/lifesafetysystems/en/news-events/"
    html = await fetch_html(url)
    if not html:
        return 0
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('article, .news-item, .content-item')[:5]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://www.boschbuildingtechnologies.com{link}"
            
            content_el = item.select_one('p, .description')
            content = content_el.get_text(strip=True) if content_el else title
            
            img_el = item.select_one('img')
            image = img_el.get('src') if img_el else None
            
            if title and len(title) > 10:
                existing = supabase.table("news").select("id").eq("title", title).execute()
                if not existing.data:
                    result = await save_news("Bosch", title, content or "", image, link)
                    if result:
                        count += 1
        except Exception as e:
            logger.error(f"Ошибка парсинга Bosch: {e}")
    
    logger.info(f"📊 Bosch: добавлено {count} новостей")
    return count


async def parse_siemens():
    """Siemens"""
    logger.info("🌐 Парсинг Siemens...")
    url = "https://press.siemens.com/global/en"
    html = await fetch_html(url)
    if not html:
        return 0
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('article, .news-item, .press-release')[:5]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://press.siemens.com{link}"
            
            content_el = item.select_one('p, .description, .excerpt')
            content = content_el.get_text(strip=True) if content_el else title
            
            img_el = item.select_one('img')
            image = img_el.get('src') if img_el else None
            
            if title and len(title) > 10:
                existing = supabase.table("news").select("id").eq("title", title).execute()
                if not existing.data:
                    result = await save_news("Siemens", title, content or "", image, link)
                    if result:
                        count += 1
        except Exception as e:
            logger.error(f"Ошибка парсинга Siemens: {e}")
    
    logger.info(f"📊 Siemens: добавлено {count} новостей")
    return count


async def parse_hochiki():
    """Hochiki"""
    logger.info("🌐 Парсинг Hochiki...")
    url = "https://www.hochikieurope.com/news"
    html = await fetch_html(url)
    if not html:
        return 0
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('article, .news-item, .post')[:5]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://www.hochikieurope.com{link}"
            
            content_el = item.select_one('p, .description')
            content = content_el.get_text(strip=True) if content_el else title
            
            img_el = item.select_one('img')
            image = img_el.get('src') if img_el else None
            
            if title and len(title) > 10:
                existing = supabase.table("news").select("id").eq("title", title).execute()
                if not existing.data:
                    result = await save_news("Hochiki", title, content or "", image, link)
                    if result:
                        count += 1
        except Exception as e:
            logger.error(f"Ошибка парсинга Hochiki: {e}")
    
    logger.info(f"📊 Hochiki: добавлено {count} новостей")
    return count


async def parse_rubezh():
    """Рубеж"""
    logger.info("🇷🇺 Парсинг Рубеж...")
    url = "https://rubezh.ru/news"
    html = await fetch_html(url)
    if not html:
        return 0
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('.news-item, article, .post')[:5]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://rubezh.ru{link}"
            
            content_el = item.select_one('p, .description')
            content = content_el.get_text(strip=True) if content_el else title
            
            img_el = item.select_one('img')
            image = img_el.get('src') if img_el else None
            
            if title and len(title) > 10:
                existing = supabase.table("news").select("id").eq("title", title).execute()
                if not existing.data:
                    result = await save_news("Рубеж", title, content or "", image, link)
                    if result:
                        count += 1
        except Exception as e:
            logger.error(f"Ошибка парсинга Рубеж: {e}")
    
    logger.info(f"📊 Рубеж: добавлено {count} новостей")
    return count


async def parse_hanwha():
    """Hanwha Vision"""
    logger.info("🌐 Парсинг Hanwha...")
    url = "https://www.hanwhavision.com/en/news-center/news-hub/"
    html = await fetch_html(url)
    if not html:
        return 0
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('article, .news-item, .post')[:5]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://www.hanwhavision.com{link}"
            
            content_el = item.select_one('p, .description')
            content = content_el.get_text(strip=True) if content_el else title
            
            img_el = item.select_one('img')
            image = img_el.get('src') if img_el else None
            
            if title and len(title) > 10:
                existing = supabase.table("news").select("id").eq("title", title).execute()
                if not existing.data:
                    result = await save_news("Hanwha", title, content or "", image, link)
                    if result:
                        count += 1
        except Exception as e:
            logger.error(f"Ошибка парсинга Hanwha: {e}")
    
    logger.info(f"📊 Hanwha: добавлено {count} новостей")
    return count


async def parse_cloudflare():
    """Cloudflare (если есть новости безопасности)"""
    logger.info("🌐 Парсинг Cloudflare...")
    url = "https://cloudflare.net/news/default.aspx"
    html = await fetch_html(url)
    if not html:
        return 0
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('article, .news-item, .post')[:5]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://cloudflare.net{link}"
            
            content_el = item.select_one('p, .description')
            content = content_el.get_text(strip=True) if content_el else title
            
            img_el = item.select_one('img')
            image = img_el.get('src') if img_el else None
            
            if title and len(title) > 10:
                existing = supabase.table("news").select("id").eq("title", title).execute()
                if not existing.data:
                    result = await save_news("Cloudflare", title, content or "", image, link)
                    if result:
                        count += 1
        except Exception as e:
            logger.error(f"Ошибка парсинга Cloudflare: {e}")
    
    logger.info(f"📊 Cloudflare: добавлено {count} новостей")
    return count


async def parse_rgsec():
    """RGSec"""
    logger.info("🇷🇺 Парсинг RGSec...")
    url = "https://www.rgsec.ru/news"
    html = await fetch_html(url)
    if not html:
        return 0
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('.news-item, article, .post')[:5]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://www.rgsec.ru{link}"
            
            content_el = item.select_one('p, .description')
            content = content_el.get_text(strip=True) if content_el else title
            
            img_el = item.select_one('img')
            image = img_el.get('src') if img_el else None
            
            if title and len(title) > 10:
                existing = supabase.table("news").select("id").eq("title", title).execute()
                if not existing.data:
                    result = await save_news("RGSec", title, content or "", image, link)
                    if result:
                        count += 1
        except Exception as e:
            logger.error(f"Ошибка парсинга RGSec: {e}")
    
    logger.info(f"📊 RGSec: добавлено {count} новостей")
    return count


async def parse_dssl():
    """DSSL"""
    logger.info("🇷🇺 Парсинг DSSL...")
    url = "https://www.dssl.ru/publications/news/"
    html = await fetch_html(url)
    if not html:
        return 0
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('.news-item, article, .post')[:5]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://www.dssl.ru{link}"
            
            content_el = item.select_one('p, .description')
            content = content_el.get_text(strip=True) if content_el else title
            
            img_el = item.select_one('img')
            image = img_el.get('src') if img_el else None
            
            if title and len(title) > 10:
                existing = supabase.table("news").select("id").eq("title", title).execute()
                if not existing.data:
                    result = await save_news("DSSL", title, content or "", image, link)
                    if result:
                        count += 1
        except Exception as e:
            logger.error(f"Ошибка парсинга DSSL: {e}")
    
    logger.info(f"📊 DSSL: добавлено {count} новостей")
    return count


async def parse_skud_system():
    """SKUD-System"""
    logger.info("🇷🇺 Парсинг SKUD-System...")
    url = "https://skud-system.ru/news/"
    html = await fetch_html(url)
    if not html:
        return 0
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('.news-item, article, .post')[:5]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://skud-system.ru{link}"
            
            content_el = item.select_one('p, .description')
            content = content_el.get_text(strip=True) if content_el else title
            
            img_el = item.select_one('img')
            image = img_el.get('src') if img_el else None
            
            if title and len(title) > 10:
                existing = supabase.table("news").select("id").eq("title", title).execute()
                if not existing.data:
                    result = await save_news("SKUD-System", title, content or "", image, link)
                    if result:
                        count += 1
        except Exception as e:
            logger.error(f"Ошибка парсинга SKUD-System: {e}")
    
    logger.info(f"📊 SKUD-System: добавлено {count} новостей")
    return count


# ============ КАЗАХСТАНСКИЕ САЙТЫ ============

async def parse_orion_m2m():
    """Orion M2M"""
    logger.info("🇰🇿 Парсинг Orion M2M...")
    url = "https://orion-m2m.kz/news/2025/"
    html = await fetch_html(url)
    if not html:
        return 0
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('.news-item, article, .post')[:5]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            
            # Пропускаем телефоны и короткие заголовки
            if not title or len(title) < 15 or title.startswith('+7'):
                continue
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            
            # Валидация ссылки - пропускаем tel: и mailto:
            if link:
                if link.startswith('tel:') or link.startswith('mailto:'):
                    continue
                if not link.startswith('http'):
                    link = f"https://orion-m2m.kz{link}"
            
            content_el = item.select_one('p, .description')
            content = content_el.get_text(strip=True) if content_el else title
            
            img_el = item.select_one('img')
            image = img_el.get('src') if img_el else None
            
            if title and len(title) > 10:
                existing = supabase.table("news").select("id").eq("title", title).execute()
                if not existing.data:
                    result = await save_news("Orion M2M", title, content or "", image, link)
                    if result:
                        count += 1
        except Exception as e:
            logger.error(f"Ошибка парсинга Orion M2M: {e}")
    
    logger.info(f"📊 Orion M2M: добавлено {count} новостей")
    return count


async def parse_intant():
    """Intant"""
    logger.info("🇰🇿 Парсинг Intant...")
    url = "https://intant.kz/news/"
    html = await fetch_html(url)
    if not html:
        return 0
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('.news-item, article, .post')[:5]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://intant.kz{link}"
            
            content_el = item.select_one('p, .description')
            content = content_el.get_text(strip=True) if content_el else title
            
            img_el = item.select_one('img')
            image = img_el.get('src') if img_el else None
            
            if title and len(title) > 10:
                existing = supabase.table("news").select("id").eq("title", title).execute()
                if not existing.data:
                    result = await save_news("Intant", title, content or "", image, link)
                    if result:
                        count += 1
        except Exception as e:
            logger.error(f"Ошибка парсинга Intant: {e}")
    
    logger.info(f"📊 Intant: добавлено {count} новостей")
    return count


async def parse_inform_kz():
    """Inform.kz (видеонаблюдение)"""
    logger.info("🇰🇿 Парсинг Inform.kz...")
    url = "https://www.inform.kz/tag/videonablyudenie"
    html = await fetch_html(url)
    if not html:
        return 0
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('article, .news-item, .post')[:5]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://www.inform.kz{link}"
            
            content_el = item.select_one('p, .description, .excerpt')
            content = content_el.get_text(strip=True) if content_el else title
            
            img_el = item.select_one('img')
            image = img_el.get('src') if img_el else None
            
            if title and len(title) > 10:
                existing = supabase.table("news").select("id").eq("title", title).execute()
                if not existing.data:
                    result = await save_news("Inform.kz", title, content or "", image, link)
                    if result:
                        count += 1
        except Exception as e:
            logger.error(f"Ошибка парсинга Inform.kz: {e}")
    
    logger.info(f"📊 Inform.kz: добавлено {count} новостей")
    return count


# ============ ГЛАВНАЯ ФУНКЦИЯ ПАРСИНГА ============

async def parse_all_sites():
    """Парсит все 21 источник"""
    logger.info("🔄 Начинаю парсинг всех сайтов...")
    
    total_count = 0
    
    # Зарубежные
    total_count += await parse_hikvision()
    total_count += await parse_dahua()
    total_count += await parse_axis()
    total_count += await parse_bosch()
    total_count += await parse_siemens()
    total_count += await parse_hochiki()
    total_count += await parse_hanwha()
    total_count += await parse_cloudflare()
    
    # Российские
    total_count += await parse_bolid()
    total_count += await parse_perco()
    total_count += await parse_rubezh()
    total_count += await parse_rgsec()
    total_count += await parse_dssl()
    total_count += await parse_skud_system()
    
    # Казахстанские
    total_count += await parse_orion_m2m()
    total_count += await parse_intant()
    total_count += await parse_inform_kz()
    
    logger.info(f"✅ Парсинг всех сайтов завершён! Добавлено {total_count} новостей")


async def scheduled_parsing(context: ContextTypes.DEFAULT_TYPE):
    """Запускается по расписанию"""
    logger.info("⏰ Запуск запланированного парсинга...")
    await parse_all_sites()


# ============ MAIN ============
def main():
    """Запуск бота"""
    app = Application.builder().token(TELEGRAM_TOKEN).build()
    
    # Команды
    app.add_handler(CommandHandler("start", start_command))
    app.add_handler(CommandHandler("parse", parse_command))
    app.add_handler(CommandHandler("list", list_command))
    app.add_handler(CommandHandler("delete", delete_command))
    app.add_handler(CommandHandler("stats", stats_command))
    app.add_handler(CommandHandler("sources", sources_command))
    
    # Обработчик сообщений
    app.add_handler(MessageHandler(filters.ALL, handle_message))
    
    # Планировщик парсинга (каждые 2 часа)
    job_queue = app.job_queue
    job_queue.run_repeating(scheduled_parsing, interval=7200, first=10)
    
    logger.info("🚀 Бот запущен!")
    logger.info("🌐 Парсинг 21 источника новостей о безопасности")
    logger.info("🔍 Фильтрация по ~90 ключевым словам")
    logger.info("📋 Первый парсинг через 10 секунд, затем каждые 2 часа")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
