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
    # === ВИДЕОНАБЛЮДЕНИЕ ===
    r'видеонаблюден',
    r'\bкамер[аеуы]?\b',
    r'\bcctv\b',
    r'ip[- ]камер',
    r'видеорегистратор',
    r'\bnvr\b',
    r'\bdvr\b',
    r'видеоаналитик',
    r'video surveillance',
    r'video analytics',
    r'ip camera',
    r'dome camera',
    r'bullet camera',
    r'\bPTZ\b',
    r'тепловизор',
    r'инфракрасн',
    r'night vision',
    r'ночное видение',
    r'4k камер',
    r'видеопоток',
    r'surveillance camera',

    # === СКУД ===
    r'\bскуд\b',
    r'контроль доступ',
    r'турникет',
    r'шлагбаум',
    r'домофон',
    r'видеодомофон',
    r'считыватель',
    r'электрозамок',
    r'access control system',
    r'электромагнитн',
    r'электромехани',
    r'\bRFID\b',
    r'\bwiegand\b',
    r'\bturnstile\b',
    r'\bintercom\b',
    r'карт[- ]ридер',

    # === ПОЖАРНАЯ БЕЗОПАСНОСТЬ ===
    r'пожарн',
    r'огнетушател',
    r'датчик дым',
    r'пожаротушен',
    r'спринклер',
    r'\bопс\b',
    r'\bаупт\b',
    r'пожарная сигнализац',
    r'fire alarm',
    r'fire detection',
    r'fire suppression',
    r'smoke detect',
    r'flame detect',
    r'пожарный извещат',
    r'аэрозольн.*тушен',
    r'газовое тушен',

    # === ОХРАННАЯ СИГНАЛИЗАЦИЯ ===
    r'сигнализац',
    r'датчик движен',
    r'датчик разбит',
    r'периметр.*охран',
    r'тревожн',
    r'\bPIR\b',
    r'приёмно[- ]контрольн',
    r'прибор приёма',
    r'охранная сигнализац',
    r'intrusion detection system',
    r'motion sensor',

    # === БИОМЕТРИЯ ===
    r'биометр',
    r'распознавание лиц',
    r'face recognition',
    r'face detection',
    r'\bfacial\b.*recogni',
    r'отпечаток пальц',
    r'\bfingerprint\b.*sensor',
    r'сканер лиц',
    r'идентификац.*лиц',
    r'верификац.*биометр',

    # === БРЕНДЫ ЗАРУБЕЖНЫЕ ===
    r'\bhikvision\b',
    r'\bdahua\b',
    r'\baxis\b.*(?:camera|security|communicat|video)',
    r'\bbosch\b.*(?:security|safety|protect|alarm)',
    r'\bsiemens\b.*(?:security|safety|protect|building)',
    r'\bhanwha\b',
    r'\bhoneywell\b.*(?:security|safety|fire|alarm)',
    r'\bhochiki\b',
    r'\bschneider\b.*(?:security|electric)',
    r'\bmilestone\b.*(?:video|security|vms)',
    r'\bgenetec\b',
    r'\barecont\b',
    r'\buniview\b',
    r'\btyco\b',
    r'\bpelco\b',
    r'\bassa abloy\b',
    r'\bdormakaba\b',
    r'\bhid global\b',
    r'\boptex\b',

    # === БРЕНДЫ РУС/СНГ ===
    r'\bболид\b',
    r'\bрубеж\b',
    r'\bperco\b',
    r'\bперко\b',
    r'\bparsec\b',
    r'\bsmartec\b',
    r'\bbeward\b',
    r'\bdssl\b',
    r'\borion m2m\b',
    r'\biqsafety\b',
    r'\biq safety\b',
    r'\brgsec\b',

    # === СИСТЕМЫ БЕЗОПАСНОСТИ ===
    r'система безопасност',
    r'комплекс безопасност',
    r'система охран',
    r'система защит',
    r'интеграция систем безопасност',
    r'монтаж.*(?:камер|сигнализац|скуд)',
    r'инсталляц.*(?:камер|сигнализац|скуд)',

    # === VMS И ВИДЕОМЕНЕДЖМЕНТ ===
    r'\bVMS\b',
    r'video management',
    r'система видеонаблюдения',

    # === ИНФРАСТРУКТУРА БЕЗОПАСНОСТИ ===
    r'\bPoE\b.*(?:камер|switch|security)',
    r'ip[- ]систем.*безопасност',

    # === ТЕНДЕРЫ И РЫНОК ===
    r'тендер.*безопасност',
    r'закупк.*безопасност',
    r'рынок безопасност',
    r'тендер.*(?:скуд|сигнализац|видеонаблюдения|охран)',

    # === ВЫСТАВКИ ===
    r'выставк.*безопасност',
    r'\bexpo\b.*(?:security|safety)',
    r'форум.*безопасност',

    # === НОРМАТИВЫ ===
    r'\bГОСТ\b.*(?:безопасност|охран|пожар|сигнализац)',
    r'сертификат.*безопасност',
    r'лицензия.*безопасност',

    # === ИНЦИДЕНТЫ ===
    r'утечка.*данных.*камер',
    r'взлом.*камер',
    r'уязвимост.*камер',
    r'уязвимост.*(?:скуд|сигнализац)',
]

