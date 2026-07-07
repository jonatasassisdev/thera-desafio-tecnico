import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden px-10 py-8">
        <div className="mx-auto max-w-6xl animate-fade-rise">{children}</div>
      </main>
    </div>
  );
}
