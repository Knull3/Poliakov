import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Rendre muet un utilisateur')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Utilisateur à rendre muet')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Raison du mute')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Aucune raison fournie';
    const embed = new EmbedBuilder()
      .setColor('#8B0000')
      .setTitle('🔇 Mute')
      .setDescription(`L'utilisateur ${user} a été rendu muet.\nRaison : ${reason}`)
      .setTimestamp();
    const duration = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'Aucune raison spécifiée';

    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      return interaction.reply({ content: '❌ Cet utilisateur n\'est pas sur ce serveur.', ephemeral: true });
    }

    if (!member.moderatable) {
      return interaction.reply({ content: '❌ Je ne peux pas rendre muet cet utilisateur.', ephemeral: true });
    }

    if (member.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.reply({ content: '❌ Vous ne pouvez pas rendre muet quelqu\'un avec un rôle supérieur ou égal au vôtre.', ephemeral: true });
    }

    // Convertir la durée en millisecondes
    const ms = require('ms');
    const durationMs = ms(duration);

    if (!durationMs || durationMs < 60000 || durationMs > 2419200000) {
      return interaction.reply({ content: '❌ Durée invalide. Utilisez un format comme 1h, 30m, 1d (min: 1m, max: 28j).', ephemeral: true });
    }

    try {
      await member.timeout(durationMs, `${reason} - Muet par ${interaction.user.tag}`);

      const embed = new EmbedBuilder()
        .setColor('#8B0000')
        .setTitle('🔇 Utilisateur rendu muet')
        .setThumbnail(user.displayAvatarURL())
        .addFields(
          { name: '👤 Utilisateur', value: `${user.tag} (${user.id})`, inline: true },
          { name: '🛡️ Modérateur', value: `${interaction.user.tag}`, inline: true },
          { name: '⏱️ Durée', value: duration, inline: true },
          { name: '📅 Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
          { name: '📝 Raison', value: reason, inline: false }
        )
        .setFooter({ text: client.config.name })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#8B0000')
        .setTitle('❌ Erreur')
        .setDescription(`Impossible de rendre muet l'utilisateur : ${error.message}`)
        .setTimestamp();

      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
};
