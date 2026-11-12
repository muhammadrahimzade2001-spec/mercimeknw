const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, StringSelectMenuBuilder } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
    partials: [Partials.Channel]
});

// --- SUNUCU BİLGİLERİ ---
const SUNUCU_IP = "play.mercimeknw.com.tr";
const SUNUCU_SURUM = "1.20.1x";
const SUNUCU_MOD = "BoxPvP";

// --- TICKET KATEGORİLERİ ---
const TICKET_KATEGORILERI = [
    { label: 'Genel Destek', value: 'genel', emoji: '❓', desc: 'Genel sorularınız için.' },
    { label: 'Yetkili Şikayet', value: 'yetkili_sikayet', emoji: '👮', desc: 'Yetkililer hakkında şikayet.' },
    { label: 'Oyuncu Şikayet', value: 'oyuncu_sikayet', emoji: '😡', desc: 'Kural bozan oyuncuları bildir.' },
    { label: 'Hile Bildirimi', value: 'hile', emoji: '🚫', desc: 'Hile kullananları raporla.' },
    { label: 'İade Talebi', value: 'iade', emoji: '💸', desc: 'Kayıp eşya/donate iadesi.' },
    { label: 'Ban İtiraz', value: 'ban_itiraz', emoji: '🔨', desc: 'Yasaklamanız için itiraz.' },
    { label: 'Yetkili Başvuru', value: 'yetkili_basvuru', emoji: '📝', desc: 'Ekibe katılmak için başvur.' },
    { label: 'Donate', value: 'donate', emoji: '💎', desc: 'Donate satın alma ve sorunları.' },
];

// --- YARDIMCI: Ticket kanalı mı? ---
function ticketMi(channel) {
    return channel.name.startsWith('ticket-');
}

// --- YARDIMCI: Yetkili mi? (ManageChannels) ---
function yetkiliMi(member) {
    return member.permissions.has(PermissionFlagsBits.ManageChannels);
}

