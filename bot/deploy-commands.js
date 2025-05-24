import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = (await import(`./commands/${file}`)).default;
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const GUILD_ID = '1345778960667246764'; // remplace par l'ID de ton serveur de test

try {
  console.log('🔄 Déploiement des commandes slash...');
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );
  console.log('✅ Commandes synchronisées instantanément sur le serveur de test !');
} catch (error) {
  console.error(error);
}