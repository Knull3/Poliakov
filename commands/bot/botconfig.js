const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');

// Fonction pour gérer la configuration en JSON
const CONFIG_PATH = './data/bot_config.json';

function getBotConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify({}, null, 2));
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

function setBotConfig(botId, key, value) {
  const config = getBotConfig();
  if (!config[botId]) config[botId] = {};
  config[botId][key] = value;
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

function getBotConfigValue(botId, key) {
  const config = getBotConfig();
  return config[botId]?.[key];
}

function status(statut) {
  if (statut === "dnd") return `🔴`;
  if (statut === "idle") return `🟠`;
  if (statut === "online") return `🟢`;
  if (statut === "invisible") return `⚫`;
  return `❌`;
}

function secur(antijoinbot) {
  if (antijoinbot === null || antijoinbot === false) return `❌`;
  if (antijoinbot === true) return `✅`;
  return `❌`;
}

const activity = {
    'PLAYING': 'Joue à',
    'STREAMING': 'Streame',
    'LISTENING': 'Écoute',
    'WATCHING': 'Regarde',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botconfig')
    .setDescription('Configuration du bot'),

  async execute(interaction, client) {
    if (!client.config.owner.includes(interaction.user.id)) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#8B0000')
        .setTitle('❌ Permission refusée')
        .setDescription('Seuls les propriétaires du bot peuvent utiliser cette commande.')
        .setTimestamp();
      
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('Configuration Bot')
      .setFooter({ text: client.config.name })
      .setTimestamp()
      .setColor('#8B0000')
      .setDescription(`
**1・Changer le nom d'utilisateur**
Actuel: \`${client.user.username}\`

**2・Changer l'avatar**
Actuel: [\`Clique ici\`](${client.user.displayAvatarURL()})

**3・Changer l'activité**
Actuel: \`${client.user.presence.activities[0] ? `${activity[client.user.presence.activities[0].type]} ${client.user.presence.activities[0].name}` : `❌`}\`  

**4・Changer la présence du bot**
Actuel: ${status(client.user.presence.status)}

**5・Sécurité invite**
Actuel: ${secur(getBotConfigValue(client.user.id, 'antijoinbot'))}
`);

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('config_username')
          .setLabel('1️⃣ Nom')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('config_avatar')
          .setLabel('2️⃣ Avatar')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('config_activity')
          .setLabel('3️⃣ Activité')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('config_status')
          .setLabel('4️⃣ Statut')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('config_security')
          .setLabel('5️⃣ Sécurité')
          .setStyle(ButtonStyle.Secondary)
      );

    const response = await interaction.reply({
      embeds: [embed],
      components: [row]
    });
    
    // Récupérer le message de réponse
    const replyMessage = await interaction.fetchReply();

    const collector = replyMessage.createMessageComponentCollector({ time: 300000 });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: '❌ Vous ne pouvez pas utiliser ces boutons.', ephemeral: true });
      }

      await i.deferUpdate();

      if (i.customId === 'config_username') {
        const modal = new ModalBuilder()
          .setCustomId('username_modal')
          .setTitle('Changer le nom du bot');

        const usernameInput = new TextInputBuilder()
          .setCustomId('username_input')
          .setLabel('Nouveau nom')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(32);

        const firstActionRow = new ActionRowBuilder().addComponents(usernameInput);
        modal.addComponents(firstActionRow);

        await i.showModal(modal);

      } else if (i.customId === 'config_avatar') {
        const modal = new ModalBuilder()
          .setCustomId('avatar_modal')
          .setTitle('Changer l\'avatar du bot');

        const avatarInput = new TextInputBuilder()
          .setCustomId('avatar_input')
          .setLabel('URL de l\'avatar')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setPlaceholder('https://example.com/avatar.png');

        const firstActionRow = new ActionRowBuilder().addComponents(avatarInput);
        modal.addComponents(firstActionRow);

        await i.showModal(modal);

      } else if (i.customId === 'config_activity') {
        const modal = new ModalBuilder()
          .setCustomId('activity_modal')
          .setTitle('Changer l\'activité du bot');

        const typeInput = new TextInputBuilder()
          .setCustomId('activity_type')
          .setLabel('Type (play/stream/watch/listen)')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setPlaceholder('play');

        const nameInput = new TextInputBuilder()
          .setCustomId('activity_name')
          .setLabel('Nom de l\'activité')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setPlaceholder('VScode');

        const firstActionRow = new ActionRowBuilder().addComponents(typeInput);
        const secondActionRow = new ActionRowBuilder().addComponents(nameInput);
        modal.addComponents(firstActionRow, secondActionRow);

        await i.showModal(modal);

      } else if (i.customId === 'config_status') {
        const modal = new ModalBuilder()
          .setCustomId('status_modal')
          .setTitle('Changer le statut du bot');

        const statusInput = new TextInputBuilder()
          .setCustomId('status_input')
          .setLabel('Statut (online/idle/dnd/invisible)')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setPlaceholder('dnd');

        const firstActionRow = new ActionRowBuilder().addComponents(statusInput);
        modal.addComponents(firstActionRow);

        await i.showModal(modal);

      } else if (i.customId === 'config_security') {
        const currentSecurity = getBotConfigValue(client.user.id, 'antijoinbot');
        setBotConfig(client.user.id, 'antijoinbot', !currentSecurity);
        
        const newEmbed = new EmbedBuilder()
          .setTitle('Configuration Bot')
          .setFooter({ text: client.config.name })
          .setTimestamp()
          .setColor('#8B0000')
          .setDescription(`
**1・Changer le nom d'utilisateur**
Actuel: \`${client.user.username}\`

**2・Changer l'avatar**
Actuel: [\`Clique ici\`](${client.user.displayAvatarURL()})

**3・Changer l'activité**
Actuel: \`${client.user.presence.activities[0] ? `${activity[client.user.presence.activities[0].type]} ${client.user.presence.activities[0].name}` : `❌`}\`  

**4・Changer la présence du bot**
Actuel: ${status(client.user.presence.status)}

**5・Sécurité invite**
Actuel: ${secur(getBotConfigValue(client.user.id, 'antijoinbot'))}
`);

        await i.editReply({ embeds: [newEmbed] });
      }
    });

    collector.on('end', () => {
      const disabledRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('config_username')
            .setLabel('1️⃣ Nom')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('config_avatar')
            .setLabel('2️⃣ Avatar')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('config_activity')
            .setLabel('3️⃣ Activité')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('config_status')
            .setLabel('4️⃣ Statut')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('config_security')
            .setLabel('5️⃣ Sécurité')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true)
        );

      replyMessage.edit({ components: [disabledRow] }).catch(() => {});
    });
  }
};
