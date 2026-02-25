"use client";

import { useEffect, useRef, useState } from "react";

interface Post {
  id: number;
  text: string;
  date: string;
  image?: string;
}

export default function TelegramWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Загружаем посты при открытии виджета
  useEffect(() => {
    if (isOpen && posts.length === 0) {
      fetchPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  async function fetchPosts() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/telegram");

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setPosts(data.posts || []);
        if (data.posts && data.posts.length === 0) {
          setError("Новостей пока нет");
        }
      }
    } catch (err) {
      setError("Не удалось загрузить новости");
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div ref={widgetRef} className="fixed bottom-6 right-6 z-50">
      {/* КНОПКА С НАСТОЯЩИМ ЛОГО TELEGRAM */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={
          "relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 " +
          (isOpen
            ? "bg-red-500 hover:bg-red-600 scale-95"
            : "bg-[#0088cc] hover:bg-[#0077b5] hover:scale-110 shadow-lg hover:shadow-2xl")
        }
        aria-label={isOpen ? "Закрыть" : "Открыть новости"}
      >
        {isOpen ? (
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-9 h-9 text-white"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
          </svg>
        )}
      </button>

      {/* ОКНО С НОВОСТЯМИ */}
      <div
        className={
          "absolute bottom-20 right-0 w-96 bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 " +
          (isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none")
        }
      >
        {/* Заголовок с кнопкой обновления */}
        <div className="bg-gradient-to-br from-[#0088cc] via-[#0088cc] to-[#229ED9] text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg
                className="w-8 h-8 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
              </svg>
              <div>
                <h3 className="font-bold text-lg">Новости IQ Safety</h3>
                <p className="text-xs opacity-90">@iqsafety_news</p>
              </div>
            </div>
            
            {/* Кнопка обновления */}
            <button
              onClick={fetchPosts}
              disabled={loading}
              className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 disabled:opacity-50"
              aria-label="Обновить"
            >
              <svg
                className={
                  "w-5 h-5 text-white transition-transform duration-500 " +
                  (loading ? "animate-spin" : "")
                }
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Контент с улучшенным скроллингом */}
        <div className="h-[420px] overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-[#0088cc]/20 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#0088cc] border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-500 text-sm animate-pulse">
                Загрузка новостей...
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-6 text-center shadow-sm">
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-red-600 font-medium mb-4">{error}</p>
              <button
                onClick={fetchPosts}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Попробовать снова
              </button>
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className="text-center text-gray-500 h-full flex items-center justify-center flex-col gap-4">
              <div className="text-6xl opacity-50">📭</div>
              <p className="text-lg font-medium">Пока нет новостей</p>
              <button
                onClick={fetchPosts}
                className="text-[#0088cc] hover:text-[#0077b5] font-medium hover:underline transition-colors"
              >
                Обновить
              </button>
            </div>
          )}

          {!loading && posts.length > 0 && (
            <div className="space-y-3">
              {posts.map((post, index) => (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-[#0088cc]/30 transform hover:scale-[1.02]"
                  style={{
                    animation: `slideIn 0.3s ease-out ${index * 0.1}s both`,
                  }}
                >
                  {/* Изображение если есть */}
                  {post.image && (
                    <img
                      src={post.image}
                      alt="Post"
                      className="w-full h-48 object-cover rounded-xl mb-3"
                      loading="lazy"
                    />
                  )}
                  
                  {/* Текст с улучшенным форматированием */}
                  <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                    {post.text}
                  </p>
                  
                  {/* Дата и время */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-xs text-gray-500 font-medium">
                      {new Date(post.date).toLocaleString("ru-RU", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Футер с улучшенной кнопкой */}
        <div className="border-t border-gray-200 p-3 bg-white">
          
           <a href="https://t.me/iqsafety_news"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-[#0088cc] hover:text-white bg-gradient-to-r from-transparent to-transparent hover:from-[#0088cc] hover:to-[#0077b5] transition-all duration-300 text-sm font-semibold py-3 rounded-xl group"
          >
            <svg
              className="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
            </svg>
            <span>Открыть в Telegram</span>
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>
      </div>

      {/* CSS для анимации */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Кастомный скроллбар */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        .scrollbar-thumb-gray-200::-webkit-scrollbar-thumb {
          background: #e5e7eb;
        }
      `
      }</style>
    </div>
  );
}