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
            "deleted": False  # По умолчанию не удалена
        }
        result = supabase.table("news").insert(data).execute()
        logger.info(f"Сохранено: {title[:50]}...")
        return result
    except Exception as e:
        logger.error(f"Ошибка сохранения: {e}")
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
        
        # Помечаем как удалённую
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
        
        # Подсчёт по источникам
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
    
    # Получаем текст
    text = message.text or message.caption or ""
    
    # Игнорируем команды
    if text.startswith('/'):
        return
    
    # Получаем фото
    image_url = None
    if message.photo:
        photo = message.photo[-1]  # Самое большое фото
        file = await context.bot.get_file(photo.file_id)
        image_url = file.file_path
    
    # Ссылка на пост (если это из канала)
    post_url = None
    if update.channel_post:
        post_url = f"https://t.me/{CHANNEL_ID.replace('@', '')}/{message.message_id}"
    
    # Заголовок — первая строка или первые 100 символов
    title = text.split('\n')[0][:100] if text else "Новость IQ Safety"
    
    # Сохраняем
    result = await save_news(
        source="IQ Safety",
        title=title,
        content=text,
        image_url=image_url,
        post_url=post_url
    )
    
    # Если сообщение из личного чата - публикуем в канал
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
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=30) as response:
                if response.status == 200:
                    return await response.text()
    except Exception as e:
        logger.error(f"Ошибка загрузки {url}: {e}")
    return None


async def parse_perco():
    """Парсит новости с PERCO"""
    logger.info("Парсинг PERCO...")
    url = "https://www.perco.ru/news/"
    html = await fetch_html(url)
    if not html:
        return
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('.news-item, .news-list-item, article')[:5]
    
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://www.perco.ru{link}"
            
            content_el = item.select_one('p, .description, .text')
            content = content_el.get_text(strip=True) if content_el else ""
            
            img_el = item.select_one('img')
            image = img_el['src'] if img_el else None
            if image and not image.startswith('http'):
                image = f"https://www.perco.ru{image}"
            
            if title:
                # Проверяем что такой новости ещё нет
                existing = supabase.table("news").select("id").eq("title", title).execute()
                if not existing.data:
                    await save_news("PERCO", title, content, image, link)
        except Exception as e:
            logger.error(f"Ошибка парсинга PERCO: {e}")


async def parse_hikvision():
    """Парсит новости с Hikvision"""
    logger.info("Парсинг Hikvision...")
    url = "https://www.hikvision.com/ru/newsroom/latest-news/"
    html = await fetch_html(url)
    if not html:
        return
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('.news-item, .news-card, article, .item')[:5]
    
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://www.hikvision.com{link}"
            
            content_el = item.select_one('p, .description')
            content = content_el.get_text(strip=True) if content_el else ""
            
            img_el = item.select_one('img')
            image = img_el.get('src') or img_el.get('data-src') if img_el else None
            
            if title:
                existing = supabase.table("news").select("id").eq("title", title).execute()
                if not existing.data:
                    await save_news("Hikvision", title, content, image, link)
        except Exception as e:
            logger.error(f"Ошибка парсинга Hikvision: {e}")


async def parse_tbloc():
    """Парсит новости с TBLOC"""
    logger.info("Парсинг TBLOC...")
    url = "https://t-bloc.ru/news/"
    html = await fetch_html(url)
    if not html:
        return
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('.news-item, article, .post')[:5]
    
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://t-bloc.ru{link}"
            
            content_el = item.select_one('p, .description')
            content = content_el.get_text(strip=True) if content_el else ""
            
            img_el = item.select_one('img')
            image = img_el['src'] if img_el else None
            
            if title:
                existing = supabase.table("news").select("id").eq("title", title).execute()
                if not existing.data:
                    await save_news("TBLOC", title, content, image, link)
        except Exception as e:
            logger.error(f"Ошибка парсинга TBLOC: {e}")


async def parse_zkteco():
    """Парсит новости с ZKTeco"""
    logger.info("Парсинг ZKTeco...")
    url = "https://www.zkteco.ru/news/"
    html = await fetch_html(url)
    if not html:
        return
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('.news-item, article, .post, .news-card')[:5]
    
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://www.zkteco.ru{link}"
            
            content_el = item.select_one('p, .description')
            content = content_el.get_text(strip=True) if content_el else ""
            
            img_el = item.select_one('img')
            image = img_el.get('src') or img_el.get('data-src') if img_el else None
            
            if title:
                existing = supabase.table("news").select("id").eq("title", title).execute()
                if not existing.data:
                    await save_news("ZKTeco", title, content, image, link)
        except Exception as e:
            logger.error(f"Ошибка парсинга ZKTeco: {e}")


