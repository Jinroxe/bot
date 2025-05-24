import mysql from "mysql2/promise";
import axios from "axios";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

export default async function handler(req, res) {
  const guildId = req.query.guild_id || req.body.guild_id;
  if (!guildId) return res.status(400).json({ error: "guild_id requis" });

  if (req.method === "GET") {
    if (req.query.roles) {
      try {
        const response = await axios.get(
          `https://discord.com/api/v10/guilds/${guildId}/roles`,
          { headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}` } }
        );
        return res.status(200).json(response.data);
      } catch (e) {
        return res.status(500).json([{ id: "0", name: "Erreur lors de la récupération des rôles" }]);
      }
    }
    const [rows] = await pool.query("SELECT * FROM Config WHERE guild_id = ?", [guildId]);
    if (!rows.length) {
      await pool.query("INSERT INTO Config (guild_id) VALUES (?)", [guildId]);
      return res.status(200).json({
        staff_role_id: "",
        embed_title: "Carte de fidélité",
        embed_color: "#3498DB",
        embed_image: "",
        embed_message: "Bravo pour ta fidélité !",
        embed_footer: "Rendez-vous chez Paleto Custom pour chaque service effectué."
      });
    }
    return res.status(200).json(rows[0]);
  }
  if (req.method === "POST") {
    const { staff_role_id, embed_title, embed_color, embed_image, embed_message, embed_footer, guild_id } = req.body;
    await pool.query(
      "UPDATE Config SET staff_role_id=?, embed_title=?, embed_color=?, embed_image=?, embed_message=?, embed_footer=? WHERE guild_id=?",
      [staff_role_id, embed_title, embed_color, embed_image, embed_message, embed_footer, guild_id]
    );
    return res.status(200).json({ success: true });
  }
  res.status(405).end();
}