client.once('ready', () => {
    console.log(`[MercimekNW] ${client.user.tag} olarak giriş yapıldı!`);
    client.user.setActivity(`${SUNUCU_IP} | ${SUNUCU_MOD}`, { type: 'PLAYING' });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand() && !interaction.isButton() && !interaction.isStringSelectMenu()) return;

    // ========== SLASH KOMUTLAR ==========
    if (interaction.isChatInputCommand()) {
        const { commandName } = interaction;

        // --- /destek-oluştur (sadece kurucu) ---
        if (commandName === 'destek-oluştur') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: 'Bu komutu sadece kurucular kullanabilir kanka.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle('🎫 MercimekNW Destek Sistemi')
                .setDescription(`Aşağıdaki menüden **destek talebi** kategorini seçerek yeni bir ticket açabilirsin.\n\n**Sunucu Bilgileri:**\n📡 IP: \`${SUNUCU_IP}\`\n🎮 Sürüm: \`${SUNUCU_SURUM}\`\n⚔️ Mod: \`${SUNUCU_MOD}\``)
                .setColor('#FFA500')
                .setFooter({ text: 'MercimekNW', iconURL: client.user.displayAvatarURL() });

            const menu = new StringSelectMenuBuilder()
                .setCustomId('ticket_menu')
                .setPlaceholder('Destek talebi kategorisi seçin...')
                .addOptions(TICKET_KATEGORILERI.map(k => ({
                    label: k.label,
                    value: k.value,
                    emoji: k.emoji,
                    description: k.desc
                })));

            const row = new ActionRowBuilder().addComponents(menu);
            await interaction.channel.send({ embeds: [embed], components: [row] });
            return interaction.reply({ content: 'Destek paneli başarıyla gönderildi.', ephemeral: true });
        }

        // --- /ip ---
        if (commandName === 'ip') {
            const embed = new EmbedBuilder()
                .setTitle('📡 MercimekNW Sunucu Bilgileri')
                .addFields(
                    { name: 'IP', value: `\`${SUNUCU_IP}\``, inline: true },
                    { name: 'Sürüm', value: `\`${SUNUCU_SURUM}\``, inline: true },
                    { name: 'Mod', value: `\`${SUNUCU_MOD}\``, inline: true }
                )
                .setColor('#FFA500')
                .setFooter({ text: 'MercimekNW', iconURL: client.user.displayAvatarURL() });
            return interaction.reply({ embeds: [embed] });
        }

        // --- /yardim ---
        if (commandName === 'yardim') {
            const embed = new EmbedBuilder()
                .setTitle('📖 MercimekNW Komut Listesi')
                .setDescription(
                    '**Kurucu Komutları:**\n' +
                    '`/destek-oluştur` — Destek panelini gönderir\n\n' +
                    '**Kanal Komutları (yetkililer — tüm kanallar):**\n' +
                    '`/sil [adet]` — Mesajları siler (belirtilmezse 100)\n' +
                    '`/kilitle` — Bulunduğun kanalı kilitler\n' +
                    '`/ac` — Bulunduğun kanalın kilidini açar\n\n' +
                    '**Ticket Komutları (yetkililer — sadece ticket kanalları):**\n' +
                    '`/ekle @kullanıcı` — Ticket\'a kullanıcı ekler\n' +
                    '`/cikar @kullanıcı` — Ticket\'tan kullanıcı çıkarır\n\n' +
                    '**Genel:**\n' +
                    '`/ip` — Sunucu bilgilerini gösterir\n' +
                    '`/yardim` — Bu listeyi gösterir'
                )
                .setColor('#2ECC71')
                .setFooter({ text: 'MercimekNW', iconURL: client.user.displayAvatarURL() });
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // --- /sil (tüm kanallar, yetkili) ---
        if (commandName === 'sil') {
            if (!yetkiliMi(interaction.member)) {
                return interaction.reply({ content: 'Bu komutu kullanmak için yetkili olmalısın.', ephemeral: true });
            }
            const adet = interaction.options.getInteger('adet') ?? 100;
            if (adet < 1 || adet > 100) {
                return interaction.reply({ content: 'Adet 1 ile 100 arasında olmalı.', ephemeral: true });
            }
            try {
                const silinen = await interaction.channel.bulkDelete(adet, true);
                return interaction.reply({ content: `🧹 ${silinen.size} mesaj silindi.`, ephemeral: true });
            } catch (e) {
                return interaction.reply({ content: 'Mesajlar silinirken hata oluştu (14 günden eski mesajlar silinemez).', ephemeral: true });
            }
        }

        // --- /kilitle (tüm kanallar, yetkili) ---
        if (commandName === 'kilitle') {
            if (!yetkiliMi(interaction.member)) {
                return interaction.reply({ content: 'Bu komutu kullanmak için yetkili olmalısın.', ephemeral: true });
            }
            try {
                await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false });
                return interaction.reply({ content: '🔒 Kanal kilitlendi. Sadece yetkililer mesaj gönderebilir.' });
            } catch (e) {
                return interaction.reply({ content: 'Kilitleme sırasında hata oluştu.', ephemeral: true });
            }
        }

        // --- /ac (tüm kanallar, yetkili) ---
        if (commandName === 'ac') {
            if (!yetkiliMi(interaction.member)) {
                return interaction.reply({ content: 'Bu komutu kullanmak için yetkili olmalısın.', ephemeral: true });
            }
            try {
                await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: null });
                return interaction.reply({ content: '🔓 Kanal kilidi açıldı.' });
            } catch (e) {
                return interaction.reply({ content: 'Açma sırasında hata oluştu.', ephemeral: true });
            }
        }

        // --- /ekle (sadece ticket, yetkili) ---
        if (commandName === 'ekle') {
            if (!ticketMi(interaction.channel)) {
                return interaction.reply({ content: 'Bu komut sadece ticket kanallarında kullanılabilir.', ephemeral: true });
            }
            if (!yetkiliMi(interaction.member)) {
                return interaction.reply({ content: 'Bu komutu kullanmak için yetkili olmalısın.', ephemeral: true });
            }
            const kullanici = interaction.options.getUser('kullanıcı');
            try {
                await interaction.channel.permissionOverwrites.edit(kullanici.id, {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true
                });
                return interaction.reply({ content: `✅ ${kullanici} ticket'a eklendi.` });
            } catch (e) {
                return interaction.reply({ content: 'Ekleme sırasında hata oluştu.', ephemeral: true });
            }
        }

        // --- /cikar (sadece ticket, yetkili) ---
        if (commandName === 'cikar') {
            if (!ticketMi(interaction.channel)) {
                return interaction.reply({ content: 'Bu komut sadece ticket kanallarında kullanılabilir.', ephemeral: true });
            }
            if (!yetkiliMi(interaction.member)) {
                return interaction.reply({ content: 'Bu komutu kullanmak için yetkili olmalısın.', ephemeral: true });
            }
            const kullanici = interaction.options.getUser('kullanıcı');
            try {
                await interaction.channel.permissionOverwrites.delete(kullanici.id);
                return interaction.reply({ content: `✅ ${kullanici} ticket'tan çıkarıldı.` });
            } catch (e) {
                return interaction.reply({ content: 'Çıkarma sırasında hata oluştu.', ephemeral: true });
            }
        }
    }

    // ========== TICKET OLUŞTURMA (Menü) ==========
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_menu') {
        const secilen = interaction.values[0];
        const kategori = TICKET_KATEGORILERI.find(k => k.value === secilen);

        const mevcutKanal = interaction.guild.channels.cache.find(c =>
            c.name === `ticket-${interaction.user.username.toLowerCase()}` && c.parentId === interaction.channel.parentId
        );

        if (mevcutKanal) {
            return interaction.reply({ content: `Zaten açık bir ticketin var: <#${mevcutKanal.id}>`, ephemeral: true });
        }

        try {
            const ticketKanal = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: interaction.channel.parentId,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                    // Yetkili rol ID'sini buraya yaz:
                    // { id: 'YETKILI_ROL_ID', allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                ],
            });

            const ticketEmbed = new EmbedBuilder()
                .setTitle(`${kategori.emoji} ${kategori.label}`)
                .setDescription(`Merhaba ${interaction.user}, destek talebin oluşturuldu.\nLütfen sorununu detaylıca anlat. Yetkililer en kısa sürede ilgilenecek.`)
                .setColor('#2ECC71')
                .setTimestamp();

            const butonlar = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('ticket_kapat').setLabel('Talebi Kapat').setEmoji('🔒').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('ticket_kilitle').setLabel('Kilitle').setEmoji('🔐').setStyle(ButtonStyle.Secondary)
            );

            await ticketKanal.send({ content: `<@${interaction.user.id}>`, embeds: [ticketEmbed], components: [butonlar] });
            await interaction.reply({ content: `Destek talebin oluşturuldu: <#${ticketKanal.id}>`, ephemeral: true });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Ticket oluşturulurken bir hata oluştu.', ephemeral: true });
        }
    }

    // ========== BUTONLAR ==========
    if (interaction.isButton()) {
        // Kapat butonu
        if (interaction.customId === 'ticket_kapat') {
            if (!yetkiliMi(interaction.member) && interaction.channel.name !== `ticket-${interaction.user.username}`) {
                return interaction.reply({ content: 'Bu ticketi kapatma yetkin yok.', ephemeral: true });
            }
            await interaction.reply({ content: '🔒 Ticket 5 saniye içinde kapatılıyor...' });
            setTimeout(async () => {
                try { await interaction.channel.delete(); } catch (e) { console.log('Kanal silinemedi.'); }
            }, 5000);
        }

        // Kilitle butonu
        if (interaction.customId === 'ticket_kilitle') {
            if (!yetkiliMi(interaction.member)) {
                return interaction.reply({ content: 'Bu butonu kullanma yetkin yok.', ephemeral: true });
            }
            try {
                await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false });
                await interaction.reply({ content: '🔐 Ticket kanalı kilitlendi.' });
            } catch (e) {
                await interaction.reply({ content: 'Kilitleme sırasında hata oluştu.', ephemeral: true });
            }
        }
    }
});

