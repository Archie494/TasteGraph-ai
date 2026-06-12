const recommendations = [
  "Daniel Caesar",
  "SZA",
  "Steve Lacy",
  "Childish Gambino",
];

const genres = ["Alt-R&B", "Indie Pop", "Neo Soul", "Late Night"];

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white px-8 py-10">
      <section className="mx-auto max-w-6xl">
        <div className="mb-12">
          <p className="text-green-400 font-semibold mb-3">TasteGraph AI</p>
          <h1 className="text-6xl font-bold max-w-3xl">
            Map your music taste into an AI-powered graph.
          </h1>
          <p className="text-gray-400 mt-6 text-xl max-w-2xl">
            Enter your favorite artists and discover your taste identity,
            genre clusters, and personalized recommendations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <h2 className="text-2xl font-bold mb-4">Your Taste Input</h2>

            <input
              className="w-full bg-black border border-zinc-700 rounded-xl p-4 mb-4"
              placeholder="Frank Ocean, The Weeknd, Arctic Monkeys"
            />

            <button className="w-full bg-green-500 text-black font-bold py-4 rounded-xl hover:bg-green-400">
              Analyze My Taste
            </button>

            <div className="mt-6 flex flex-wrap gap-2">
              {genres.map((genre) => (
                <span
                  key={genre}
                  className="px-4 py-2 bg-zinc-800 rounded-full text-sm text-gray-300"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <h2 className="text-2xl font-bold mb-4">Taste Graph Preview</h2>

            <div className="relative h-72 rounded-2xl bg-black border border-zinc-800 overflow-hidden">
              <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500 text-black flex items-center justify-center font-bold">
                You
              </div>

              <div className="absolute left-16 top-12 h-20 w-20 rounded-full bg-zinc-800 flex items-center justify-center text-sm">
                R&B
              </div>

              <div className="absolute right-16 top-16 h-20 w-20 rounded-full bg-zinc-800 flex items-center justify-center text-sm">
                Indie
              </div>

              <div className="absolute left-24 bottom-12 h-20 w-20 rounded-full bg-zinc-800 flex items-center justify-center text-sm">
                Soul
              </div>

              <div className="absolute right-20 bottom-10 h-20 w-20 rounded-full bg-zinc-800 flex items-center justify-center text-sm">
                Pop
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <h2 className="text-2xl font-bold mb-4">AI Recommendations</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {recommendations.map((artist) => (
              <div
                key={artist}
                className="bg-black border border-zinc-800 rounded-2xl p-5"
              >
                <p className="text-lg font-bold">{artist}</p>
                <p className="text-sm text-gray-400 mt-2">
                  Recommended based on your alt-R&B and indie taste cluster.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}