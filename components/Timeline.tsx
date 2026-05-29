import { TIMELINE_EMBED_URL, TIMELINE_EMBED_HEIGHT } from '@/lib/data';

export default function Timeline() {
  return (
    <section className="timeline-section" id="timeline">
      <div className="timeline-container">
        <p className="timeline-kicker">HSU FESTA TIMELINE</p>
        <iframe
          className="timeline-embed-frame"
          src={TIMELINE_EMBED_URL}
          style={{ height: `${TIMELINE_EMBED_HEIGHT}px` }}
          title="HSU Festa Timeline"
          loading="lazy"
          allowFullScreen
        />
      </div>
    </section>
  );
}
