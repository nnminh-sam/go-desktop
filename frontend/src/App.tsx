import { EmptyState } from "./components/ui/empty-state";

export function App() {
  return (
    <div data-testid="app-root" style={{ position: "fixed", inset: 0 }}>
      <EmptyState title="No folder open" bare tall />
    </div>
  );
}
