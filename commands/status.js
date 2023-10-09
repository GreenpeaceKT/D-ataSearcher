const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, ComponentType, EmbedBuilder } = require('discord.js');
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
        let bossFiles = fs.readdirSync('./boss/').filter(file => file.endsWith('.json'));
        bossFiles.map((file) => {
            file.replace("/(.+)(\.[^.]+$)/", "");
        });
        let boss = bossFiles.filter(b => b.includes(input));
        if (boss.length >= 26) {
            boss.slice(0, 25)
        } else if (boss.length === 0) {
            return interaction.reply("条件が一致しませんでした。\n入力に間違いがないか確認してください。");
        }
        console.log(boss);
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
        console.log(menu);
        let ops = menu.map((m) =>
            new StringSelectMenuOptionBuilder()
            .setLabel(m.name)
            .setDescription(m.map)
            .setValue(m.name)
        )
        console.log(ops);

        const judgeRow = (r) => {
            if (r.length >= 26) {
                return r.slice(0, 25);
            } else if (r.length !== 0) {
                return r;
            } else {
                return null;
            }
        }

        const select = new StringSelectMenuBuilder()
            .setCustomId('starter')
            .setPlaceholder('ボス名を選んでください')
            .addOptions(judgeRow(ops));

        const row = new ActionRowBuilder()
            .addComponents(select);

        const response = await interaction.reply({ components: [row] });
        const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000 });
        collector.on('collect', async i => {
            const selection = i.values[0];
            const json = fs.readFileSync(`./boss/${selection}.json`);
            const parsed = JSON.parse(json);
            const statusEmbed = new EmbedBuilder()
                .addFields(
                {
                    name: "名前",
                    value: parsed.name
                },
                {
                    name: "場所",
                    value: parsed.map
                },
                {
                    name: "HP [ Normal / Hard ]",
                    value: parsed.hp + " / " + parsed.hp * 10
                })
            await i.update({ embeds: [statusEmbed], components: [] });
        });
    },
};