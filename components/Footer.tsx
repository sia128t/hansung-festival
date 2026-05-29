export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <p className="logo">HSU FESTA</p>
          <p>한성대 대동제 타임라인 시각화 프로젝트</p>
          <p className="footer-sub">
            © 2026 Hansung University Daedongje Timeline.<br />
            디지털 인문정보학 캡스톤디자인 프로젝트로 제작되었습니다.
          </p>
        </div>
        <div className="footer-links">
          <h4>바로가기</h4>
          <ul>
            <li><a href="#timeline">타임라인</a></li>
            <li><a href="#videos">유튜브</a></li>
            <li><a href="#memory">댓글</a></li>
          </ul>
        </div>
        <div className="footer-contact">
          <a
            href="https://www.hansung.ac.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-univ-btn"
          >
            한성대학교
          </a>
          <p>서울특별시 성북구 삼선교로 16길 116</p>
        </div>
      </div>
    </footer>
  );
}
