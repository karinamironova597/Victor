'use client';

import Script from 'next/script';

export default function FloatingNewsWidget() {
  return (
    <>
      <button id="floating-news-button" className="floating-news-button" title="Новости">
        📰
        <span id="news-badge" className="news-badge" style={{ display: 'none' }}>0</span>
      </button>

      <div id="floating-news-panel" className="floating-news-panel">
        <div className="news-panel-header">
          <span>📰 Новости безопасности</span>
          <button className="news-panel-close" id="close-panel">×</button>
        </div>
        <div className="news-panel-content" id="news-content">
          <div className="loading">Загрузка новостей...</div>
        </div>
        <div id="pagination-controls" className="pagination-controls" style={{ display: 'none' }}>
          <button id="prev-page" className="pagination-btn">← Назад</button>
          <span id="page-info" className="page-info">Страница 1</span>
          <button id="next-page" className="pagination-btn">Вперёд →</button>
        </div>
      </div>

      <style jsx global>{`
        .floating-news-button{position:fixed;bottom:30px;right:30px;width:60px;height:60px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:50%;box-shadow:0 4px 12px rgba(0,0,0,0.15);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:28px;transition:transform 0.3s,box-shadow 0.3s;z-index:9998;border:none}
        .floating-news-button:hover{transform:scale(1.1);box-shadow:0 6px 20px rgba(0,0,0,0.2)}
        .news-badge{position:absolute;top:-5px;right:-5px;background:#ef4444;color:white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold}
        .floating-news-panel{position:fixed;bottom:100px;right:30px;width:400px;max-width:calc(100vw - 40px);max-height:600px;background:white;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.12);display:none;flex-direction:column;z-index:9999;overflow:hidden}
        .floating-news-panel.open{display:flex;animation:slideUp 0.3s ease-out}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .news-panel-header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;font-weight:600;font-size:16px}
        .news-panel-close{background:rgba(255,255,255,0.2);border:none;color:white;font-size:24px;width:32px;height:32px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.2s}
        .news-panel-close:hover{background:rgba(255,255,255,0.3)}
        .news-panel-content{flex:1;overflow-y:auto;padding:16px}
        .loading{text-align:center;padding:40px 20px;color:#6b7280}
        .error{text-align:center;padding:40px 20px;color:#ef4444}
        .news-item{background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:12px;transition:transform 0.2s,box-shadow 0.2s;cursor:pointer;border:1px solid #e5e7eb}
        .news-item:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.08)}
        .news-item:last-child{margin-bottom:0}
        .news-source{display:inline-block;background:#667eea;color:white;padding:4px 12px;border-radius:12px;font-size:11px;font-weight:600;margin-bottom:8px;text-transform:uppercase}
        .news-image{width:100%;height:180px;object-fit:cover;border-radius:8px;margin-bottom:12px;background:#e5e7eb}
        .news-image-placeholder{width:100%;height:180px;border-radius:8px;margin-bottom:12px;background:linear-gradient(135deg,#667eea20 0%,#764ba220 100%);display:flex;align-items:center;justify-content:center;font-size:48px}
        .news-title{font-size:15px;font-weight:600;color:#111827;margin-bottom:8px;line-height:1.4}
        .news-content{font-size:13px;color:#6b7280;line-height:1.6;margin-bottom:12px;max-height:80px;overflow:hidden;text-overflow:ellipsis}
        .news-footer{display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#9ca3af;padding-top:8px;border-top:1px solid #e5e7eb}
        .news-date{display:flex;align-items:center;gap:4px}
        .read-more{color:#667eea;font-weight:500;text-decoration:none}
        .read-more:hover{text-decoration:underline}
        .pagination-controls{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-top:1px solid #e5e7eb;background:white}
        .pagination-btn{background:#667eea;color:white;border:none;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;transition:background 0.2s}
        .pagination-btn:hover{background:#5568d3}
        .pagination-btn:disabled{background:#d1d5db;cursor:not-allowed}
        .page-info{font-size:13px;color:#6b7280;font-weight:500}
        .news-panel-content::-webkit-scrollbar{width:6px}
        .news-panel-content::-webkit-scrollbar-track{background:#f3f4f6}
        .news-panel-content::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:3px}
        .news-panel-content::-webkit-scrollbar-thumb:hover{background:#9ca3af}
        @media(max-width:768px){.floating-news-button{bottom:20px;right:20px;width:56px;height:56px;font-size:24px}.floating-news-panel{bottom:86px;right:20px;left:20px;width:auto;max-height:70vh}.news-panel-header{padding:14px 16px;font-size:15px}.news-image,.news-image-placeholder{height:160px}.news-title{font-size:14px}.news-content{font-size:12px}}
        @media(max-width:480px){.floating-news-button{bottom:16px;right:16px;width:52px;height:52px;font-size:22px}.news-badge{width:20px;height:20px;font-size:11px}.floating-news-panel{bottom:78px;right:16px;left:16px;max-height:65vh}.news-panel-header{padding:12px 14px;font-size:14px}.news-panel-content{padding:12px}.news-item{padding:12px;margin-bottom:10px}.news-image,.news-image-placeholder{height:140px}.pagination-controls{padding:10px 12px}.pagination-btn{padding:6px 12px;font-size:12px}.page-info{font-size:12px}}
      `}</style>
      <Script id="floating-news-widget" strategy="afterInteractive">
        {`(function(){
          var S='https://dqpqhvaikapnnmablvxh.supabase.co';
          var K='sb_publishable_puDkOEiv0SunnmhJTrlLoQ_7uoHn90_';
          var allNews=[];
          var currentPage=1;
          var newsPerPage=5;
          var seenNewsIds=new Set();
          try{var stored=localStorage.getItem('seenNewsIds');if(stored)seenNewsIds=new Set(JSON.parse(stored))}catch(e){}
          var button=document.getElementById('floating-news-button');
          var panel=document.getElementById('floating-news-panel');
          var closeBtn=document.getElementById('close-panel');
          var content=document.getElementById('news-content');
          var badge=document.getElementById('news-badge');
          var paginationControls=document.getElementById('pagination-controls');
          var prevBtn=document.getElementById('prev-page');
          var nextBtn=document.getElementById('next-page');
          var pageInfo=document.getElementById('page-info');
          button.addEventListener('click',function(){
            panel.classList.toggle('open');
            if(panel.classList.contains('open')){
              allNews.forEach(function(n){seenNewsIds.add(n.id)});
              localStorage.setItem('seenNewsIds',JSON.stringify([...seenNewsIds]));
              updateBadge();
            }
          });
          closeBtn.addEventListener('click',function(){panel.classList.remove('open')});
          document.addEventListener('click',function(e){
            if(!panel.contains(e.target)&&!button.contains(e.target))panel.classList.remove('open');
          });
          prevBtn.addEventListener('click',function(){if(currentPage>1){currentPage--;renderNews()}});
          nextBtn.addEventListener('click',function(){
            var total=Math.ceil(allNews.length/newsPerPage);
            if(currentPage<total){currentPage++;renderNews()}
          });
          async function fetchNews(){
            try{
              var response=await fetch(S+'/rest/v1/news?select=*&deleted=eq.false&order=created_at.desc&limit=50',{headers:{'apikey':K,'Authorization':'Bearer '+K}});
              if(!response.ok)throw new Error('err');
              allNews=await response.json();
              updateBadge();
              renderNews();
            }catch(e){
              console.error(e);
              content.innerHTML='<div class="error">Не удалось загрузить новости</div>';
            }
          }
          function updateBadge(){
            var count=allNews.filter(function(n){return !seenNewsIds.has(n.id)}).length;
            if(count>0){badge.textContent=count>99?'99+':count;badge.style.display='flex'}
            else{badge.style.display='none'}
          }
          function renderNews(){
            if(allNews.length===0){content.innerHTML='<div class="loading">Новостей пока нет</div>';paginationControls.style.display='none';return}
            var start=(currentPage-1)*newsPerPage;
            var pageNews=allNews.slice(start,start+newsPerPage);
            var totalPages=Math.ceil(allNews.length/newsPerPage);
            var T={
              'Hikvision':'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400&h=200&fit=crop',
              'Dahua':'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400&h=200&fit=crop',
              'Axis':'https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=200&fit=crop',
              'Bosch':'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop',
              'Siemens':'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop',
              'Orion M2M':'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=400&h=200&fit=crop',
              'Tengrinews':'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop',
              'Zakon.kz':'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=200&fit=crop',
              'Forbes.kz':'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop',
              'Kapital.kz':'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop',
              'Болид':'https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=200&fit=crop',
              'Perco':'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=400&h=200&fit=crop',
              'Рубеж':'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400&h=200&fit=crop'
            };
            content.innerHTML=pageNews.map(function(news){
              var imageHtml='';
              var hasImage=news.image_url&&news.image_url.trim()!==''&&news.image_url!=='null'&&news.image_url!=='NULL';
              if(hasImage&&(news.image_url.startsWith('http')||news.image_url.startsWith('data:image'))){
                imageHtml='<img src="'+news.image_url+'" alt="'+news.title+'" class="news-image" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\';" /><div class="news-image-placeholder" style="display:none;">📰</div>';
              }else{
                var theme=T[news.source]||'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=200&fit=crop';
                imageHtml='<img src="'+theme+'" alt="'+news.source+'" class="news-image" />';
              }
              return '<div class="news-item" onclick="window.open(\''+( news.post_url||'#')+'\',\'_blank\')">'
                +'<span class="news-source">'+news.source+'</span>'
                +imageHtml
                +'<div class="news-title">'+news.title+'</div>'
                +'<div class="news-content">'+news.content.substring(0,150)+(news.content.length>150?'...':'')+' </div>'
                +'<div class="news-footer">'
                +'<span class="news-date">🕐 '+new Date(news.created_at).toLocaleDateString('ru-RU',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})+'</span>'
                +(news.post_url?'<span class="read-more">Читать →</span>':'')+' </div></div>';
            }).join('');
            if(totalPages>1){
              paginationControls.style.display='flex';
              pageInfo.textContent='Страница '+currentPage+' из '+totalPages;
              prevBtn.disabled=currentPage===1;
              nextBtn.disabled=currentPage===totalPages;
            }else{paginationControls.style.display='none'}
            content.scrollTop=0;
          }
          fetchNews();
          setInterval(fetchNews,120000);
        })()`}
      </Script>
    </>
  );
}
