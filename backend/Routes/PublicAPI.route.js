import express from "express";
import fetch from "node-fetch";
import { generateRoast } from "../Services/roast.service.js";

const router = express.Router();

router.post("/github", async (req, res) => {
    try {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const profileRes = await fetch(`https://api.github.com/users/${username}`);
  if (!profileRes.ok) {
  return res.status(404).json({ error: "GitHub user not found" });
}
  const profileData = await profileRes.json();

  const reposRes = await fetch(
    `https://api.github.com/users/${username}/repos`,
  );
  const reposData = await reposRes.json();

  const profile = {
    bioTone: profileData.bio || "mysteriously empty",
    repoCount: reposData.length,
    languages: [...new Set(reposData.map((r) => r.language).filter(Boolean))],
    unfinishedRepos: reposData.filter((r) => !r.description).length,
  };

  const roast = await generateRoast(profile);

  res.json({ roast });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/reddit", async (req, res) => {
    try {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const userRes = await fetch(
    `https://www.reddit.com/user/${username}/about.json`,
  );
    if (!userRes.ok) {
    return res.status(404).json({ error: "Reddit user not found" });
  }
  const userData = await userRes.json();
  if (!userData?.data) {
  return res.status(404).json({ error: "Reddit user not found" });
}


  const commentsRes = await fetch(
    `https://www.reddit.com/user/${username}/comments.json?limit=100`,
  );
  const commentsData = await commentsRes.json();

  const profile = {
    karma: userData.data.total_karma,
    favoriteSubs: [
      ...new Set(commentsData.data.children.map((c) => c.data.subreddit)),
    ],
    tone: "opinionated",
  };

  const roast = await generateRoast(profile);

  res.json({ roast });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
