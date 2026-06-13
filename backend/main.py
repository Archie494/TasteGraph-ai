from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from collections import Counter
import os
import spotipy
from spotipy.oauth2 import SpotifyOAuth, SpotifyClientCredentials

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

spotify_client = spotipy.Spotify(
    auth_manager=SpotifyClientCredentials(
        client_id=os.getenv("SPOTIFY_CLIENT_ID"),
        client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
    )
)

PERSONALITY_ARCHETYPES = [
    {
        "label": "The Deep Explorer",
        "description": "You go further than most. Niche, layered, and always two steps ahead of the algorithm.",
        "conditions": lambda niche, diversity, mood: niche >= 65 and diversity >= 6,
    },
    {
        "label": "The Reflective Dreamer",
        "description": "Atmosphere over energy. You listen to feel, not just to hear.",
        "conditions": lambda niche, diversity, mood: mood >= 0.55 and niche >= 40,
    },
    {
        "label": "The Cultural Curator",
        "description": "Your taste crosses borders — genres, languages, eras. You collect sounds like artifacts.",
        "conditions": lambda niche, diversity, mood: diversity >= 8,
    },
    {
        "label": "The Experimental Wanderer",
        "description": "Patterns bore you. You follow curiosity, not charts.",
        "conditions": lambda niche, diversity, mood: niche >= 70,
    },
    {
        "label": "The Mood Chaser",
        "description": "Every playlist is a feeling. You curate emotion, not genres.",
        "conditions": lambda niche, diversity, mood: mood >= 0.6 and diversity <= 5,
    },
    {
        "label": "The Mainstream Enthusiast",
        "description": "You know what you like — and so does everyone else. There is power in that.",
        "conditions": lambda niche, diversity, mood: niche <= 30,
    },
    {
        "label": "The Genre Hopper",
        "description": "No loyalty. No ceiling. You are impossible to recommend to.",
        "conditions": lambda niche, diversity, mood: diversity >= 7 and niche < 65,
    },
    {
        "label": "The Nostalgia Seeker",
        "description": "The best music has already been made. You know where to find it.",
        "conditions": lambda niche, diversity, mood: mood >= 0.4 and niche < 50,
    },
    {
        "label": "The Romantic Idealist",
        "description": "Lyrics hit you differently. You listen for the feeling nobody else can name.",
        "conditions": lambda niche, diversity, mood: mood >= 0.5,
    },
    {
        "label": "The Story Collector",
        "description": "You will be the bridge between music and everything else. First adopter energy.",
        "conditions": lambda niche, diversity, mood: True,
    },
]

ATMOSPHERIC_KEYWORDS = [
    "dream pop",
    "ambient",
    "neo soul",
    "indie folk",
    "classical",
    "r&b",
    "soul",
    "jazz",
    "lo-fi",
    "post-rock",
    "shoegaze",
    "filmi",
    "bollywood",
    "ghazal",
    "qawwali",
    "romantic",
]

GENRE_FALLBACK = {
    "Pritam": ["bollywood", "filmi", "indian pop"],
    "Vishal-Shekhar": ["bollywood", "filmi", "indian pop"],
    "Aditya Rikhari": ["indian indie", "indian pop", "romantic"],
    "Cigarettes After Sex": ["dream pop", "ambient pop", "indie"],
    "A.R. Rahman": ["bollywood", "filmi", "classical", "soundtrack"],
    "Sachin-Jigar": ["bollywood", "filmi", "indian pop"],
    "Yo Yo Honey Singh": ["desi hip hop", "indian pop", "party"],
    "Atif Aslam": ["pakistani pop", "romantic", "bollywood"],
    "Shankar-Ehsaan-Loy": ["bollywood", "filmi", "soundtrack"],
    "Sonu Nigam": ["bollywood", "filmi", "playback singing"],
    "Mohit Chauhan": ["bollywood", "romantic", "indian pop"],
    "Arijit Singh": ["bollywood", "romantic", "filmi"],
    "Shashwat Sachdev": ["bollywood", "soundtrack", "indian pop"],
    "Vishal Mishra": ["bollywood", "romantic", "indian pop"],
    "wave to earth": ["korean indie", "indie", "dream pop"],
    "Benny Dayal": ["bollywood", "indian pop", "playback singing"],
    "Jatin-Lalit": ["bollywood", "filmi", "soundtrack"],
    "Amit Trivedi": ["bollywood", "indie", "soundtrack"],
    "Salim–Sulaiman": ["bollywood", "filmi", "soundtrack"],
    "Salim-Sulaiman": ["bollywood", "filmi", "soundtrack"],
    "Abhijeet": ["bollywood", "playback singing", "filmi"],
}