async def parse_dahua():
    """Парсит новости с Dahua"""
    logger.info("Парсинг Dahua...")
    url = "https://www.dahuasecurity.com/ru/newsEvents/news"
    html = await fetch_html(url)
    if not html:
        return
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('.news-item, article, .news-list li, .item')[:5]
    
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://www.dahuasecurity.com{link}"
            
            content_el = item.select_one('p, .description, .text')
            content = content_el.get_text(strip=True) if content_el else ""
            
            img_el = item.select_one('img')
            image = img_el.get('src') if img_el else None
            
            if title:
                existing = supabase.table("news").select("id").eq("title", title).execute()
                if not existing.data:
                    await save_news("Dahua", title, content, image, link)
        except Exception as e:
            logger.error(f"Ошибка парсинга Dahua: {e}")


async def parse_axis():
    """Парсит новости с Axis Communications"""
    logger.info("Парсинг Axis...")
    url = "https://www.axis.com/ru-ru/about-axis/news"
    html = await fetch_html(url)
    if not html:
        return
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('.news-item, article, .news-card, .item')[:5]
    
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://www.axis.com{link}"
            
            content_el = item.select_one('p, .description')
            content = content_el.get_text(strip=True) if content_el else ""
            
            img_el = item.select_one('img')
            image = img_el.get('src') if img_el else None
            
            if title:
                existing = supabase.table("news").select("id").eq("title", title).execute()
                if not existing.data:
                    await save_news("Axis", title, content, image, link)
        except Exception as e:
            logger.error(f"Ошибка парсинга Axis: {e}")


async def parse_bolid():
    """Парсит новости с Болид (российский производитель)"""
    logger.info("Парсинг Болид...")
    url = "https://bolid.ru/company/news/"
    html = await fetch_html(url)
    if not html:
        return
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('.news-item, article, .news-list-item, .item')[:5]
    
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://bolid.ru{link}"
            
            content_el = item.select_one('p, .description, .anons')
            content = content_el.get_text(strip=True) if content_el else ""
            
            img_el = item.select_one('img')
            image = img_el.get('src') if img_el else None
            if image and not image.startswith('http'):
                image = f"https://bolid.ru{image}"
            
            if title:
                existing = supabase.table("news").select("id").eq("title", title).execute()
                if not existing.data:
                    await save_news("Болид", title, content, image, link)
        except Exception as e:
            logger.error(f"Ошибка парсинга Болид: {e}")


async def parse_securitymedia():
    """Парсит новости с Security Media (отраслевой портал)"""
    logger.info("Парсинг SecurityMedia...")
    url = "https://www.securitymedia.ru/news/"
    html = await fetch_html(url)
    if not html:
        return
    
    soup = BeautifulSoup(html, 'html.parser')
    news_items = soup.select('.news-item, article, .post, .item')[:5]
    
    for item in news_items:
        try:
            title_el = item.select_one('h2, h3, .title, a')
            title = title_el.get_text(strip=True) if title_el else None
            
            link_el = item.select_one('a[href]')
            link = link_el['href'] if link_el else None
            if link and not link.startswith('http'):
                link = f"https://www.securitymedia.ru{link}"
            
            content_el = item.select_one('p, .description, .anons')
            content = content_el.get_text(strip=True) if content_el else ""
            
            img_el = item.select_one('img')
            image = img_el.get('src') if img_el else None
            
            if title:
                existing = supabase.table("news").select("id").eq("title", title).execute()
                if not existing.data:
                    await save_news("Отрасль", title, content, image, link)
        except Exception as e:
            logger.error(f"Ошибка парсинга SecurityMedia: {e}")


async def parse_all_sites():
    """Парсит все сайты"""
    logger.info("🔄 Начинаю парсинг всех сайтов...")
    await parse_perco()
    await parse_hikvision()
    await parse_tbloc()
    await parse_zkteco()
    await parse_dahua()
    await parse_axis()
    await parse_bolid()
    await parse_securitymedia()
    logger.info("✅ Парсинг всех сайтов завершён")


async def scheduled_parsing(context: ContextTypes.DEFAULT_TYPE):
    """Запускается по расписанию"""
    logger.info("⏰ Запуск запланированного парсинга...")
    await parse_all_sites()


# ============ MAIN ============
def main():
    """Запуск бота"""
    # Создаём приложение
    app = Application.builder().token(TELEGRAM_TOKEN).build()
    
    # Команды
    app.add_handler(CommandHandler("start", start_command))
    app.add_handler(CommandHandler("parse", parse_command))
    app.add_handler(CommandHandler("list", list_command))
    app.add_handler(CommandHandler("delete", delete_command))
    app.add_handler(CommandHandler("stats", stats_command))
    
    # Обработчик всех сообщений (и из личного чата, и из канала)
    app.add_handler(MessageHandler(filters.ALL, handle_message))
    
    # Планировщик парсинга (каждые 2 часа)
    job_queue = app.job_queue
    job_queue.run_repeating(scheduled_parsing, interval=7200, first=10)
    
    # Запускаем
    logger.info("🚀 Бот запущен!")
    logger.info("📋 Первый парсинг через 10 секунд, затем каждые 2 часа")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
