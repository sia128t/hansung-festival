'use client';
import { useState } from 'react';
import { VIDEO_DATA } from '@/lib/data';

export default function Videos() {
  const [playing, setPlaying] = useState<string | null>(null);

  return (
    <section className="videos-section" id="videos">
      <div className="section-header">
        <p className="section-label">OFFICIAL VIDEO</p>
        <h2>한성대 축제 영상</h2>
        <p className="section-desc">한성대학교 공식 채널의 축제·홍보 영상을 바로 감상하세요</p>
      </div>

      <div className="videos-grid">
        {VIDEO_DATA.map(video => (
          <div key={video.id} className="video-card">
            <div className="video-thumb" onClick={() => setPlaying(video.id)}>
              {playing === video.id ? (
                <iframe
                  src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                    alt={video.title}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                    }}
                  />
                  <button className="play-btn" aria-label="재생">&#9654;</button>
                </>
              )}
            </div>
            <div className="video-info">
              <span className="video-year">{video.year}</span>
              <p className="video-title">{video.title}</p>
              <span className="video-channel">{video.channel}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="videos-channel-link">
        <p className="videos-channel-desc">더 많은 영상은 한성대학교 공식 유튜브 채널에서 확인하세요</p>
        <a
          href="https://www.youtube.com/user/HansungUvi"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-youtube"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          한성대학교 공식 유튜브 채널 바로가기
        </a>
      </div>
      <p className="videos-credit">
        출처:{' '}
        <a
          href="https://www.youtube.com/user/HansungUvi"
          target="_blank"
          rel="noopener noreferrer"
        >
          한성대학교 공식 유튜브 (HansungUvi)
        </a>
      </p>
    </section>
  );
}