def check_keywords(text: str) -> bool:
    """Проверяет наличие ключевых слов в тексте"""
    if not text:
        return False
    
    text_lower = text.lower()
    
    for keyword in KEYWORDS:
        if re.search(keyword, text_lower, re.IGNORECASE):
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
            'R0lGODlhAQABAIABAP',
            'R0lGODlhAQABAIAAAA',
            'PHN2ZyB4bWxu',
            'PHN2ZyB4bWxuc',
            'data:image/svg+xml;base64,PHN2',
            'data:image/gif;base64,R0lGOD',
            'placeholder',
            'blank.gif',
            'blank.png',
            'loading.gif',
            '1x1.gif',
            '1x1.png',
        ]
        
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
🔍 Фильтрация по ключевым словам безопасности"""
    
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
    
    title = text.split('\n')[0][:100] if text else "Новость IQ Safety"
    
    # ДЛЯ КАНАЛА IQ SAFETY - БЕЗ ФИЛЬТРА!
    if update.channel_post:
        post_url = f"https://t.me/{CHANNEL_ID.replace('@', '')}/{message.message_id}"
        try:
            data = {
                "source": "IQ Safety",
                "title": title,
                "content": text,
                "image_url": image_url,
                "post_url": post_url,
                "deleted": False
            }
            supabase.table("news").insert(data).execute()
            logger.info(f"✅ Сохранено из канала: {title[:50]}...")
        except Exception as e:
            logger.error(f"❌ Ошибка сохранения из канала: {e}")
    else:
        # Личные сообщения боту - с фильтром
        result = await save_news(
            source="IQ Safety",
            title=title,
            content=text,
            image_url=image_url,
            post_url=None
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
    
    img_selectors = [
        'img', 'picture img', 'picture source',
        '.image img', '.thumbnail img', '.news-image img',
        '.post-image img', '.featured-image img',
        '[class*="image"] img', '[class*="photo"] img', '[class*="pic"] img',
    ]
    
    img_elements = []
    for selector in img_selectors:
        elements = item.select(selector)
        img_elements.extend(elements)
    
    if not img_elements:
        return None
    
    img_attributes = [
        'data-original', 'data-src', 'data-lazy-src',
        'data-srcset', 'data-image', 'data-url',
        'srcset', 'src',
    ]
    
    best_image = None
    best_score = 0
    
    for img_el in img_elements:
        for attr in img_attributes:
            value = img_el.get(attr)
            if not value:
                continue
            
            if 'srcset' in attr and ' ' in value:
                value = value.split(',')[0].split(' ')[0].strip()
            
            value = value.strip()
            
            if not value or len(value) < 10:
                continue
            
            placeholder_signatures = [
                'R0lGODlhAQABAIABAP', 'R0lGODlhAQABAIAAAA',
                'PHN2ZyB4bWxu', 'data:image/gif;base64,R0lGOD',
                'data:image/svg+xml', '//:0',
                'placeholder', 'blank', 'loading', 'spinner',
                'default', 'noimage', 'no-image',
            ]
            
            is_placeholder = False
            for sig in placeholder_signatures:
                if sig in value:
                    is_placeholder = True
                    break
            
            if is_placeholder:
                continue
            
            score = 0
            if attr.startswith('data-'):
                score += 10
            if len(value) > 50:
                score += 5
            if any(ext in value.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                score += 3
            if any(bad in value.lower() for bad in ['icon', 'logo', 'avatar', 'thumb']):
                score -= 5
            
            if score > best_score:
                best_score = score
                best_image = value
    
    if not best_image:
        return None
    
    if best_image.startswith('//'):
        best_image = f"https:{best_image}"
    elif best_image.startswith('/'):
        best_image = f"{base_url}{best_image}"
    elif not best_image.startswith('http') and not best_image.startswith('data:'):
        best_image = f"{base_url}/{best_image}"
    
    return best_image


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
    
    news_items = (
        soup.select('article') or 
        soup.select('.news-item') or 
        soup.select('.content-item') or
        soup.select('[class*="card"]') or
        soup.select('.latest-news-item')
    )[:10]
    
    count = 0
    for item in news_items:
        try:
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
            
            link = None
            if title_el.name == 'a':
                link = title_el.get('href')
            if not link and title_el.parent and title_el.parent.name == 'a':
                link = title_el.parent.get('href')
            if not link:
                inner_link = title_el.find('a')
                if inner_link:
                    link = inner_link.get('href')
            if not link:
                first_link = item.select_one('a[href]')
                if first_link:
                    link = first_link.get('href')
            if not link:
                link = item.get('data-url') or item.get('data-link')
            
            if link:
                if link.startswith('/'):
                    link = f"https://www.hikvision.com{link}"
                elif not link.startswith('http'):
                    link = f"https://www.hikvision.com/en/newsroom/{link}"
            else:
                link = "https://www.hikvision.com/en/newsroom/latest-news/"
            
            content_el = (
                item.select_one('p') or 
                item.select_one('.description') or
                item.select_one('.excerpt')
            )
            content = content_el.get_text(strip=True) if content_el else title
            image = extract_image(item, 'https://www.hikvision.com')
            
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


async def parse_dahua():
    """Dahua"""
    logger.info("🌐 Парсинг Dahua...")
    url = "https://www.dahuasecurity.com/ea/newsEvents"
    html = await fetch_html(url)
    if not html:
        return 0
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('.news-item, article, .news-list li')[:10]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            if not title or len(title) < 15 or title.startswith('+'):
                continue
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://www.dahuasecurity.com{link}"
            if not link:
                link = url
            
            content_el = item.select_one('p, .description')
            content = content_el.get_text(strip=True) if content_el else title
            image = extract_image(item, 'https://www.dahuasecurity.com')
            
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
    news_items = soup.select('article, .news-item, .post')[:10]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            if not title or len(title) < 15 or title.startswith('+'):
                continue
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://newsroom.axis.com{link}"
            if not link:
                link = url
            
            content_el = item.select_one('p, .description')
            content = content_el.get_text(strip=True) if content_el else title
            
            image = None
            picture_el = item.select_one('picture source[srcset]')
            if picture_el:
                srcset = picture_el.get('srcset', '')
                if srcset:
                    image = srcset.split(',')[0].split(' ')[0].strip()
                    if image and not image.startswith('http'):
                        image = f"https://newsroom.axis.com{image}"
            if not image:
                image = extract_image(item, 'https://newsroom.axis.com')
            
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
    news_items = soup.select('article, .news-item, .content-item')[:10]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            if not title or len(title) < 15 or title.startswith('+'):
                continue
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://www.boschbuildingtechnologies.com{link}"
            if not link:
                link = url
            
            content_el = item.select_one('p, .description')
            content = content_el.get_text(strip=True) if content_el else title
            image = extract_image(item, 'https://www.boschbuildingtechnologies.com')
            
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
    news_items = soup.select('article, .news-item, .press-release')[:10]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            if not title or len(title) < 15 or title.startswith('+'):
                continue
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://press.siemens.com{link}"
            if not link:
                link = url
            
            content_el = item.select_one('p, .description, .excerpt')
            content = content_el.get_text(strip=True) if content_el else title
            image = extract_image(item, 'https://press.siemens.com')
            
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
    news_items = soup.select('article, .news-item, .post')[:10]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            if not title or len(title) < 15 or title.startswith('+'):
                continue
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://www.hochikieurope.com{link}"
            if not link:
                link = url
            
            content_el = item.select_one('p, .description')
            content = content_el.get_text(strip=True) if content_el else title
            image = extract_image(item, 'https://www.hochikieurope.com')
            
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


async def parse_hanwha():
    """Hanwha Vision"""
    logger.info("🌐 Парсинг Hanwha...")
    url = "https://www.hanwhavision.com/en/news-center/news-hub/"
    html = await fetch_html(url)
    if not html:
        return 0
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('article, .news-item, .post')[:10]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            if not title or len(title) < 15 or title.startswith('+'):
                continue
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://www.hanwhavision.com{link}"
            if not link:
                link = url
            
            content_el = item.select_one('p, .description')
            content = content_el.get_text(strip=True) if content_el else title
            image = extract_image(item, 'https://www.hanwhavision.com')
            
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
    """Cloudflare"""
    logger.info("🌐 Парсинг Cloudflare...")
    url = "https://cloudflare.net/news/default.aspx"
    html = await fetch_html(url)
    if not html:
        return 0
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('article, .news-item, .post')[:10]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            if not title or len(title) < 15 or title.startswith('+'):
                continue
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://cloudflare.net{link}"
            if not link:
                link = url
            
            content_el = item.select_one('p, .description')
            content = content_el.get_text(strip=True) if content_el else title
            image = extract_image(item, 'https://cloudflare.net')
            
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


# ============ РОССИЙСКИЕ САЙТЫ ============

async def parse_bolid():
    """Болид"""
    logger.info("🇷🇺 Парсинг Болид...")
    url = "https://bolid.ru/about/news/"
    html = await fetch_html(url)
    if not html:
        return 0
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('.news-item, article, .news-list-item')[:10]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            if not title or len(title) < 15 or title.startswith('+'):
                continue
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://bolid.ru{link}"
            if not link:
                link = url
            
            content_el = item.select_one('p, .description, .anons')
            content = content_el.get_text(strip=True) if content_el else title
            image = extract_image(item, 'https://bolid.ru')
            
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
    news_items = soup.select('.news-item, article, .post')[:10]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            if not title or len(title) < 15 or title.startswith('+'):
                continue
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://www.perco.ru{link}"
            if not link:
                link = url
            
            content_el = item.select_one('p, .description')
            content = content_el.get_text(strip=True) if content_el else title
            image = extract_image(item, 'https://www.perco.ru')
            
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


async def parse_rubezh():
    """Рубеж"""
    logger.info("🇷🇺 Парсинг Рубеж...")
    url = "https://rubezh.ru/news"
    html = await fetch_html(url)
    if not html:
        return 0
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('.news-item, article, .post')[:10]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            if not title or len(title) < 15 or title.startswith('+'):
                continue
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://rubezh.ru{link}"
            if not link:
                link = url
            
            content_el = item.select_one('p, .description')
            content = content_el.get_text(strip=True) if content_el else title
            image = extract_image(item, 'https://rubezh.ru')
            
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


async def parse_rgsec():
    """RGSec"""
    logger.info("🇷🇺 Парсинг RGSec...")
    url = "https://www.rgsec.ru/news"
    html = await fetch_html(url)
    if not html:
        return 0
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('.news-item, article, .post')[:10]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            if not title or len(title) < 15 or title.startswith('+'):
                continue
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://www.rgsec.ru{link}"
            if not link:
                link = url
            
            content_el = item.select_one('p, .description')
            content = content_el.get_text(strip=True) if content_el else title
            image = extract_image(item, 'https://www.rgsec.ru')
            
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
    news_items = soup.select('.news-item, article, .post')[:10]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            if not title or len(title) < 15 or title.startswith('+'):
                continue
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://www.dssl.ru{link}"
            if not link:
                link = url
            
            content_el = item.select_one('p, .description')
            content = content_el.get_text(strip=True) if content_el else title
            image = extract_image(item, 'https://www.dssl.ru')
            
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
    news_items = soup.select('.news-item, article, .post')[:10]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            if not title or len(title) < 15 or title.startswith('+'):
                continue
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://skud-system.ru{link}"
            if not link:
                link = url
            
            content_el = item.select_one('p, .description')
            content = content_el.get_text(strip=True) if content_el else title
            image = extract_image(item, 'https://skud-system.ru')
            
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
    news_items = soup.select('.news-item, article, .post')[:10]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            
            if not title or len(title) < 15 or title.startswith('+7'):
                continue
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            
            if link:
                if link.startswith('tel:') or link.startswith('mailto:'):
                    link = None
                elif not link.startswith('http'):
                    link = f"https://orion-m2m.kz{link}"
            if not link:
                link = url
            
            content_el = item.select_one('p, .description')
            content = content_el.get_text(strip=True) if content_el else title
            image = extract_image(item, 'https://orion-m2m.kz')
            
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
    news_items = soup.select('.news-item, article, .post')[:10]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            if not title or len(title) < 15 or title.startswith('+'):
                continue
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://intant.kz{link}"
            if not link:
                link = url
            
            content_el = item.select_one('p, .description')
            content = content_el.get_text(strip=True) if content_el else title
            image = extract_image(item, 'https://intant.kz')
            
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
    """Inform.kz"""
    logger.info("🇰🇿 Парсинг Inform.kz...")
    url = "https://www.inform.kz/tag/videonablyudenie"
    html = await fetch_html(url)
    if not html:
        return 0
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('article, .news-item, .post')[:10]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            if not title or len(title) < 15 or title.startswith('+'):
                continue
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://www.inform.kz{link}"
            if not link:
                link = url
            
            content_el = item.select_one('p, .description, .excerpt')
            content = content_el.get_text(strip=True) if content_el else title
            image = extract_image(item, 'https://www.inform.kz')
            
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



# ============ ПАРСИНГ TELEGRAM КАНАЛОВ (через tg.i-c-a.su JSON API) ============

def strip_html(text: str) -> str:
    """Убирает HTML теги и декодирует HTML сущности"""
    if not text:
        return ""
    text = re.sub(r'<tg-emoji[^>]*>.*?</tg-emoji>', '', text)
    text = re.sub(r'<[^>]+>', ' ', text)
    import html
    text = html.unescape(text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


TELEGRAM_CHANNELS = [
    {"username": "habr_com",      "source": "Habr"},
    {"username": "habr_com_news", "source": "Habr News"},
    {"username": "perco_com",     "source": "Perco"},
    {"username": "rmc_rubezh",    "source": "Рубеж"},
]


async def fetch_json(url: str) -> Optional[list]:
    """Загружает JSON с внешнего API"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=30, headers=headers) as response:
                if response.status == 200:
                    data = await response.json(content_type=None)
                    return data
                else:
                    logger.warning(f"⚠️  fetch_json {url} -> status {response.status}")
    except Exception as e:
        logger.error(f"❌ Ошибка fetch_json {url}: {e}")
    return None


