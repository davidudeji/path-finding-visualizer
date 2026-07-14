import { GridBoard } from "../components/GridBoard";
import Navbar from "../navbar/navbar";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bg-primary)" }}>
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center py-4 px-2 overflow-auto">
        <GridBoard />
      </main>
    </div>
  );
}
