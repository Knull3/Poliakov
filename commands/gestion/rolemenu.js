const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require('../../util/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rolemenu')
    .setDescription('Configurer un menu de rôles')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Créer un nouveau menu de rôles')
        .addStringOption(option =>
          option.setName('title')
            .setDescription('Titre du menu de rôles')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('description')
            .setDescription('Description du menu de rôles')
            .setRequired(true))
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('Salon où envoyer le menu de rôles')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('addrole')
        .setDescription('Ajouter un rôle au menu')
        .addStringOption(option =>
          option.setName('menu_id')
            .setDescription('ID du menu de rôles')
            .setRequired(true))
        .addRoleOption(option =>
          option.setName('role')
            .setDescription('Rôle à ajouter au menu')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('label')
            .setDescription('Libellé du rôle dans le menu')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('emoji')
            .setDescription('Emoji à afficher pour le rôle (optionnel)')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('removerole')
        .setDescription('Retirer un rôle du menu')
        .addStringOption(option =>
          option.setName('menu_id')
            .setDescription('ID du menu de rôles')
            .setRequired(true))
        .addRoleOption(option =>
          option.setName('role')
            .setDescription('Rôle à retirer du menu')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('Lister les menus de rôles'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('delete')
        .setDescription('Supprimer un menu de rôles')
        .addStringOption(option =>
          option.setName('menu_id')
            .setDescription('ID du menu de rôles à supprimer')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('update')
        .setDescription('Mettre à jour un menu de rôles existant')
        .addStringOption(option =>
          option.setName('menu_id')
            .setDescription('ID du menu de rôles à mettre à jour')
            .setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    
    // Clé pour stocker les menus de rôles dans la base de données
    const roleMenusKey = `rolemenus_${guildId}`;
    
    if (subcommand === 'create') {
      const title = interaction.options.getString('title');
      const description = interaction.options.getString('description');
      const channel = interaction.options.getChannel('channel');
      
      // Vérifier que le salon est un salon de texte
      if (!channel.isTextBased()) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#8B0000')
              .setTitle('❌ Erreur')
              .setDescription('Le salon doit être un salon de texte.')
              .setTimestamp()
          ],
          ephemeral: true
        });
      }
      
      // Générer un ID unique pour le menu
      const menuId = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
      
      // Créer l'embed du menu de rôles
      const menuEmbed = new EmbedBuilder()
        .setColor('#8B0000')
        .setTitle(title)
        .setDescription(description)
        .setFooter({ text: `Menu ID: ${menuId}` })
        .setTimestamp();
      
      // Créer un composant de menu vide (sera mis à jour quand des rôles seront ajoutés)
      const placeholder = "Sélectionnez un rôle";
      const row = new ActionRowBuilder()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(`rolemenu_${menuId}`)
            .setPlaceholder(placeholder)
            .addOptions([
              {
                label: 'Aucun rôle disponible',
                description: 'Ajoutez des rôles avec la commande /rolemenu addrole',
                value: 'none'
              }
            ])
            .setDisabled(true)
        );
      
      try {
        // Envoyer le message avec le menu
        const message = await channel.send({ embeds: [menuEmbed], components: [row] });
        
        // Enregistrer le menu dans la base de données
        const roleMenus = await db.get(roleMenusKey) || {};
        roleMenus[menuId] = {
          messageId: message.id,
          channelId: channel.id,
          title,
          description,
          roles: [],
          createdAt: Date.now(),
          createdBy: interaction.user.id
        };
        
        await db.set(roleMenusKey, roleMenus);
        
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#8B0000')
              .setTitle('✅ Menu de rôles créé')
              .setDescription(`Le menu de rôles a été créé avec succès dans ${channel}.\n\nUtilisez \`/rolemenu addrole menu_id:${menuId} role:@role label:Libellé\` pour ajouter des rôles.`)
              .setFooter({ text: `Menu ID: ${menuId}` })
              .setTimestamp()
          ]
        });
      } catch (error) {
        console.error(`Erreur lors de la création du menu de rôles: ${error.message}`);
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#8B0000')
              .setTitle('❌ Erreur')
              .setDescription('Une erreur est survenue lors de la création du menu de rôles.')
              .setTimestamp()
          ],
          ephemeral: true
        });
      }
    }
    
    else if (subcommand === 'addrole') {
      const menuId = interaction.options.getString('menu_id');
      const role = interaction.options.getRole('role');
      const label = interaction.options.getString('label');
      const emoji = interaction.options.getString('emoji');
      
      // Récupérer les menus de rôles
      const roleMenus = await db.get(roleMenusKey) || {};
      
      // Vérifier si le menu existe
      if (!roleMenus[menuId]) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#8B0000')
              .setTitle('❌ Erreur')
              .setDescription(`Le menu de rôles avec l'ID ${menuId} n'existe pas.`)
              .setTimestamp()
          ],
          ephemeral: true
        });
      }
      
      // Vérifier si le rôle est déjà dans le menu
      if (roleMenus[menuId].roles.some(r => r.id === role.id)) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#8B0000')
              .setTitle('❌ Erreur')
              .setDescription(`Le rôle ${role} est déjà dans le menu.`)
              .setTimestamp()
          ],
          ephemeral: true
        });
      }
      
      // Vérifier si le menu a déjà 25 rôles (limite de Discord)
      if (roleMenus[menuId].roles.length >= 25) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#8B0000')
              .setTitle('❌ Erreur')
              .setDescription('Le menu ne peut pas contenir plus de 25 rôles.')
              .setTimestamp()
          ],
          ephemeral: true
        });
      }
      
      // Ajouter le rôle au menu
      roleMenus[menuId].roles.push({
        id: role.id,
        label,
        emoji: emoji || null
      });
      
      // Sauvegarder les modifications
      await db.set(roleMenusKey, roleMenus);
      
      // Mettre à jour le message du menu
      try {
        const channel = await interaction.guild.channels.fetch(roleMenus[menuId].channelId);
        const message = await channel.messages.fetch(roleMenus[menuId].messageId);
        
        // Créer l'embed mis à jour
        const menuEmbed = new EmbedBuilder()
          .setColor('#8B0000')
          .setTitle(roleMenus[menuId].title)
          .setDescription(roleMenus[menuId].description)
          .setFooter({ text: `Menu ID: ${menuId}` })
          .setTimestamp();
        
        // Créer les options du menu
        const options = roleMenus[menuId].roles.map(r => {
          const option = {
            label: r.label,
            value: r.id,
            description: `Cliquez pour obtenir le rôle ${interaction.guild.roles.cache.get(r.id)?.name}`
          };
          
          if (r.emoji) {
            option.emoji = r.emoji;
          }
          
          return option;
        });
        
        // Créer le composant de menu
        const row = new ActionRowBuilder()
          .addComponents(
            new StringSelectMenuBuilder()
              .setCustomId(`rolemenu_${menuId}`)
              .setPlaceholder('Sélectionnez un rôle')
              .addOptions(options)
              .setMinValues(0)
              .setMaxValues(options.length)
          );
        
        // Mettre à jour le message
        await message.edit({ embeds: [menuEmbed], components: [row] });
        
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#8B0000')
              .setTitle('✅ Rôle ajouté')
              .setDescription(`Le rôle ${role} a été ajouté au menu avec le libellé "${label}".`)
              .setTimestamp()
          ]
        });
      } catch (error) {
        console.error(`Erreur lors de la mise à jour du menu de rôles: ${error.message}`);
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#8B0000')
              .setTitle('❌ Erreur')
              .setDescription('Une erreur est survenue lors de la mise à jour du menu de rôles.')
              .setTimestamp()
          ],
          ephemeral: true
        });
      }
    }
    
    else if (subcommand === 'removerole') {
      const menuId = interaction.options.getString('menu_id');
      const role = interaction.options.getRole('role');
      
      // Récupérer les menus de rôles
      const roleMenus = await db.get(roleMenusKey) || {};
      
      // Vérifier si le menu existe
      if (!roleMenus[menuId]) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#8B0000')
              .setTitle('❌ Erreur')
              .setDescription(`Le menu de rôles avec l'ID ${menuId} n'existe pas.`)
              .setTimestamp()
          ],
          ephemeral: true
        });
      }
      
      // Vérifier si le rôle est dans le menu
      const roleIndex = roleMenus[menuId].roles.findIndex(r => r.id === role.id);
      if (roleIndex === -1) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#8B0000')
              .setTitle('❌ Erreur')
              .setDescription(`Le rôle ${role} n'est pas dans le menu.`)
              .setTimestamp()
          ],
          ephemeral: true
        });
      }
      
      // Supprimer le rôle du menu
      roleMenus[menuId].roles.splice(roleIndex, 1);
      
      // Sauvegarder les modifications
      await db.set(roleMenusKey, roleMenus);
      
      // Mettre à jour le message du menu
      try {
        const channel = await interaction.guild.channels.fetch(roleMenus[menuId].channelId);
        const message = await channel.messages.fetch(roleMenus[menuId].messageId);
        
        // Créer l'embed mis à jour
        const menuEmbed = new EmbedBuilder()
          .setColor('#8B0000')
          .setTitle(roleMenus[menuId].title)
          .setDescription(roleMenus[menuId].description)
          .setFooter({ text: `Menu ID: ${menuId}` })
          .setTimestamp();
        
        // Créer les options du menu
        let row;
        if (roleMenus[menuId].roles.length === 0) {
          row = new ActionRowBuilder()
            .addComponents(
              new StringSelectMenuBuilder()
                .setCustomId(`rolemenu_${menuId}`)
                .setPlaceholder('Aucun rôle disponible')
                .addOptions([
                  {
                    label: 'Aucun rôle disponible',
                    description: 'Ajoutez des rôles avec la commande /rolemenu addrole',
                    value: 'none'
                  }
                ])
                .setDisabled(true)
            );
        } else {
          const options = roleMenus[menuId].roles.map(r => {
            const option = {
              label: r.label,
              value: r.id,
              description: `Cliquez pour obtenir le rôle ${interaction.guild.roles.cache.get(r.id)?.name}`
            };
            
            if (r.emoji) {
              option.emoji = r.emoji;
            }
            
            return option;
          });
          
          row = new ActionRowBuilder()
            .addComponents(
              new StringSelectMenuBuilder()
                .setCustomId(`rolemenu_${menuId}`)
                .setPlaceholder('Sélectionnez un rôle')
                .addOptions(options)
                .setMinValues(0)
                .setMaxValues(options.length)
            );
        }
        
        // Mettre à jour le message
        await message.edit({ embeds: [menuEmbed], components: [row] });
        
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#8B0000')
              .setTitle('✅ Rôle retiré')
              .setDescription(`Le rôle ${role} a été retiré du menu.`)
              .setTimestamp()
          ]
        });
      } catch (error) {
        console.error(`Erreur lors de la mise à jour du menu de rôles: ${error.message}`);
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#8B0000')
              .setTitle('❌ Erreur')
              .setDescription('Une erreur est survenue lors de la mise à jour du menu de rôles.')
              .setTimestamp()
          ],
          ephemeral: true
        });
      }
    }
    
    else if (subcommand === 'list') {
      // Récupérer les menus de rôles
      const roleMenus = await db.get(roleMenusKey) || {};
      
      // Vérifier s'il y a des menus
      if (Object.keys(roleMenus).length === 0) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#8B0000')
              .setTitle('📋 Menus de Rôles')
              .setDescription('Aucun menu de rôles configuré.')
              .setTimestamp()
          ]
        });
      }
      
      // Créer la liste des menus
      let menuList = '';
      for (const [id, menu] of Object.entries(roleMenus)) {
        const channel = interaction.guild.channels.cache.get(menu.channelId);
        const channelName = channel ? channel.toString() : 'Salon inconnu';
        const rolesCount = menu.roles.length;
        
        menuList += `**ID:** \`${id}\`\n`;
        menuList += `**Titre:** ${menu.title}\n`;
        menuList += `**Salon:** ${channelName}\n`;
        menuList += `**Rôles:** ${rolesCount}\n\n`;
      }
      
      const embed = new EmbedBuilder()
        .setColor('#8B0000')
        .setTitle('📋 Menus de Rôles')
        .setDescription(menuList)
        .setFooter({ text: `Total: ${Object.keys(roleMenus).length} menu(s)` })
        .setTimestamp();
      
      return interaction.reply({ embeds: [embed] });
    }
    
    else if (subcommand === 'delete') {
      const menuId = interaction.options.getString('menu_id');
      
      // Récupérer les menus de rôles
      const roleMenus = await db.get(roleMenusKey) || {};
      
      // Vérifier si le menu existe
      if (!roleMenus[menuId]) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#8B0000')
              .setTitle('❌ Erreur')
              .setDescription(`Le menu de rôles avec l'ID ${menuId} n'existe pas.`)
              .setTimestamp()
          ],
          ephemeral: true
        });
      }
      
      // Essayer de supprimer le message du menu
      try {
        const channel = await interaction.guild.channels.fetch(roleMenus[menuId].channelId);
        const message = await channel.messages.fetch(roleMenus[menuId].messageId);
        await message.delete();
      } catch (error) {
        console.error(`Erreur lors de la suppression du message du menu de rôles: ${error.message}`);
      }
      
      // Supprimer le menu de la base de données
      delete roleMenus[menuId];
      await db.set(roleMenusKey, roleMenus);
      
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#8B0000')
            .setTitle('✅ Menu supprimé')
            .setDescription(`Le menu de rôles avec l'ID ${menuId} a été supprimé.`)
            .setTimestamp()
        ]
      });
    }
    
    else if (subcommand === 'update') {
      const menuId = interaction.options.getString('menu_id');
      
      // Récupérer les menus de rôles
      const roleMenus = await db.get(roleMenusKey) || {};
      
      // Vérifier si le menu existe
      if (!roleMenus[menuId]) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#8B0000')
              .setTitle('❌ Erreur')
              .setDescription(`Le menu de rôles avec l'ID ${menuId} n'existe pas.`)
              .setTimestamp()
          ],
          ephemeral: true
        });
      }
      
      // Mettre à jour le message du menu
      try {
        const channel = await interaction.guild.channels.fetch(roleMenus[menuId].channelId);
        const message = await channel.messages.fetch(roleMenus[menuId].messageId);
        
        // Créer l'embed mis à jour
        const menuEmbed = new EmbedBuilder()
          .setColor('#8B0000')
          .setTitle(roleMenus[menuId].title)
          .setDescription(roleMenus[menuId].description)
          .setFooter({ text: `Menu ID: ${menuId}` })
          .setTimestamp();
        
        // Créer les options du menu
        let row;
        if (roleMenus[menuId].roles.length === 0) {
          row = new ActionRowBuilder()
            .addComponents(
              new StringSelectMenuBuilder()
                .setCustomId(`rolemenu_${menuId}`)
                .setPlaceholder('Aucun rôle disponible')
                .addOptions([
                  {
                    label: 'Aucun rôle disponible',
                    description: 'Ajoutez des rôles avec la commande /rolemenu addrole',
                    value: 'none'
                  }
                ])
                .setDisabled(true)
            );
        } else {
          const options = roleMenus[menuId].roles.map(r => {
            const option = {
              label: r.label,
              value: r.id,
              description: `Cliquez pour obtenir le rôle ${interaction.guild.roles.cache.get(r.id)?.name}`
            };
            
            if (r.emoji) {
              option.emoji = r.emoji;
            }
            
            return option;
          });
          
          row = new ActionRowBuilder()
            .addComponents(
              new StringSelectMenuBuilder()
                .setCustomId(`rolemenu_${menuId}`)
                .setPlaceholder('Sélectionnez un rôle')
                .addOptions(options)
                .setMinValues(0)
                .setMaxValues(options.length)
            );
        }
        
        // Mettre à jour le message
        await message.edit({ embeds: [menuEmbed], components: [row] });
        
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#8B0000')
              .setTitle('✅ Menu mis à jour')
              .setDescription(`Le menu de rôles avec l'ID ${menuId} a été mis à jour.`)
              .setTimestamp()
          ]
        });
      } catch (error) {
        console.error(`Erreur lors de la mise à jour du menu de rôles: ${error.message}`);
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#8B0000')
              .setTitle('❌ Erreur')
              .setDescription('Une erreur est survenue lors de la mise à jour du menu de rôles.')
              .setTimestamp()
          ],
          ephemeral: true
        });
      }
    }
  },
  
  // Fonction pour configurer les événements nécessaires
  setup: (client) => {
    client.on('interactionCreate', async (interaction) => {
      if (!interaction.isStringSelectMenu()) return;
      
      // Vérifier si l'interaction concerne un menu de rôles
      if (!interaction.customId.startsWith('rolemenu_')) return;
      
      // Extraire l'ID du menu
      const menuId = interaction.customId.replace('rolemenu_', '');
      
      // Récupérer les menus de rôles
      const roleMenus = await db.get(`rolemenus_${interaction.guild.id}`) || {};
      
      // Vérifier si le menu existe
      if (!roleMenus[menuId]) {
        return interaction.reply({
          content: 'Ce menu de rôles n\'existe plus.',
          ephemeral: true
        });
      }
      
      // Récupérer les rôles sélectionnés
      const selectedRoles = interaction.values;
      const member = interaction.member;
      
      // Récupérer tous les rôles du menu
      const menuRoles = roleMenus[menuId].roles.map(r => r.id);
      
      try {
        // Retirer les rôles qui ne sont plus sélectionnés
        for (const roleId of menuRoles) {
          if (!selectedRoles.includes(roleId) && member.roles.cache.has(roleId)) {
            await member.roles.remove(roleId);
          }
        }
        
        // Ajouter les rôles sélectionnés
        for (const roleId of selectedRoles) {
          if (!member.roles.cache.has(roleId)) {
            await member.roles.add(roleId);
          }
        }
        
        // Répondre à l'interaction
        return interaction.reply({
          content: 'Vos rôles ont été mis à jour.',
          ephemeral: true
        });
      } catch (error) {
        console.error(`Erreur lors de la mise à jour des rôles: ${error.message}`);
        return interaction.reply({
          content: 'Une erreur est survenue lors de la mise à jour de vos rôles.',
          ephemeral: true
        });
      }
    });
  }
};
