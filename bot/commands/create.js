import { SlashCommandBuilder } from 'discord.js';
import { pool } from '../db.js';

async function getStaffRoleId(guildId) {
  const [rows] = await pool.query('SELECT staff_role_id FROM Config WHERE guild_id = ?', [guildId]);
  return rows.length ? rows[0].staff_role_id : null;
}

function hasStaffRole(member, staffRoleId) {
  return staffRoleId && member.roles.cache.has(staffRoleId);
}

export default {
  data: new SlashCommandBuilder()
    .setName('create')
    .setDescription('Créer une carte vide pour un joueur')
    .addUserOption(opt => opt.setName('membre').setDescription('Le joueur à qui créer une carte').setRequired(true)),
  async execute(interaction) {
    const guildId = interaction.guildId;
    const staffRoleId = await getStaffRoleId(guildId);
    if (!staffRoleId || !hasStaffRole(interaction.member, staffRoleId)) {
      return interaction.reply({ content: "🚫 Tu n'as pas l'autorisation d'utiliser cette commande.", ephemeral: true });
    }
    const membre = interaction.options.getUser('membre');
    const [rows] = await pool.query('SELECT * FROM Players WHERE guild_id = ? AND user_id = ?', [guildId, membre.id]);
    if (!rows.length) {
      await pool.query('INSERT INTO Players (guild_id, user_id, tampons) VALUES (?, ?, 0)', [guildId, membre.id]);
      await interaction.reply(`✅ Carte créée pour <@${membre.id}>.`);
    } else {
      await interaction.reply(`ℹ️ <@${membre.id}> a déjà une carte.`);
    }
  }
};