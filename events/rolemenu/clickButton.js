const db = require("../../util/db.js");

module.exports = async (client, interaction) => {
    // Vérifier si c'est une interaction de bouton
    if (!interaction.isButton()) return;
    
    try {
        // Récupérer le membre qui a cliqué sur le bouton
        const member = interaction.member;
        
        // Vérifier si le bouton est un bouton de menu de rôle
        if (interaction.customId.startsWith("menu-")) {
            const roleId = interaction.customId.slice(5); // Enlever "menu-" du début
            const role = interaction.guild.roles.cache.get(roleId);
            
            if (role) {
                // Vérifier si le membre a déjà le rôle
                if (member.roles.cache.has(role.id)) {
                    // Retirer le rôle
                    await member.roles.remove(role);
                    await interaction.reply({ 
                        content: `Le rôle ${role.name} vous a été retiré.`, 
                        ephemeral: true 
                    });
                } else {
                    // Ajouter le rôle
                    await member.roles.add(role);
                    await interaction.reply({ 
                        content: `Le rôle ${role.name} vous a été ajouté.`, 
                        ephemeral: true 
                    });
                }
            } else {
                await interaction.reply({ 
                    content: "Ce rôle n'existe plus.", 
                    ephemeral: true 
                });
            }
        }
        
        // Vérifier s'il s'agit d'un bouton de menu de rôles multiples
        const roleMenuId = await db.get(`buttonmenu_${interaction.message.id}`);
        if (roleMenuId) {
            const roleConfig = await db.get(`rolemenu_${roleMenuId}`);
            if (roleConfig && roleConfig.roles) {
                const selectedRole = roleConfig.roles.find(r => r.id === interaction.customId);
                
                if (selectedRole) {
                    const role = interaction.guild.roles.cache.get(selectedRole.id);
                    
                    if (role) {
                        // Vérifier le type de menu (unique ou multiple)
                        const isUnique = roleConfig.type === "unique";
                        
                        if (isUnique) {
                            // Pour les menus uniques, retirer tous les autres rôles du menu
                            for (const menuRole of roleConfig.roles) {
                                const r = interaction.guild.roles.cache.get(menuRole.id);
                                if (r && member.roles.cache.has(r.id)) {
                                    await member.roles.remove(r);
                                }
                            }
                        }
                        
                        // Ajouter le rôle sélectionné
                        if (!member.roles.cache.has(role.id)) {
                            await member.roles.add(role);
                            await interaction.reply({ 
                                content: `Le rôle ${role.name} vous a été ajouté.`, 
                                ephemeral: true 
                            });
                        } else if (!isUnique) {
                            // Si ce n'est pas un menu unique, permettre de retirer le rôle
                            await member.roles.remove(role);
                            await interaction.reply({ 
                                content: `Le rôle ${role.name} vous a été retiré.`, 
                                ephemeral: true 
                            });
                        } else {
                            await interaction.reply({ 
                                content: `Vous avez déjà le rôle ${role.name}.`, 
                                ephemeral: true 
                            });
                        }
                    } else {
                        await interaction.reply({ 
                            content: "Ce rôle n'existe plus.", 
                            ephemeral: true 
                        });
                    }
                }
            }
        }
    } catch (error) {
        console.error("Erreur dans clickButton.js:", error);
        try {
            await interaction.reply({ 
                content: "Une erreur est survenue lors du traitement de cette interaction.", 
                ephemeral: true 
            }).catch(() => {});
        } catch (e) {}
    }
}; 