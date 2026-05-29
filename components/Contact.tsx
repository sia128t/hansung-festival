export default function Contact() {
  return (
    <section className="contact-section" id="contact">
      <div className="section-header">
        <p className="section-label">CONTACT</p>
        <h2>문의하기</h2>
        <p className="section-desc">아카이브 관련 문의·제보·오류 신고는 아래로 보내주세요</p>
      </div>
      <div className="contact-card">
        <div className="contact-item">
          <div className="contact-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <div className="contact-info">
            <p className="contact-label">이메일</p>
            <a href="mailto:sia128t@gmail.com" className="contact-value">sia128t@gmail.com</a>
          </div>
        </div>
        <div className="contact-item">
          <div className="contact-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" />
            </svg>
          </div>
          <div className="contact-info">
            <p className="contact-label">응답 시간</p>
            <p className="contact-value">평일 기준 1~2일 이내</p>
          </div>
        </div>
        <div className="contact-item">
          <div className="contact-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="contact-info">
            <p className="contact-label">문의 유형</p>
            <p className="contact-value">자료 제보 · 오류 신고 · 기타 문의</p>
          </div>
        </div>
        <a href="mailto:sia128t@gmail.com" className="btn btn-primary contact-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          이메일 보내기
        </a>
      </div>
    </section>
  );
}
