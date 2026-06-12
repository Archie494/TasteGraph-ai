from fastapi import FastAPI
from dotenv import load_dotenv
import os
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

load_dotenv()

app = FastAPI()

spotify = spotipy.Spotify(
    auth_manager=SpotifyClientCredentials(
        client_id=os.getenv("SPOTIFY_CLIENT_ID"),
        client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
    )
)

genre_fallback = {
    "Drake": ["Hip-Hop", "Pop"],
    "Frank Ocean": ["Alt-R&B", "Soul"],
    "The Weeknd": ["Alt-R&B", "Pop"],
    "Arctic Monkeys": ["Indie Rock"],
    "Daniel Caesar": ["Soul", "Alt-R&B"],
}

@app.get("/")
def root():
    return {"status": "running"}

@app.get("/artist/{artist_name}")
def get_artist(artist_name: str):
    search_result = spotify.search(q=artist_name, type="artist", limit=1)
    items = search_result.get("artists", {}).get("items", [])

    if not items:
        return {"error": "artist not found"}

    artist = items[0]
    name = artist.get("name")

    return {
        "name": name,
        "genres": artist.get("genres") or genre_fallback.get(name, []),
        "spotify_url": artist.get("external_urls", {}).get("spotify"),
    }

@app.get("/analyze")
def analyze_artists(artists: str):
    artist_names = [artist.strip() for artist in artists.split(",")]

    genre_count = {}
    artist_results = []

    for artist_name in artist_names:
        search_result = spotify.search(q=artist_name, type="artist", limit=1)
        items = search_result.get("artists", {}).get("items", [])

        if not items:
            continue

        artist = items[0]
        name = artist.get("name")
        genres = artist.get("genres") or genre_fallback.get(name, [])

        artist_results.append({
            "name": name,
            "genres": genres,
            "spotify_url": artist.get("external_urls", {}).get("spotify"),
        })

        for genre in genres:
            genre_count[genre] = genre_count.get(genre, 0) + 1

    total = sum(genre_count.values())

    taste_profile = {
        genre: round((count / total) * 100)
        for genre, count in genre_count.items()
    } if total > 0 else {}

    return {
        "artists": artist_results,
        "taste_profile": taste_profile
    }