import asyncio
import logging
from datetime import datetime
from typing import Optional
import aiohttp
from bs4 import BeautifulSoup
from telegram import Update
from telegram.ext import Application, MessageHandler, CommandHandler, filters, ContextTypes
from supabase import create_client, Client

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


# ============ СОХРАНЕНИЕ В БАЗУ ============
async def save_news(source: str, title: str, content: str, image_url: str = None, post_url: str = None):
    """Сохраняет новость в Supabase"""
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
        "/stats - Статистика новостей"
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
            source = news.get('source', 'Unknown')
            sources[source] = sources.get(source, 0) + 1
        
        message = f"📊 Статистика новостей:\n\n"
        message += f"📰 Всего новостей: {total}\n"
        message += f"✅ Активных: {active}\n"
        message += f"❌ Удалённых: {deleted}\n\n"
        message += "📍 По источникам:\n"
        for source, count in sorted(sources.items(), key=lambda x: x[1], reverse=True):
            message += f"  • {source}: {count}\n"
        
        await update.message.reply_text(message)
    except Exception as e:
        await update.message.reply_text(f"❌ Ошибка: {e}")
        logger.error(f"Ошибка в stats_command: {e}")


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


async def parse_tengrinews():
    """Парсит Tengrinews.kz - главные новости Казахстана"""
    logger.info("🇰🇿 Парсинг Tengrinews.kz...")
    url = "https://tengrinews.kz/"
    html = await fetch_html(url)
    if not html:
        return
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('.main-news_top_item, .main-news_content_item')[:5]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('.main-news_top_item_title, .main-news_content_item_title, a')
            title = title_el.get_text(strip=True) if title_el else None
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://tengrinews.kz{link}"
            
            img_el = item.select_one('img')
            image = img_el.get('src') or img_el.get('data-src') if img_el else None
            if image and not image.startswith('http'):
                image = f"https://tengrinews.kz{image}"
            
            if title and len(title) > 10:
                existing = supabase.table("news").select("id").eq("title", title).execute()
                if not existing.data:
                    await save_news("Tengrinews", title, title, image, link)
                    count += 1
        except Exception as e:
            logger.error(f"Ошибка парсинга Tengrinews: {e}")
    
    logger.info(f"📊 Tengrinews: добавлено {count} новостей")


async def parse_forbes_kz():
    """Парсит Forbes.kz - бизнес новости"""
    logger.info("💼 Парсинг Forbes.kz...")
    url = "https://forbes.kz/"
    html = await fetch_html(url)
    if not html:
        return
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('article, .article-item, .news-item')[:5]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .article-title, a')
            title = title_el.get_text(strip=True) if title_el else None
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://forbes.kz{link}"
            
            content_el = item.select_one('p, .excerpt, .description')
            content = content_el.get_text(strip=True) if content_el else title
            
            img_el = item.select_one('img')
            image = img_el.get('src') or img_el.get('data-src') if img_el else None
            
            if title and len(title) > 10:
                existing = supabase.table("news").select("id").eq("title", title).execute()
                if not existing.data:
                    await save_news("Forbes KZ", title, content, image, link)
                    count += 1
        except Exception as e:
            logger.error(f"Ошибка парсинга Forbes: {e}")
    
    logger.info(f"📊 Forbes KZ: добавлено {count} новостей")


async def parse_zakon_kz():
    """Парсит Zakon.kz - правовой портал"""
    logger.info("⚖️ Парсинг Zakon.kz...")
    url = "https://www.zakon.kz/news"
    html = await fetch_html(url)
    if not html:
        return
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('.news-item, article, .post-item')[:5]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .news-title, a')
            title = title_el.get_text(strip=True) if title_el else None
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://www.zakon.kz{link}"
            
            content_el = item.select_one('p, .news-excerpt')
            content = content_el.get_text(strip=True) if content_el else title
            
            img_el = item.select_one('img')
            image = img_el.get('src') if img_el else None
            
            if title and len(title) > 10:
                existing = supabase.table("news").select("id").eq("title", title).execute()
                if not existing.data:
                    await save_news("Zakon.kz", title, content, image, link)
                    count += 1
        except Exception as e:
            logger.error(f"Ошибка парсинга Zakon: {e}")
    
    logger.info(f"📊 Zakon.kz: добавлено {count} новостей")


async def parse_inbusiness():
    """Парсит InBusiness.kz - деловой портал"""
    logger.info("💰 Парсинг InBusiness.kz...")
    url = "https://inbusiness.kz/ru/news"
    html = await fetch_html(url)
    if not html:
        return
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('.news-list-item, article, .news-item')[:5]
    
    count = 0
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://inbusiness.kz{link}"
            
            content_el = item.select_one('p, .description')
            content = content_el.get_text(strip=True) if content_el else title
            
            img_el = item.select_one('img')
            image = img_el.get('src') if img_el else None
            
            if title and len(title) > 10:
                existing = supabase.table("news").select("id").eq("title", title).execute()
                if not existing.data:
                    await save_news("InBusiness", title, content, image, link)
                    count += 1
        except Exception as e:
            logger.error(f"Ошибка парсинга InBusiness: {e}")
    
    logger.info(f"📊 InBusiness: добавлено {count} новостей")


async def parse_kapital_kz():
    """Парсит Kapital.kz - экономический портал"""
    logger.info("📈 Парсинг Kapital.kz...")
    url = "https://kapital.kz/economic"
    html = await fetch_html(url)
    if not html:
        return
    
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
                link = f"https://kapital.kz{link}"
            
            content_el = item.select_one('p, .description')
            content = content_el.get_text(strip=True) if content_el else title
            
            img_el = item.select_one('img')
            image = img_el.get('src') or img_el.get('data-src') if img_el else None
            
            if title and len(title) > 10:
                existing = supabase.table("news").select("id").eq("title", title).execute()
                if not existing.data:
                    await save_news("Kapital.kz", title, content, image, link)
                    count += 1
        except Exception as e:
            logger.error(f"Ошибка парсинга Kapital: {e}")
    
    logger.info(f"📊 Kapital.kz: добавлено {count} новостей")


async def parse_all_sites():
    """Парсит все сайты"""
    logger.info("🔄 Начинаю парсинг казахстанских сайтов...")
    
    await parse_tengrinews()
    await parse_forbes_kz()
    await parse_zakon_kz()
    await parse_inbusiness()
    await parse_kapital_kz()
    
    logger.info("✅ Парсинг всех сайтов завершён")


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
    
    # Обработчик сообщений
    app.add_handler(MessageHandler(filters.ALL, handle_message))
    
    # Планировщик парсинга (каждые 2 часа)
    job_queue = app.job_queue
    job_queue.run_repeating(scheduled_parsing, interval=7200, first=10)
    
    logger.info("🚀 Бот запущен!")
    logger.info("🇰🇿 Парсинг казахстанских новостных сайтов")
    logger.info("📋 Первый парсинг через 10 секунд, затем каждые 2 часа")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
