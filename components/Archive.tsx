'use client';
import { useState } from 'react';
import { ARCHIVE_DATA } from '@/lib/data';

export default function Archive() {
  const [query, setQuery] = useState('');

  const filtered = query
    ? ARCHIVE_DATA.filter(row =>
        row.year.toString().includes(query) ||
        row.name.toLowerCase().includes(query.toLowerCase()) ||
        row.performers.toLowerCase().includes(query.toLowerCase()) ||
        row.note.toLowerCase().includes(query.toLowerCase())
      )
    : ARCHIVE_DATA;

  return (
    <section className="archive-section" id="archive">
      <div className="section-header">
        <p className="section-label">ARCHIVE</p>
        <h2>역대 공연팀과 행사정보 검색</h2>
        <p className="section-desc">연도, 공연팀, 행사명으로 검색해보세요</p>
      </div>

      <div className="archive-search">
        <input
          type="search"
          placeholder="공연팀, 행사명, 연도로 검색..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      <div className="archive-table-wrap">
        <table className="archive-table">
          <thead>
            <tr>
              <th>연도</th>
              <th>축제명</th>
              <th>메인 공연</th>
              <th>특이사항</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => (
              <tr key={row.year}>
                <td className="td-year">{row.year}</td>
                <td>{row.name}</td>
                <td>{row.performers}</td>
                <td>{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
