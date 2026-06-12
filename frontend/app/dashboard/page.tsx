"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`http://127.0.0.1:8000/top-artists?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        setArtists(data.artists || []);
        setLoading(false);
      });
  }, [token]);

  if (loading) return (
    <div style={{color:"#fff",padding:"4rem",textAlign:"center",fontFamily:"sans-serif"}}>
      Loading your taste data...
    </div>
  );

  return (
    <div style={{background:"#0A0E1A",minHeight:"100vh",padding:"3rem 2rem",fontFamily:"sans-serif",color:"#fff"}}>
      <h1 style={{fontSize:"1.8rem",marginBottom:".5rem"}}>Your Taste Profile</h1>
      <p style={{color:"#8892A4",marginBottom:"2rem"}}>Based on your real Spotify listening history</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:"1rem"}}>
        {artists.map((a, i) => (
          <div key={i} style={{background:"#151C30",border:"1px solid #4A5568",borderRadius:"12px",padding:"1.25rem",textAlign:"center"}}>
            {a.image && <img src={a.image} alt={a.name} style={{width:"80px",height:"80px",borderRadius:"50%",marginBottom:".75rem",objectFit:"cover"}}/>}
            <div style={{fontWeight:600,fontSize:".95rem",marginBottom:".25rem"}}>{a.name}</div>
            <div style={{fontSize:".75rem",color:"#8892A4"}}>{a.genres.slice(0,2).join(" · ")}</div>
            <div style={{fontSize:".7rem",color:"#7C3AED",marginTop:".5rem"}}>Popularity {a.popularity}/100</div>
          </div>
        ))}
      </div>
    </div>
  );
}
async function connectSpotify() {
  const res = await fetch("http://127.0.0.1:8000/login");
  const data = await res.json();
  window.location.href = data.auth_url;
}

// In your JSX:
<button onClick={connectSpotify}>
  Connect Spotify
</button>