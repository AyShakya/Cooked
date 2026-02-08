import express from "express";
import fetch from "node-fetch";
import { generateRoast } from "../Services/roast.service";

const router = express.Router();

router.get("/spotify", (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    scope: "user-top-read",
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

router.get("/spotify/callback", async (req, res) => {
  try {
    const code = req.query.code;
    const tokenResponse = await fetch(
      "https://accounts.spotify.com/api/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(
              process.env.SPOTIFY_CLIENT_ID +
                ":" +
                process.env.SPOTIFY_CLIENT_SECRET,
            ).toString("base64"),
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        }),
      },
    );
    
    const token = await tokenResponse.json();
    const accessToken = token.access_token;

    const artistsRes = await fetch(
        "https://api.spotify.com/v1/me/top/artists?limit=5",
    {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    const artistsData = await artistsRes.json();
    const profile = {
      topArtists: artistsData.items.map(a => a.name),
      genres: [
        ...new Set(artistsData.items.flatMap(a => a.genres))
      ]
    };

    const roast = await generateRoast(profile);

    res.json({ roast });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Spotify roast failed" });
  }
});

export default router;