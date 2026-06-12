"use client";

import { useState } from "react";

const artistData: Record<string, string[]> = {
  Drake: ["Hip-Hop", "Pop"],
  "Frank Ocean": ["Alt-R&B", "Soul"],
  "The Weeknd": ["Alt-R&B", "Pop"],
  "Arctic Monkeys": ["Indie Rock"],
  "Daniel Caesar": ["Soul", "Alt-R&B"],
};

const recommendations: Record<string, string[]> = {
  "Alt-R&B": ["Daniel Caesar", "SZA", "Brent Faiyaz"],
  Pop: ["Dua Lipa", "Harry Styles", "Olivia Rodrigo"],
  "Hip-Hop": ["J. Cole", "Kendrick Lamar", "Travis Scott"],
  Soul: ["Leon Bridges", "H.E.R.", "Erykah Badu"],
  "Indie Rock": ["The Strokes", "Tame Impala", "Cage The Elephant"],
};

export default function Home() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<Record<string, number>>({});
  const [recommendedArtists, setRecommendedArtists] = useState<string[]>([]);

  const analyzeTaste = () => {
    const artists = input.split(",").map((artist) => artist.trim());

    const genreCount: Record<string, number> = {};

    artists.forEach((artist) => {
      const genres = artistData[artist];

      if (genres) {
        genres.forEach((genre) => {
          genreCount[genre] = (genreCount[genre] || 0) + 1;
        });
      }
    });

    const recs = new Set<string>();

    Object.keys(genreCount).forEach((genre) => {
      recommendations[genre]?.forEach((artist) => recs.add(artist));
    });

    setResults(genreCount);
    setRecommendedArtists([...recs]);
  };

  const total = Object.values(results).reduce((a, b) => a + b, 0);

  return (
    <main className="min-h-screen bg-black text-white px-8 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-4">TasteGraph AI</h1>

        <p className="text-gray-400 mb-6">
          Enter a few artists and discover your taste profile.
        </p>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Drake, Frank Ocean, The Weeknd"
          className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-700"
        />

        <button
          onClick={analyzeTaste}
          className="mt-4 px-6 py-3 bg-green-500 text-black rounded-xl font-bold hover:bg-green-400"
        >
          Analyze My Taste
        </button>

        {Object.keys(results).length > 0 && (
          <div className="mt-8 bg-zinc-900 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-6">Taste Identity</h2>

            {Object.entries(results).map(([genre, count]) => {
              const percentage = Math.round((count / total) * 100);

              return (
                <div key={genre} className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span>{genre}</span>
                    <span>{percentage}%</span>
                  </div>

                  <div className="w-full bg-zinc-800 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {recommendedArtists.length > 0 && (
          <div className="mt-8 bg-zinc-900 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">Recommended Artists</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {recommendedArtists.map((artist) => (
                <div
                  key={artist}
                  className="bg-black border border-zinc-800 rounded-xl p-4"
                >
                  {artist}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}