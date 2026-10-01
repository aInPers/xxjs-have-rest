import "./about-page.css";

interface AboutPageProps {
  onBack: () => void;
}

/**
 * Renders project version, licensing, and source-code information.
 *
 * @param onBack - Returns to the WeChat-style chat list.
 */
function AboutPage({ onBack }: AboutPageProps) {
  return (
    <main className="about-page">
      <header className="about-header">
        <button type="button" onClick={onBack} aria-label="返回微信">‹</button>
        <h1>关于</h1>
        <span aria-hidden="true" />
      </header>
      <section className="about-intro">
        <div className="about-mark" aria-hidden="true">请</div>
        <h2>请假系统</h2>
        <p>版本 1.0</p>
      </section>
      <section className="about-details" aria-label="软件信息">
        <div className="about-row"><span>开源协议</span><strong>MIT License</strong></div>
        <div className="about-row source-code"><span>GitHub</span><code>https://github.com/aInPers/xxjs-have-rest</code></div>
      </section>
      <aside className="free-notice" role="note">
        <strong>免费开源声明</strong>
        <p>本软件完全免费开源，若是付费购买纯属诈骗。</p>
        <p>本软件仅用于学习交流，任何违法使用作者概不承担其责任</p>
      </aside>
    </main>
  );
}

export default AboutPage;
