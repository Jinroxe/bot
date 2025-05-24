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
    .setName('reset')
    .setDescription("Remettre à zéro une carte pleine (10/10)")
    .addUserOption(opt => opt.setName('membre').setDescription('Le joueur dont la carte doit être remise à zéro').setRequired(true)),
  async execute(interaction) {
    const guildId = interaction.guildId;
    const staffRoleId = await getStaffRoleId(guildId);
    if (!staffRoleId || !hasStaffRole(interaction.member, staffRoleId)) {
      return interaction.reply({ content: "🚫 Tu n'as pas l'autorisation d'utiliser cette commande.", ephemeral: true });
    }
    const membre = interaction.options.getUser('membre');
    const [rows] = await pool.query('SELECT tampons FROM Players WHERE guild_id = ? AND user_id = ?', [guildId, membre.id]);
    const tampons = rows.length ? rows[0].tampons : 0;

    if (tampons !== 10) {
      return interaction.reply({ content: `❌ La carte de <@${membre.id}> n'est pas encore pleine (${tampons}/10). Impossible de la remettre à zéro.`, ephemeral: true });
    }

    await pool.query('UPDATE Players SET tampons = 0 WHERE guild_id = ? AND user_id = ?', [guildId, membre.id]);
    await interaction.reply({ content: `♻️ La carte de <@${membre.id}> a été remise à zéro.`, ephemeral: true });
  }
};