// ========== KOMUT KAYIT ==========
client.on('ready', async () => {
    const commands = [
        { name: 'destek-oluştur', description: 'MercimekNW destek panelini gönderir (sadece kurucular).' },
        { name: 'ip', description: 'MercimekNW sunucu bilgilerini gösterir.' },
        { name: 'yardim', description: 'Komut listesini gösterir.' },
        {
            name: 'sil',
            description: 'Kanaldaki mesajları siler.',
            options: [{ name: 'adet', description: 'Silinecek mesaj sayısı (1-100, varsayılan 100)', type: 4, required: false }]
        },
        { name: 'kilitle', description: 'Bulunduğun kanalı kilitler.' },
        { name: 'ac', description: 'Bulunduğun kanalın kilidini açar.' },
        {
            name: 'ekle',
            description: 'Ticket kanalına kullanıcı ekler.',
            options: [{ name: 'kullanıcı', description: 'Eklenecek kullanıcı', type: 6, required: true }]
        },
        {
            name: 'cikar',
            description: 'Ticket kanalından kullanıcı çıkarır.',
            options: [{ name: 'kullanıcı', description: 'Çıkarılacak kullanıcı', type: 6, required: true }]
        }
    ];

    try {
        await client.application.commands.set(commands);
        console.log('Slash komutlar yüklendi.');
    } catch (error) {
        console.error('Komut yüklenirken hata:', error);
    }
});

client.login(process.env.TOKEN);
