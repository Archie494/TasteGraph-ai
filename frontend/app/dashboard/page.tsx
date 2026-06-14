"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

interface GraphNode {
  id: string;
  name: string;
  type: string;
  genres?: string[];
  image?: string | null;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string;
  target: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

interface Artist {
  name: string;
  genres: string[];
  popularity: number;
  image: string | null;
  spotify_url?: string;
}

interface TasteDNA {
  artists: Artist[];
  genre_breakdown: Record<string, number>;
  archetype: {
    label: string;
    description: string;
  };
  scores: {
    niche_score: number;
    diversity_score: number;
    mood_score: number;
    unique_genres: number;
  };
}

const GENRE_COLORS = [
  "#7C3AED",
  "#FF4D6D",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
];

export default function Dashboard() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [data, setData] = useState<TasteDNA | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("No Spotify token found. Please connect Spotify again.");
      setLoading(false);
      return;
    }

    async function loadDashboard() {
      try {
        const tasteResponse = await fetch(
          `http://127.0.0.1:8000/taste-dna?token=${token}`
        );

        const tasteResult = await tasteResponse.json();

        if (!tasteResponse.ok || !tasteResult.archetype || !tasteResult.scores) {
          console.error("Taste DNA backend error:", tasteResult);
          setError("Failed to load Taste DNA.");
          setLoading(false);
          return;
        }

        setData(tasteResult);

        const graphResponse = await fetch(
          `http://127.0.0.1:8000/graph-data?token=${token}`
        );

        const graphResult = await graphResponse.json();

        if (
          graphResponse.ok &&
          Array.isArray(graphResult.nodes) &&
          Array.isArray(graphResult.links)
        ) {
          setGraphData(graphResult);
        } else {
          console.error("Graph backend error:", graphResult);
        }

        setLoading(false);
      } catch (err) {
        console.error("Dashboard load error:", err);
        setError("Failed to load dashboard.");
        setLoading(false);
      }
    }

    loadDashboard();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center text-white">
        Analysing your Taste DNA...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center text-red-400">
        {error || "Something went wrong."}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0E1A] text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <p className="text-purple-300 uppercase tracking-widest text-xs mb-2">
            TasteGraph AI
          </p>

          <h1 className="text-4xl font-bold mb-2">Your Taste DNA</h1>

          <p className="text-gray-400">
            Personality-based taste analysis generated from your real Spotify
            listening history.
          </p>
        </div>

        <section className="bg-[#151C30] border border-purple-500 rounded-3xl p-8 text-center mb-6">
          <p className="text-purple-300 uppercase tracking-widest text-xs mb-3">
            Your Taste Archetype
          </p>

          <h2 className="text-4xl font-bold mb-4">
            {data.archetype.label}
          </h2>

          <p className="text-gray-400 max-w-xl mx-auto leading-relaxed mb-8">
            {data.archetype.description}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="bg-[#0A0E1A] rounded-2xl p-5">
              <p className="text-3xl font-bold text-purple-400">
                {data.scores.niche_score}
              </p>
              <p className="text-xs text-gray-400 mt-1">Niche Score</p>
            </div>

            <div className="bg-[#0A0E1A] rounded-2xl p-5">
              <p className="text-3xl font-bold text-green-400">
                {data.scores.diversity_score}
              </p>
              <p className="text-xs text-gray-400 mt-1">Diversity</p>
            </div>

            <div className="bg-[#0A0E1A] rounded-2xl p-5">
              <p className="text-3xl font-bold text-pink-400">
                {data.scores.mood_score}
              </p>
              <p className="text-xs text-gray-400 mt-1">Mood Index</p>
            </div>

            <div className="bg-[#0A0E1A] rounded-2xl p-5">
              <p className="text-3xl font-bold text-yellow-400">
                {data.scores.unique_genres}
              </p>
              <p className="text-xs text-gray-400 mt-1">Unique Genres</p>
            </div>
          </div>
        </section>

        <section className="bg-[#151C30] border border-gray-700 rounded-3xl p-6 mb-6">
          <p className="text-gray-400 uppercase tracking-widest text-xs mb-5">
            Genre DNA
          </p>

          {Object.entries(data.genre_breakdown).map(
            ([genre, percentage], index) => (
              <div key={genre} className="mb-5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="capitalize">{genre}</span>
                  <span
                    className="font-bold"
                    style={{
                      color: GENRE_COLORS[index % GENRE_COLORS.length],
                    }}
                  >
                    {percentage}%
                  </span>
                </div>

                <div className="h-2 bg-[#0A0E1A] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${percentage}%`,
                      background: GENRE_COLORS[index % GENRE_COLORS.length],
                    }}
                  />
                </div>
              </div>
            )
          )}
        </section>

        {graphData && graphData.nodes.length > 0 && (
          <section className="bg-[#151C30] border border-gray-700 rounded-3xl p-6 mb-6">
            <p className="text-gray-400 uppercase tracking-widest text-xs mb-5">
              Taste Graph
            </p>

            <div className="h-[750px] bg-[#0A0E1A] rounded-2xl overflow-hidden">
              <ForceGraph2D
                graphData={graphData}
                width={1100}
                height={750}
                cooldownTicks={150}
                nodeRelSize={8}
                d3AlphaDecay={0.02}
                d3VelocityDecay={0.25}
                linkDistance={220}
                linkWidth={1.5}
                nodeLabel={(node: any) => node.name}
                linkColor={() => "rgba(255,255,255,0.15)"}
                nodeCanvasObject={(node: any, ctx) => {
                  const label =
                    node.type === "artist"
                      ? node.name
                      : "";
                  const isArtist = node.type === "artist";
                  const radius = isArtist ? 16 : 8;

                  ctx.beginPath();
                  ctx.arc(node.x || 0, node.y || 0, radius, 0, 2 * Math.PI);
                  ctx.fillStyle = isArtist ? "#7C3AED" : "#10B981";
                  ctx.fill();

                  ctx.font = `${isArtist ? 12 : 9}px Sans-Serif`;
                  ctx.textAlign = "center";
                  ctx.textBaseline = "top";
                  ctx.fillStyle = "#ffffff";
                  ctx.fillText(label, node.x || 0, (node.y || 0) + radius + 4);
                }}
              />
            </div>
          </section>
        )}

        <section>
          <p className="text-gray-400 uppercase tracking-widest text-xs mb-5">
            Your Top Artists
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {data.artists.map((artist, index) => (
              <div
                key={`${artist.name}-${index}`}
                className="bg-[#151C30] border border-gray-700 rounded-2xl p-4 text-center"
              >
                {artist.image ? (
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-purple-900/40 flex items-center justify-center mx-auto mb-3 text-2xl">
                    🎵
                  </div>
                )}

                <h3 className="font-semibold text-sm mb-1">
                  {artist.name}
                </h3>

                <p className="text-purple-400 text-xs">
                  {artist.popularity}/100
                </p>

                {artist.genres[0] && (
                  <p className="text-gray-500 text-xs mt-1 truncate">
                    {artist.genres[0]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}