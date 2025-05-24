import axios from "axios";

export default async function handler(req, res) {
  try {
    const response = await axios.get(
      "https://discord.com/api/v10/users/@me/guilds",
      { headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}` } }
    );
    res.status(200).json(response.data);
  } catch (e) {
    res.status(500).json([]);
  }
}