def compute_mood_score(genre_list: list[str]) -> float:
    if not genre_list:
        return 0.5

    atmospheric_count = sum(
        1
        for genre in genre_list
        if any(keyword in genre.lower() for keyword in ATMOSPHERIC_KEYWORDS)
    )

    return round(atmospheric_count / len(genre_list), 3)


def compute_diversity_count(genre_counts: dict) -> int:
    return len(genre_counts)


def get_personality_archetype(niche_score: int, diversity: int, mood: float) -> dict:
    for archetype in PERSONALITY_ARCHETYPES:
        if archetype["conditions"](niche_score, diversity, mood):
            return {
                "label": archetype["label"],
                "description": archetype["description"],
            }

    return {
        "label": "The Story Collector",
        "description": "Your taste defies every model we have.",
    }


@app.get("/")
def root():
    return {"status": "TasteGraph AI backend running"}


@app.get("/login")
def login():
    auth_url = sp_oauth.get_authorize_url()
    return {"auth_url": auth_url}


@app.get("/callback")
def callback(code: str = None, error: str = None):
    if error:
        return {
            "error": error,
            "message": "Spotify login failed. Check redirect URI and app settings.",
        }

    if not code:
        return {
            "error": "missing_code",
            "message": "No authorization code received from Spotify.",
        }

    token_info = sp_oauth.get_access_token(code)
    access_token = token_info["access_token"]

    return RedirectResponse(
        url=f"http://localhost:3000/dashboard?token={access_token}"
    )


@app.get("/top-artists")
def top_artists(token: str):
    sp = spotipy.Spotify(auth=token)
    results = sp.current_user_top_artists(limit=10, time_range="medium_term")

    artists = []

    for item in results.get("items", []):
        name = item.get("name", "")

        raw_popularity = item.get("popularity")
        popularity = raw_popularity if raw_popularity is not None else 50

        artists.append(
            {
                "name": name,
                "genres": item.get("genres") or GENRE_FALLBACK.get(name, []),
                "popularity": popularity,
                "image": item.get("images", [{}])[0].get("url")
                if item.get("images")
                else None,
                "spotify_url": item.get("external_urls", {}).get("spotify"),
            }
        )

    return {"artists": artists}


@app.get("/taste-dna")
def taste_dna(token: str):
    sp = spotipy.Spotify(auth=token)
    results = sp.current_user_top_artists(limit=20, time_range="medium_term")

    all_genres = []
    artists_data = []
    popularity_scores = []

    for item in results.get("items", []):
        name = item.get("name", "")

        genres = item.get("genres") or GENRE_FALLBACK.get(name, [])

        raw_popularity = item.get("popularity")
        popularity = raw_popularity if raw_popularity is not None else 50

        all_genres.extend(genres)
        popularity_scores.append(popularity)

        image_url = None
        if item.get("images"):
            image_url = item["images"][0].get("url")

        artists_data.append(
            {
                "name": name,
                "genres": genres,
                "popularity": popularity,
                "image": image_url,
                "spotify_url": item.get("external_urls", {}).get("spotify"),
            }
        )

    genre_counts = dict(Counter(all_genres).most_common(8))
    total = sum(genre_counts.values()) or 1

    genre_percentages = {
        genre: round((count / total) * 100)
        for genre, count in genre_counts.items()
    }

    avg_popularity = (
        sum(popularity_scores) / len(popularity_scores)
        if popularity_scores
        else 50
    )

    niche_score = round(100 - avg_popularity)

    top_genre_share = max(genre_percentages.values()) if genre_percentages else 100

    diversity_score = round(
        (len(set(all_genres)) / max(len(all_genres), 1))
        * 100
        * (1 - top_genre_share / 200)
    )

    mood_score = compute_mood_score(all_genres)
    diversity_count = compute_diversity_count(genre_counts)

    archetype = get_personality_archetype(
        niche_score=niche_score,
        diversity=diversity_count,
        mood=mood_score,
    )

    return {
        "artists": artists_data,
        "genre_breakdown": genre_percentages,
        "archetype": archetype,
        "scores": {
            "niche_score": niche_score,
            "diversity_score": min(diversity_score, 100),
            "mood_score": round(mood_score * 100),
            "unique_genres": len(set(all_genres)),
        },
    }


@app.get("/artist/{artist_name}")
def get_artist(artist_name: str):
    result = spotify_client.search(q=artist_name, type="artist", limit=1)
    items = result.get("artists", {}).get("items", [])

    if not items:
        return {"error": "Artist not found"}

    artist = items[0]
    name = artist.get("name", "")

    return {
        "name": name,
        "genres": artist.get("genres") or GENRE_FALLBACK.get(name, []),
        "spotify_url": artist.get("external_urls", {}).get("spotify"),
    }