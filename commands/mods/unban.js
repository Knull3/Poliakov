import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Débannir un utilisateur')
    .addStringOption(option =>
      option.setName('user_id')
        .setDescription('ID de l\'utilisateur à débannir')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Raison du débannissement')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction, client) {
    const userId = interaction.options.getString('user_id');
    const reason = interaction.options.getString('reason') || 'Aucune raison spécifiée';

    try {
      const user = await client.users.fetch(userId);
      const bans = await interaction.guild.bans.fetch();
      const ban = bans.get(userId);

      if (!ban) {
        return interaction.reply({ content: '❌ Cet utilisateur n\'est pas banni.', ephemeral: true });
      }

      await interaction.guild.members.unban(userId, `${reason} - Débanni par ${interaction.user.tag}`);

      const embed = new EmbedBuilder()
        .setColor('#8B0000')
        .setTitle('🔓 Utilisateur débanni')
        .setThumbnail(user.displayAvatarURL())
        .addFields(
          { name: '👤 Utilisateur', value: `${user.tag} (${user.id})`, inline: true },
          { name: '🛡️ Modérateur', value: `${interaction.user.tag}`, inline: true },
          { name: '📅 Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
          { name: '📝 Raison', value: reason, inline: false }
        )
        .setFooter({ text: client.config.name })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      if (error.code === 10013) {
        return interaction.reply({ content: '❌ Utilisateur introuvable.', ephemeral: true });
      }

      const errorEmbed = new EmbedBuilder()
        .setColor('#8B0000')
        .setTitle('❌ Erreur')
        .setDescription(`Impossible de débannir l'utilisateur : ${error.message}`)
        .setTimestamp();

      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
};
