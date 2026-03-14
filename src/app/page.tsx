export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <main className="flex max-w-2xl flex-col items-center gap-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          EcoLens
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          The true cost of what you buy — environmental, ethical, and financial —
          personalized to your life.
        </p>
      </main>
    </div>
  );
}