async def parse_telegram_channel(channel: dict) -> int:
    """Парсит публичный Telegram канал через tg.i-c-a.su JSON API"""
    username = channel["username"]
    source = channel["source"]
    api_url = f"https://tg.i-c-a.su/json/{username}?limit=20"

    logger.info(f"📨 Парсинг Telegram @{username} (via tg.i-c-a.su)...")

    posts = await fetch_json(api_url)
    
    if isinstance(posts, dict):
        for key in ["posts", "messages", "data", "items", "results", "channel_posts"]:
            if key in posts and isinstance(posts[key], list):
                posts = posts[key]
                logger.info(f"✅ @{username}: нашли список в ключе '{key}', {len(posts)} items")
                break
        else:
            if "text" in posts or "message" in posts:
                posts = [posts]
            else:
                logger.info(f"📊 @{username}: словарь без известных ключей")
                return 0
    
    if not posts or not isinstance(posts, list):
        logger.info(f"📊 @{username}: нет данных после обработки")
        return 0

    count = 0
    for post in posts[:15]:
        try:
            raw_text = post.get("text") or post.get("message") or ""
            text = strip_html(raw_text)
            if not text or len(text) < 15:
                continue

            title = text.split("\n")[0].strip()[:100]
            if not title or len(title) < 10:
                title = text[:100]

            post_id = post.get("id") or post.get("post_id") or ""
            post_url = f"https://t.me/{username}/{post_id}" if post_id else f"https://t.me/{username}"

            image_url = None
            media = post.get("media")
            if media:
                if isinstance(media, str) and media.startswith("http"):
                    image_url = media
                elif isinstance(media, dict):
                    image_url = media.get("url") or media.get("src") or media.get("file_url")

            existing = supabase.table("news").select("id").eq("title", title).execute()
            if existing.data:
                continue

            result = await save_news(source, title, text, image_url, post_url)
            if result:
                count += 1

        except Exception as e:
            logger.error(f"Ошибка парсинга поста @{username}: {e}")

    logger.info(f"📊 @{username}: добавлено {count} новостей")
    return count


async def parse_all_telegram_channels() -> int:
    """Парсит все сторонние Telegram каналы с задержкой между запросами"""
    total = 0
    for i, channel in enumerate(TELEGRAM_CHANNELS):
        total += await parse_telegram_channel(channel)
        if i < len(TELEGRAM_CHANNELS) - 1:
            await asyncio.sleep(5)
    return total


# ============ ГЛАВНАЯ ФУНКЦИЯ ПАРСИНГА ============

async def parse_all_sites():
    """Парсит все источники"""
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
    
    # Telegram каналы
    total_count += await parse_all_telegram_channels()
    
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
    logger.info("🔍 Точная фильтрация по ключевым словам физической безопасности")
    logger.info("📋 Первый парсинг через 10 секунд, затем каждые 2 часа")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
