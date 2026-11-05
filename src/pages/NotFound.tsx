import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { localized } from '@/lib/language';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <main className="dex404-page">
      <style>{`
        .dex404-page {
          --dex-ink: #102a46;
          min-height: 100svh;
          display: grid;
          place-items: center;
          overflow: hidden;
          padding: 32px 18px;
          color: #f5f9ff;
          background-color: #101820;
          background-image:
            linear-gradient(#ffffff0b 1px, transparent 1px),
            linear-gradient(90deg, #ffffff0b 1px, transparent 1px),
            radial-gradient(ellipse at center, #23384a 0%, #101820 72%);
          background-size: 28px 28px, 28px 28px, auto;
          font-family: 'Chakra Petch', system-ui, sans-serif;
        }
        .dex404-content {
          width: min(100%, 460px);
          text-align: center;
        }
        .dex404-device {
          padding: 12px;
          overflow: hidden;
          border: 3px solid #4d1115;
          border-radius: 28px;
          background: linear-gradient(145deg, #ff3838 0%, #d10e18 46%, #a90913 100%);
          box-shadow:
            inset 0 3px 0 #ffaaaa,
            inset 0 -5px 0 #7b1016,
            0 18px 42px #0008;
        }
        .dex404-device-top {
          height: 66px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 8px 10px;
          color: white;
          text-align: left;
        }
        .dex404-lens {
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          border: 4px solid #f4f4f4;
          border-radius: 50%;
          background: radial-gradient(circle at 32% 27%, #e7fbff 0 9%, #56c8f0 20%, #147ab3 62%, #0c396c 100%);
          box-shadow: 0 0 0 2px #541018, inset 0 0 0 2px #2877a1;
        }
        .dex404-brand {
          font-family: 'Press Start 2P', 'Chakra Petch', sans-serif;
          font-size: clamp(11px, 3vw, 15px);
          letter-spacing: .04em;
          text-shadow: 0 2px #7b1016;
        }
        .dex404-lights {
          display: flex;
          gap: 5px;
          margin-left: auto;
        }
        .dex404-lights i {
          width: 9px;
          height: 9px;
          border: 1px solid #501116;
          border-radius: 50%;
          background: #40d676;
          box-shadow: inset 0 1px 2px #fff9;
        }
        .dex404-lights i:nth-child(2) { background: #ffd34f; }
        .dex404-lights i:nth-child(3) { background: #ef4650; }
        .dex404-screen {
          min-height: 390px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          border: 4px solid #172d42;
          border-radius: 14px;
          color: var(--dex-ink);
          background-color: #a4d1e7;
          background-image:
            linear-gradient(#ffffff25 1px, transparent 1px),
            linear-gradient(90deg, #ffffff25 1px, transparent 1px),
            linear-gradient(145deg, #b7e0f0, #91c4df);
          background-size: 28px 28px, 28px 28px, auto;
          box-shadow: 0 0 0 4px #631018, inset 0 2px 8px #17365330;
        }
        .dex404-code {
          margin: 0 0 8px;
          font-family: 'Press Start 2P', 'Chakra Petch', sans-serif;
          font-size: clamp(20px, 7vw, 34px);
          letter-spacing: .04em;
          text-shadow: 0 2px #ffffff75;
        }
        .dex404-face {
          width: clamp(116px, 34vw, 150px);
          height: auto;
          margin: 0 auto 7px;
          filter: drop-shadow(0 8px 4px #17365324);
        }
        .dex404-screen-title {
          max-width: 310px;
          margin: 0;
          font-size: clamp(19px, 5vw, 25px);
          font-weight: 700;
          line-height: 1.25;
        }
        .dex404-screen-copy {
          max-width: 310px;
          margin: 8px 0 0;
          color: #294a66;
          font-size: 15px;
          line-height: 1.45;
        }
        .dex404-device-bottom {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          height: 58px;
          padding-top: 10px;
        }
        .dex404-control {
          width: 58px;
          height: 31px;
          border: 2px solid #671219;
          border-radius: 8px;
          background: linear-gradient(#cce7f3, #83b8d1);
          box-shadow: 0 3px 0 #650d15, inset 0 1px 0 #fff;
        }
        .dex404-control--wide { width: 90px; }
        .dex404-return {
          display: inline-flex;
          min-height: 48px;
          align-items: center;
          justify-content: center;
          margin-top: 24px;
          padding: 10px 22px;
          border: 2px solid #8be9f2;
          border-radius: 10px;
          color: #062a3b;
          background: linear-gradient(180deg, #a7f4f4, #68d5e8);
          box-shadow: 0 4px 0 #20556d, 0 8px 18px #0004;
          font-size: 16px;
          font-weight: 700;
          text-decoration: none;
          transition: transform .15s ease, box-shadow .15s ease;
        }
        .dex404-return:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 0 #20556d, 0 10px 20px #0005;
        }
        .dex404-return:active {
          transform: translateY(2px);
          box-shadow: 0 2px 0 #20556d, 0 4px 10px #0004;
        }
        .dex404-return:focus-visible {
          outline: 3px solid white;
          outline-offset: 4px;
        }
        @media (max-width: 420px) {
          .dex404-screen { min-height: 340px; }
          .dex404-device { border-radius: 23px; padding: 9px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .dex404-return { transition: none; }
        }
      `}</style>

      <section className="dex404-content" aria-labelledby="dex404-title">
        <div className="dex404-device">
          <div className="dex404-device-top" aria-hidden="true">
            <span className="dex404-lens" />
            <span className="dex404-brand">ADIBDEX</span>
            <span className="dex404-lights"><i /><i /><i /></span>
          </div>

          <div className="dex404-screen">
            <p className="dex404-code">404</p>
            <svg className="dex404-face" viewBox="0 0 160 160" role="img" aria-label={localized('Carinha triste com olhos em X', 'Sad face with X eyes')}>
              <circle cx="80" cy="80" r="68" fill="#d9eff8" fillOpacity=".52" stroke="#39708f" strokeOpacity=".38" strokeWidth="3" />
              <path d="m43 52 22 22m0-22L43 74M95 52l22 22m0-22L95 74" fill="none" stroke="#102a46" strokeWidth="9" strokeLinecap="round" />
              <path d="M53 111 Q80 82 107 111" fill="none" stroke="#102a46" strokeWidth="8" strokeLinecap="round" />
              <path d="M57 126 Q80 137 103 126" fill="none" stroke="#39708f" strokeOpacity=".55" strokeWidth="4" strokeLinecap="round" />
            </svg>
            <h1 id="dex404-title" className="dex404-screen-title">
              {localized('Página não encontrada', 'Page not found')}
            </h1>
            <p className="dex404-screen-copy">
              {localized('Esse caminho não aparece nesta Pokédex.', 'This path is not listed in this Pokédex.')}
            </p>
          </div>

          <div className="dex404-device-bottom" aria-hidden="true">
            <span className="dex404-control" />
            <span className="dex404-control dex404-control--wide" />
            <span className="dex404-control" />
          </div>
        </div>

        <a href="/" className="dex404-return">
          {localized('Voltar ao início', 'Return to home')}
        </a>
      </section>
    </main>
  );
};

export default NotFound;
