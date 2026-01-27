import asyncio
import logging
from datetime import datetime
from typing import Optional
import aiohttp
from bs4 import BeautifulSoup
from telegram import Update
from telegram.ext import Application, MessageHandler, filters, ContextTypes
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
            "post_url": post_url
        }
        result = supabase.table("news").insert(data).execute()
        logger.info(f"Сохранено: {title[:50]}...")
        return result
    except Exception as e:
        logger.error(f"Ошибка сохранения: {e}")
        return None


# ============ TELEGRAM HANDLER ============
async def handle_channel_post(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обрабатывает новые посты из канала"""
    message = update.channel_post
    if not message:
        return
    
    # Получаем текст
    text = message.text or message.caption or ""
    
    # Получаем фото
    image_url = None
    if message.photo:
        photo = message.photo[-1]  # Самое большое фото
        file = await context.bot.get_file(photo.file_id)
        image_url = file.file_path
    
    # Ссылка на пост
    post_url = f"https://t.me/{CHANNEL_ID.replace('@', '')}/{message.message_id}"
    
    # Заголовок — первая строка или первые 100 символов
    title = text.split('\n')[0][:100] if text else "Новость IQ Safety"
    
    # Сохраняем
    await save_news(
        source="IQ Safety",
        title=title,
        content=text,
        image_url=image_url,
        post_url=post_url
    )


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
    logger.info("Начинаю парсинг сайтов...")
    await parse_perco()
    await parse_hikvision()
    await parse_tbloc()
    await parse_zkteco()
    await parse_dahua()
    await parse_axis()
    await parse_bolid()
    await parse_securitymedia()
    logger.info("Парсинг завершён")


async def scheduled_parsing(context: ContextTypes.DEFAULT_TYPE):
    """Запускается по расписанию"""
    await parse_all_sites()


# ============ MAIN ============
def main():
    """Запуск бота"""
    # Создаём приложение
    app = Application.builder().token(TELEGRAM_TOKEN).build()
    
    # Обработчик постов из канала
    app.add_handler(MessageHandler(
        filters.Chat(chat_id=None, username=CHANNEL_ID.replace('@', '')),
        handle_channel_post
    ))
    
    # Планировщик парсинга (каждые 2 часа)
    job_queue = app.job_queue
    job_queue.run_repeating(scheduled_parsing, interval=7200, first=10)
    
    # Запускаем
    logger.info("Бот запущен!")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
