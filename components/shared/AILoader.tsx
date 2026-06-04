// components/shared/AILoader.tsx
export default function AILoader() {
  return (
    <>
      <style>{`
        .fs-loader-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 180px;
          height: 180px;
          font-family: "Inter", sans-serif;
          font-size: 1.2em;
          font-weight: 300;
          color: white;
          border-radius: 50%;
          background-color: transparent;
          user-select: none;
        }
        .fs-loader {
          position: absolute;
          top: 0; left: 0;
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 50%;
          background-color: transparent;
          animation: fs-loader-rotate 2s linear infinite;
          z-index: 0;
        }
        @keyframes fs-loader-rotate {
          0% {
            transform: rotate(90deg);
            box-shadow:
              0 10px 20px 0 #fff inset,
              0 20px 30px 0 #ad5fff inset,
              0 60px 60px 0 #471eec inset;
          }
          50% {
            transform: rotate(270deg);
            box-shadow:
              0 10px 20px 0 #fff inset,
              0 20px 10px 0 #d60a47 inset,
              0 40px 60px 0 #311e80 inset;
          }
          100% {
            transform: rotate(450deg);
            box-shadow:
              0 10px 20px 0 #fff inset,
              0 20px 30px 0 #ad5fff inset,
              0 60px 60px 0 #471eec inset;
          }
        }
        .fs-loader-letter {
          display: inline-block;
          opacity: 0.4;
          transform: translateY(0);
          animation: fs-loader-letter-anim 2s infinite;
          z-index: 1;
          border-radius: 50ch;
          border: none;
        }
        .fs-loader-letter:nth-child(1)  { animation-delay: 0s;   }
        .fs-loader-letter:nth-child(2)  { animation-delay: 0.1s; }
        .fs-loader-letter:nth-child(3)  { animation-delay: 0.2s; }
        .fs-loader-letter:nth-child(4)  { animation-delay: 0.3s; }
        .fs-loader-letter:nth-child(5)  { animation-delay: 0.4s; }
        .fs-loader-letter:nth-child(6)  { animation-delay: 0.5s; }
        .fs-loader-letter:nth-child(7)  { animation-delay: 0.6s; }
        .fs-loader-letter:nth-child(8)  { animation-delay: 0.7s; }
        .fs-loader-letter:nth-child(9)  { animation-delay: 0.8s; }
        .fs-loader-letter:nth-child(10) { animation-delay: 0.9s; }
        @keyframes fs-loader-letter-anim {
          0%,  100% { opacity: 0.4; transform: translateY(0);    }
          20%        { opacity: 1;   transform: scale(1.15);      }
          40%        { opacity: 0.7; transform: translateY(0);    }
        }
      `}</style>

      <div className="fs-loader-wrapper">
        <span className="fs-loader-letter">G</span>
        <span className="fs-loader-letter">e</span>
        <span className="fs-loader-letter">n</span>
        <span className="fs-loader-letter">e</span>
        <span className="fs-loader-letter">r</span>
        <span className="fs-loader-letter">a</span>
        <span className="fs-loader-letter">t</span>
        <span className="fs-loader-letter">i</span>
        <span className="fs-loader-letter">n</span>
        <span className="fs-loader-letter">g</span>
        <div className="fs-loader" />
      </div>
    </>
  )
}
