from fastapi import FastAPI
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sp_oauth = SpotifyOAuth(
    client_id=os.getenv("SPOTIFY_CLIENT_ID"),
    client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
    redirect_uri="http://127.0.0.1:8000/callback",
    scope="user-top-read",
)

# Step 1: frontend calls this to get the Spotify login URL
@app.get("/login")
def login():
    auth_url = sp_oauth.get_authorize_url()
    return {"auth_url": auth_url}

# Step 2: Spotify redirects here after user logs in
@app.get("/callback")
def callback(code: str = None, error: str = None):
    if error:
        return {
            "error": error,
            "message": "Spotify login failed. Check redirect URI and app settings."
        }

    if not code:
        return {
            "error": "missing_code",
            "message": "No authorization code received from Spotify."
        }

    token_info = sp_oauth.get_access_token(code)
    access_token = token_info["access_token"]

    return RedirectResponse(
        url=f"http://localhost:3000/dashboard?token={access_token}"
    )

# Step 3: frontend calls this with the token to get top artists
@app.get("/top-artists")
def top_artists(token: str):
    sp = spotipy.Spotify(auth=token)
    results = sp.current_user_top_artists(limit=10, time_range="medium_term")
    artists = []
    for item in results["items"]:
        artists.append({
    "name": item.get("name"),
    "genres": item.get("genres", []),
    "popularity": item.get("popularity", 0),
    "image": item.get("images", [{}])[0].get("url") if item.get("images") else None,
    "spotify_url": item.get("external_urls", {}).get("spotify"),
})
    return {"artists": artists}

# Keep your existing endpoints below
@app.get("/artist/{artist_name}")
def get_artist(artist_name: str):
    sp = spotipy.Spotify(
        auth_manager=SpotifyOAuth(
            client_id=os.getenv("SPOTIFY_CLIENT_ID"),
            client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
            redirect_uri="http://127.0.0.1:8000/callback",
            scope="user-top-read",
        )
    )
    results = sp.search(q=artist_name, type="artist", limit=1)
    items = results["artists"]["items"]
    if not items:
        return {"error": "Artist not found"}
    a = items[0]
    return {
        "name": a["name"],
        "genres": a["genres"],
        "spotify_url": a["external_urls"]["spotify"],
    }