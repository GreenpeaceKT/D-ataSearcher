const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('ボスデータ検索')
        .addStringOption(option =>
            option.setName('input')
            .setDescription('ボスの名前')
        ),
    async execute(interaction) {
        const menu = [];
        const input = interaction.options.getString('input');
        const bossFiles = fs.readdirSync('./boss/').filter(file => file.endsWith('.json'));
        let boss = bossFiles.filter(b => b.includes(input))
        if (boss.lengh > 25) {
            boss.slice(0, 25);
        }
        if (boss.lengh == 0) {
            return
        }
        boss.forEach((file) => {

            const json = fs.readFileSync(`./boss/${file}`);
            const parsed = JSON.parse(json);
            const bossName = parsed.name;
            const bossMap = parsed.map;
            menu.push({
                name: bossName,
                map: bossMap
            });
        });
        const ops = menu.map((m)=>{
            new StringSelectMenuOptionBuilder()
                .setLabel(m.name)
                .setDescription(m.map)
                .setValue(m.name)
        })

        const select = new StringSelectMenuBuilder()
            .setCustomId('starter')
            .setPlaceholder('ボス名を選んでください')
            .addOptions(ops);

        const row = new ActionRowBuilder()
            .addComponents(select);

        const response = interaction.reply({ components: [row] });
        const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000 });

        collector.on('collect', async i => {
            const selection = i.values[0];
            await i.reply(`${i.user} は ${selection}を選択した`);
        });
    },
};