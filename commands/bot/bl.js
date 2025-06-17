import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import fs from 'fs';

// Fonction pour gérer la blacklist en JSON
const BLACKLIST_PATH = './data/blacklist.json';

function getBlacklist() {
  if (!fs.existsSync(BLACKLIST_PATH)) {
    fs.writeFileSync(BLACKLIST_PATH, JSON.stringify({}, null, 2));
  }
  return JSON.parse(fs.readFileSync(BLACKLIST_PATH, 'utf-8'));
}

function addToBlacklist(botId, userId) {
  const blacklist = getBlacklist();
  if (!blacklist[botId]) blacklist[botId] = [];
  if (!blacklist[botId].includes(userId)) {
    blacklist[botId].push(userId);
    fs.writeFileSync(BLACKLIST_PATH, JSON.stringify(blacklist, null, 2));
  }
}

function removeFromBlacklist(botId, userId) {
  const blacklist = getBlacklist();
  if (blacklist[botId]) {
    blacklist[botId] = blacklist[botId].filter(id => id !== userId);
    fs.writeFileSync(BLACKLIST_PATH, JSON.stringify(blacklist, null, 2));
  }
}

function clearBlacklist(botId) {
  const blacklist = getBlacklist();
  delete blacklist[botId];
  fs.writeFileSync(BLACKLIST_PATH, JSON.stringify(blacklist, null, 2));
}

function isBlacklisted(botId, userId) {
  const blacklist = getBlacklist();
  return blacklist[botId] && blacklist[botId].includes(userId);
}

export default {
  data: new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Gestion de la blacklist')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Ajouter un utilisateur à la blacklist')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('Utilisateur à blacklister')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Retirer un utilisateur de la blacklist')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('Utilisateur à retirer')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('clear')
        .setDescription('Vider toute la blacklist'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('Voir la liste des utilisateurs blacklistés')),

  async execute(interaction, client) {
    // Vérifier les permissions
    if (!client.config.owner.includes(interaction.user.id)) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#8B0000')
        .setTitle('❌ Permission refusée')
        .setDescription('Seuls les propriétaires du bot peuvent utiliser cette commande.')
        .setTimestamp();
      
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    const subcommand = interaction.options.getSubcommand();
    const user = interaction.options.getUser('user');

    if (subcommand === 'add') {
      if (isBlacklisted(client.user.id, user.id)) {
        return interaction.reply({ content: `❌ <@${user.id}> est déjà dans la blacklist`, ephemeral: true });
      }

      await interaction.deferReply();

      let banCount = 0;
      let errorCount = 0;

      // Bannir de tous les serveurs
      for (const guild of client.guilds.cache.values()) {
        try {
          const member = await guild.members.fetch(user.id);
          if (member && member.bannable) {
            await member.ban({ reason: 'Blacklist' });
            banCount++;
          }
        } catch (error) {
          errorCount++;
        }
      }

      addToBlacklist(client.user.id, user.id);

      const embed = new EmbedBuilder()
        .setColor('#8B0000')
        .setTitle('✅ Utilisateur blacklisté')
        .setDescription(`**${user.username}** a été ajouté à la blacklist.\nIl a été banni de **${banCount}** serveur(s)${errorCount > 0 ? `\nImpossible de bannir de **${errorCount}** serveur(s)` : ''}`)
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });

    } else if (subcommand === 'remove') {
      if (!isBlacklisted(client.user.id, user.id)) {
        return interaction.reply({ content: `❌ <@${user.id}> n'est pas dans la blacklist`, ephemeral: true });
      }

      removeFromBlacklist(client.user.id, user.id);

      const embed = new EmbedBuilder()
        .setColor('#8B0000')
        .setTitle('✅ Utilisateur retiré')
        .setDescription(`<@${user.id}> n'est plus dans la blacklist.`)
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });

    } else if (subcommand === 'clear') {
      const blacklist = getBlacklist()[client.user.id] || [];
      const count = blacklist.length;
      
      clearBlacklist(client.user.id);

      const embed = new EmbedBuilder()
        .setColor('#8B0000')
        .setTitle('✅ Blacklist vidée')
        .setDescription(`${count} ${count > 1 ? 'personnes ont été supprimées' : 'personne a été supprimée'} de la blacklist.`)
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });

    } else if (subcommand === 'list') {
      const blacklist = getBlacklist()[client.user.id] || [];
      
      if (blacklist.length === 0) {
        return interaction.reply({ content: '❌ Aucun utilisateur dans la blacklist.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor('#8B0000')
        .setTitle('📋 Liste de la blacklist')
        .setDescription(blacklist.map((userId, index) => {
          const user = client.users.cache.get(userId);
          return `${index + 1}) <@${userId}> (${user ? user.username : 'Utilisateur inconnu'})`;
        }).join('\n'))
        .setFooter({ text: `${client.config.name} • ${blacklist.length} utilisateur(s)` })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }
  }
};
