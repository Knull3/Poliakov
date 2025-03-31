const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ButtonPages } = require('../../util/embedButton/start.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Affiche la liste des commandes du bot.')
        .addStringOption(option => 
            option.setName('categorie')
                .setDescription("Affiche l'aide d'une catégorie spécifique (ex: 'all')")
                .setRequired(false)
        ),
    
    name: 'help',
    description: "Affiche la liste des commandes disponibles.",
    usage: "help [categorie]",
    category: "Informations",
    
    async execute(interaction, client) {
        const category = interaction.options?.getString('categorie');
        await handleHelp(interaction, client, category);
    },
    
    async run(message, args, client) {
        const category = args[0];
        await handleHelp(message, client, category);
    }
};

async function handleHelp(ctx, client, category) {
    const isInteraction = !!ctx.isChatInputCommand;
    const color = client.config.color || "#0099ff";
    const prefix = client.config.prefix || "/";

    if (category === "all") {
        const publicEmbed = new EmbedBuilder()
            .setColor(color)
            .setFooter({ text: `Prefix : ${prefix} • ${client.config.name}` })
            .setTitle("📜 Liste des commandes par permissions")
            .setDescription("**__Public__**\n- `/ping`\n- `/serverinfo`\n- `/userinfo`\n- `/help`\n... (autres commandes)")
            .setTimestamp();

        const modsEmbed = new EmbedBuilder()
            .setColor(color)
            .setTitle("🔧 Commandes Moderation")
            .setDescription("- `/mute`\n- `/warn`\n- `/unmute`\n...");
        
        const adminEmbed = new EmbedBuilder()
            .setColor(color)
            .setTitle("⚙️ Commandes Admin")
            .setDescription("- `/ban`\n- `/kick`\n- `/unban`\n...");
        
        const ownerEmbed = new EmbedBuilder()
            .setColor(color)
            .setTitle("👑 Commandes Owner")
            .setDescription("- `/lock`\n- `/unlock`\n- `/clear`\n...");
        
        const pages = [publicEmbed, modsEmbed, adminEmbed, ownerEmbed];
        ButtonPages(ctx, client, pages, 60 * 1000, "gray", "▶", "◀");
    } else {
        const generalEmbed = new EmbedBuilder()
            .setColor(color)
            .setFooter({ text: `Prefix : ${prefix} • ${client.config.name}` })
            .setTitle("📜 Aide générale")
            .setDescription(`Utilise \`/help all\` ou \`${prefix}help all\` pour voir toutes les commandes.`)
            .setTimestamp();
        
        if (isInteraction) {
            await ctx.reply({ embeds: [generalEmbed], ephemeral: true });
        } else {
            await ctx.channel.send({ embeds: [generalEmbed] });
        }
    }
}
