import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { pool } from '../db.js';

async function getConfig(guildId) {
  const [rows] = await pool.query('SELECT * FROM Config WHERE guild_id = ?', [guildId]);
  if (!rows.length) {
    await pool.query('INSERT INTO Config (guild_id) VALUES (?)', [guildId]);
    return {
      embed_title: 'Carte de fidélité',
      embed_color: '#3498DB',
      embed_image: '',
      embed_message: 'Bravo pour ta fidélité !',
      embed_footer: 'Rendez-vous chez Paleto Custom pour chaque service effectué.'
    };
  }
  return rows[0];
}

export default {
  data: new SlashCommandBuilder()
    .setName('carte')
    .setDescription('Voir votre progression de tampons (0 à 10)'),
  async execute(interaction) {
    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    const [rows] = await pool.query('SELECT tampons FROM Players WHERE guild_id = ? AND user_id = ?', [guildId, userId]);
    const tampons = rows.length ? rows[0].tampons : 0;
    const barre = "🟦".repeat(tampons) + "⬜".repeat(10 - tampons);

    const config = await getConfig(guildId);

    const embed = new EmbedBuilder()
      .setTitle(config.embed_title)
      .setDescription(`${barre}\n**${tampons}/10 tampons**\n\n${config.embed_message}`)
      .setColor(config.embed_color)
      .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
      .setFooter({ text: config.embed_footer });

    if (config.embed_image) embed.setImage(config.embed_image);

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};