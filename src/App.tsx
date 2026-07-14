import { GridBoard } from "../components/GridBoard";
<<<<<<< HEAD
import Navbar from "../navbar/navbar";
=======
<<<<<<< HEAD
import Navbar from "../navbar/Navbar";
>>>>>>> 9b47e8f8e8d4348f06eb1b2364e334df9a7c3d8e

export default function App() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bg-primary)" }}>
      <Navbar />
<<<<<<< HEAD
      <main className="flex-1 flex flex-col items-center justify-center py-4 px-2 overflow-auto">
        <GridBoard />
      </main>
    </div>
=======
=======
import "./App.css";

export default function App() {
  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Pathfinding as a control room</p>
          <h1>Watch routes turn from abstract logic into a visible map.</h1>
          <p>
            This board pairs a calm editorial layout with a vivid, technical
            palette so each decision feels deliberate rather than templated.
          </p>
          <div className="hero-actions">
            <button type="button" className="primary-action">
              Run demo
            </button>
            <button type="button" className="secondary-action">
              Toggle walls
            </button>
          </div>
        </div>

        <div className="hero-meta">
          <div className="metric-card">
            <span className="metric-label">Grid</span>
            <strong>15 × 15</strong>
          </div>
          <div className="metric-card accent">
            <span className="metric-label">Focus</span>
            <strong>Shortest path</strong>
          </div>
        </div>
      </section>

>>>>>>> 2417618345bc5f1b1ce8babf71c6280d864ddcc4
      <GridBoard />
    </main>
>>>>>>> 9b47e8f8e8d4348f06eb1b2364e334df9a7c3d8e
  );
}
