import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { pool } from '../db.js';

async function getStaffRoleId(guildId) {
  const [rows] = await pool.query('SELECT staff_role_id FROM Config WHERE guild_id = ?', [guildId]);
  return rows.length ? rows[0].staff_role_id : null;
}

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

function hasStaffRole(member, staffRoleId) {
  return staffRoleId && member.roles.cache.has(staffRoleId);
}

// Vérification de l'URL
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export default {
  data: new SlashCommandBuilder()
    .setName('tampon')
    .setDescription("Ajouter un tampon à la carte d’un joueur (max 10)")
    .addUserOption(opt => opt.setName('membre').setDescription('Le joueur à tamponner').setRequired(true)),
  async execute(interaction) {
    const guildId = interaction.guildId;
    const staffRoleId = await getStaffRoleId(guildId);
    if (!staffRoleId || !hasStaffRole(interaction.member, staffRoleId)) {
      return interaction.reply({ content: "🚫 Tu n'as pas l'autorisation d'utiliser cette commande.", ephemeral: true });
    }
    const membreUser = interaction.options.getUser('membre');
    // On récupère le GuildMember pour avoir le displayName
    const membreMember = await interaction.guild.members.fetch(membreUser.id);

    const [rows] = await pool.query('SELECT tampons FROM Players WHERE guild_id = ? AND user_id = ?', [guildId, membreUser.id]);
    let tampons = rows.length ? rows[0].tampons : 0;

    if (tampons >= 10) {
      return interaction.reply({ content: `⚠️ La carte de <@${membreUser.id}> est déjà pleine (10/10).`, ephemeral: true });
    }

    tampons += 1;
    if (rows.length) {
      await pool.query('UPDATE Players SET tampons = ? WHERE guild_id = ? AND user_id = ?', [tampons, guildId, membreUser.id]);
    } else {
      await pool.query('INSERT INTO Players (guild_id, user_id, tampons) VALUES (?, ?, ?)', [guildId, membreUser.id, tampons]);
    }

    const barre = "🟦".repeat(tampons) + "⬜".repeat(10 - tampons);

    const config = await getConfig(guildId);

    const embed = new EmbedBuilder()
      .setTitle(config.embed_title)
      .setDescription(`${barre}\n**${tampons}/10 tampons**\n\n${config.embed_message}`)
      .setColor(config.embed_color)
      .setAuthor({ name: membreMember.displayName, iconURL: membreUser.displayAvatarURL() })
      .setFooter({ text: config.embed_footer });

    // Ajout de l'image seulement si l'URL est valide
    if (config.embed_image && isValidUrl(config.embed_image)) {
      embed.setImage(config.embed_image);
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};