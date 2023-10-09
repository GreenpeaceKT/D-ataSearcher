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
        const input = interaction.options.getString('input');//入力された文字を定義
        let bossFiles = fs.readdirSync('./boss/').filter(file => file.endsWith('.json'));//配列[ボス名.json,ボス名2.json]
        //bossFilesの各要素から拡張子を取る
        bossFiles.map((file) => {
            file.replace("/(.+)(\.[^.]+$)/", "");
        });
        let boss = bossFiles.filter(b => b.includes(input));
        if (boss.length >= 26) {
            boss.slice(0, 25)//配列に26以上の要素が入ってたら後ろの要素を削除
        } else if (boss.length === 0) {//配列が空のとき
            return interaction.reply("条件が一致しませんでした。\n入力に間違いがないか確認してください。");
        }
        console.log(boss);//配列
        //jsonにあるnameとmapを取得してオブジェクトに格納
        //セレクトメニュー用
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
        console.log(menu);//配列
        //セレクトメニュー用
        let ops = menu.map((m) =>
            new StringSelectMenuOptionBuilder()
            .setLabel(m.name)
            .setDescription(m.map)
            .setValue(m.name)
        )
        console.log(ops);//配列

        const select = new StringSelectMenuBuilder()
            .setCustomId('starter')
            .setPlaceholder('ボス名を選んでください')
            .addOptions(ops);

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