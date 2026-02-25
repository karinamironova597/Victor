import { NextResponse } from "next/server";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8540569762:AAFnvJS9v7P6mlfhK1sfGSpQ_nIsY2bbM6s";
const CHANNEL_USERNAME = "iqsafety_news";

// Парсим публичную страницу для получения ID активных постов
async function getActivePostIds() {
  try {
    const response = await fetch(`https://t.me/s/${CHANNEL_USERNAME}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const html = await response.text();
    const postIds: number[] = [];
    
    // Ищем data-post атрибуты которые содержат ID постов
    const postIdRegex = /data-post="[^\/]+\/(\d+)"/g;
    let match;
    
    while ((match = postIdRegex.exec(html)) !== null) {
      const id = parseInt(match[1]);
      if (!isNaN(id)) {
        postIds.push(id);
      }
    }
    
    return postIds.length > 0 ? postIds : null;
  } catch (error) {
    console.error("Error parsing channel page:", error);
    return null;
  }
}

export async function GET() {
  try {
    if (!TOKEN) {
      return NextResponse.json(
        { error: "Токен бота не настроен", posts: [] },
        { status: 200 }
      );
    }

    // Получаем ID канала
    const chatRes = await fetch(
      `https://api.telegram.org/bot${TOKEN}/getChat?chat_id=@${CHANNEL_USERNAME}`,
      { cache: "no-store" }
    );

    const chatData = await chatRes.json();
    if (!chatData.ok) {
      return NextResponse.json(
        { error: "Не удалось найти канал", posts: [] },
        { status: 200 }
      );
    }

    const channelId = chatData.result.id;

    // Получаем список активных постов с сайта
    const activePostIds = await getActivePostIds();

    // Получаем обновления из Bot API
    const updatesRes = await fetch(
      `https://api.telegram.org/bot${TOKEN}/getUpdates?limit=100&allowed_updates=["channel_post"]`,
      { cache: "no-store" }
    );

    const updatesData = await updatesRes.json();
    if (!updatesData.ok) {
      return NextResponse.json(
        { error: "Не удалось получить обновления", posts: [] },
        { status: 200 }
      );
    }

    // Фильтруем посты
    let posts = updatesData.result
      .filter((update: any) => {
        const post = update.channel_post;
        if (!post || post.chat.id !== channelId) return false;
        
        // Если есть список активных постов, фильтруем по нему
        if (activePostIds) {
          return activePostIds.includes(post.message_id);
        }
        
        return true;
      })
      .map((update: any) => {
        const post = update.channel_post;
        
        let imageFileId = null;
        if (post.photo && post.photo.length > 0) {
          const photo = post.photo[post.photo.length - 1];
          imageFileId = photo.file_id;
        }

        return {
          id: post.message_id,
          text: post.text || post.caption || "",
          date: new Date(post.date * 1000).toISOString(),
          imageFileId: imageFileId,
          image: null,
        };
      });

    // Получаем URLs для изображений
    const postsWithImages = await Promise.all(
      posts.map(async (post: any) => {
        if (post.imageFileId) {
          try {
            const fileRes = await fetch(
              `https://api.telegram.org/bot${TOKEN}/getFile?file_id=${post.imageFileId}`,
              { cache: "no-store" }
            );
            const fileData = await fileRes.json();
            
            if (fileData.ok && fileData.result.file_path) {
              post.image = `https://api.telegram.org/file/bot${TOKEN}/${fileData.result.file_path}`;
            }
          } catch (err) {
            console.error("Ошибка получения изображения:", err);
          }
        }
        delete post.imageFileId;
        return post;
      })
    );

    // Сортируем и берем последние 10
    const finalPosts = postsWithImages
      .filter((post: any) => post.text || post.image)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    return NextResponse.json({ posts: finalPosts });
  } catch (error) {
    console.error("Ошибка API:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера", posts: [] },
      { status: 200 }
    );
  }
}