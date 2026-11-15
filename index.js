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
const SUNUCU_BANNER = "https://i.imgur.com/8Q5X7yG.png"; // Kendi banner'ını koyabilirsin

// --- RENKLER ---
const RENK = {
    ana: '#FFA500',
    basari: '#2ECC71',
    hata: '#E74C3C',
    bilgi: '#3498DB',
    kilit: '#9B59B6',
    kapat: '#E67E22',
    koyu: '#2C3E50'
};

// --- TICKET KATEGORİLERİ ---
const TICKET_KATEGORILERI = [
    {
        label: 'Genel Destek',
        value: 'genel',
        emoji: '❓',
        desc: 'Genel sorularınız için.',
        aciklama: 'Sunucu, oyun veya genel konularda yardım almak için buradasın. Sorununu detaylıca anlat, yetkililer en kısa sürede ilgilenecek.'
    },
    {
        label: 'Yetkili Şikayet',
        value: 'yetkili_sikayet',
        emoji: '👮',
        desc: 'Yetkililer hakkında şikayet.',
        aciklama: 'Bir yetkilinin davranışını şikayet etmek için buradasın. Lütfen yetkilinin adını, olayın ne olduğunu ve varsa kanıtları (ekran görüntüsü) paylaş.'
    },
    {
        label: 'Oyuncu Şikayet',
        value: 'oyuncu_sikayet',
        emoji: '😡',
        desc: 'Kural bozan oyuncuları bildir.',
        aciklama: 'Kural ihlali yapan bir oyuncuyu bildirmek için buradasın. Oyuncunun adını, ihlalin ne olduğunu ve varsa kanıtları paylaş.'
    },
    {
        label: 'Hile Bildirimi',
        value: 'hile',
        emoji: '🚫',
        desc: 'Hile kullananları raporla.',
        aciklama: 'Hile kullanan bir oyuncuyu bildirmek için buradasın. Oyuncunun adını, hangi hileyi kullandığını ve varsa video/ekran görüntüsü kanıtlarını paylaş.'
    },
    {
        label: 'İade Talebi',
        value: 'iade',
        emoji: '💸',
        desc: 'Kayıp eşya/donate iadesi.',
        aciklama: 'Kayıp eşya, donate veya benzeri bir iade talebin için buradasın. Ne kaybettiğini, ne zaman kaybettiğini ve varsa kanıtları paylaş.'
    },
    {
        label: 'Ban İtiraz',
        value: 'ban_itiraz',
        emoji: '🔨',
        desc: 'Yasaklamanız için itiraz.',
        aciklama: 'Bir yasaklama (ban) için itiraz etmek için buradasın. Ban sebebini, banlayan yetkiliyi ve neden itiraz ettiğini detaylıca anlat.'
    },
    {
        label: 'Yetkili Başvuru',
        value: 'yetkili_basvuru',
        emoji: '📝',
        desc: 'Ekibe katılmak için başvur.',
        aciklama: 'MercimekNW ekibine katılmak için başvuru yapıyorsun. Yaşını, oyun deneyimini, neden başvurduğunu ve ne kadar aktif olabileceğini anlat.'
    },
    {
        label: 'Donate',
        value: 'donate',
        emoji: '💎',
        desc: 'Donate satın alma ve sorunları.',
        aciklama: 'Donate satın alma, teslimat sorunu veya donate ile ilgili diğer konular için buradasın. Satın alma bilgilerini ve sorununu detaylıca anlat.'
    },
];

// --- YARDIMCI FONKSİYONLAR ---
function ticketMi(channel) {
    return channel.name.startsWith('ticket-');
}

function yetkiliMi(member) {
    return member.permissions.has(PermissionFlagsBits.ManageChannels);
}

function hataEmbed(mesaj) {
    return new EmbedBuilder()
        .setDescription(`❌ ${mesaj}`)
        .setColor(RENK.hata);
}

function basariEmbed(mesaj) {
    return new EmbedBuilder()
        .setDescription(`✅ ${mesaj}`)
        .setColor(RENK.basari);
}

function bilgiEmbed(mesaj) {
    return new EmbedBuilder()
        .setDescription(`ℹ️ ${mesaj}`)
        .setColor(RENK.bilgi);
}

// --- PANEL EMBED'İ ---
function panelEmbed() {
    return new EmbedBuilder()
        .setAuthor({ name: 'MercimekNW • Destek Merkezi', iconURL: client.user.displayAvatarURL() })
        .setTitle('🎫 Destek Talebi Oluştur')
        .setDescription(
            '**Hoş geldin!** Aşağıdaki menüden sana en uygun **destek kategorisini** seçerek yeni bir talep oluşturabilirsin.\n\n' +
            '> 📌 **Not:** Lütfen talebini açmadan önce konuyla ilgili tüm detayları ve varsa kanıtları hazırla. Yetkililerimiz en kısa sürede ilgilenecek.\n\n' +
            '**📂 Kategoriler:**\n' +
            TICKET_KATEGORILERI.map(k => `${k.emoji} **${k.label}** — ${k.desc}`).join('\n')
        )
        .addFields(
            { name: '📡 Sunucu IP', value: `\`${SUNUCU_IP}\``, inline: true },
            { name: '🎮 Sürüm', value: `\`${SUNUCU_SURUM}\``, inline: true },
            { name: '⚔️ Mod', value: `\`${SUNUCU_MOD}\``, inline: true }
        )
        .setColor(RENK.ana)
        .setImage(SUNUCU_BANNER)
        .setFooter({ text: 'MercimekNW • Destek Sistemi', iconURL: client.user.displayAvatarURL() })
        .setTimestamp();
}

// --- TICKET KARŞILAMA EMBED'İ ---
function ticketEmbed(kategori, kullanici) {
    return new EmbedBuilder()
        .setAuthor({ name: `MercimekNW • ${kategori.label}`, iconURL: client.user.displayAvatarURL() })
        .setTitle(`${kategori.emoji} Destek Talebin Oluşturuldu`)
        .setDescription(
            `Merhaba ${kullanici}, destek talebin başarıyla oluşturuldu! 🎉\n\n` +
            `**📋 Kategori:** ${kategori.emoji} ${kategori.label}\n\n` +
            `**📝 Açıklama:**\n> ${kategori.aciklama}\n\n` +
            `**⚠️ Önemli:** Lütfen talebini detaylıca anlat. Yetkililerimiz en kısa sürede ilgilenecek.`
        )
        .addFields(
            { name: '👤 Talep Sahibi', value: `<@${kullanici.id}>`, inline: true },
            { name: '📅 Oluşturulma', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
            { name: '📌 Durum', value: '🟢 Açık', inline: true }
        )
        .setColor(RENK.basari)
        .setFooter({ text: 'MercimekNW • Destek Sistemi', iconURL: client.user.displayAvatarURL() })
        .setTimestamp();
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

        // --- /destek-oluştur ---
        if (commandName === 'destek-oluştur') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ embeds: [hataEmbed('Bu komutu sadece kurucular kullanabilir.')], ephemeral: true });
            }

            const menu = new StringSelectMenuBuilder()
                .setCustomId('ticket_menu')
                .setPlaceholder('🎫 Destek talebi kategorisi seçin...')
                .addOptions(TICKET_KATEGORILERI.map(k => ({
                    label: k.label,
                    value: k.value,
                    emoji: k.emoji,
                    description: k.desc
                })));

            const row = new ActionRowBuilder().addComponents(menu);
            await interaction.channel.send({ embeds: [panelEmbed()], components: [row] });
            return interaction.reply({ embeds: [basariEmbed('Destek paneli başarıyla gönderildi.')], ephemeral: true });
        }

        // --- /ip ---
        if (commandName === 'ip') {
            const embed = new EmbedBuilder()
                .setAuthor({ name: 'MercimekNW', iconURL: client.user.displayAvatarURL() })
                .setTitle('📡 Sunucu Bilgileri')
                .setDescription('MercimekNW sunucusuna aşağıdaki bilgilerle katılabilirsin.')
                .addFields(
                    { name: '🌐 IP Adresi', value: `\`\`\`${SUNUCU_IP}\`\`\``, inline: false },
                    { name: '🎮 Sürüm', value: `\`${SUNUCU_SURUM}\``, inline: true },
                    { name: '⚔️ Mod', value: `\`${SUNUCU_MOD}\``, inline: true }
                )
                .setColor(RENK.ana)
                .setFooter({ text: 'MercimekNW', iconURL: client.user.displayAvatarURL() })
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });
        }

        // --- /yardim ---
        if (commandName === 'yardim') {
            const embed = new EmbedBuilder()
                .setAuthor({ name: 'MercimekNW', iconURL: client.user.displayAvatarURL() })
                .setTitle('📖 Komut Listesi')
                .setDescription('Aşağıda MercimekNW botunun tüm komutlarını bulabilirsin.')
                .addFields(
                    {
                        name: '👑 Kurucu Komutları',
                        value: '`/destek-oluştur` — Destek panelini gönderir',
                        inline: false
                    },
                    {
                        name: '🛠️ Kanal Komutları (Yetkili)',
                        value: '`/sil [adet]` — Mesajları siler\n`/kilitle` — Kanalı kilitler\n`/ac` — Kanal kilidini açar',
                        inline: false
                    },
                    {
                        name: '🎫 Ticket Komutları (Yetkili)',
                        value: '`/ekle @kullanıcı` — Ticket\'a kullanıcı ekler\n`/cikar @kullanıcı` — Ticket\'tan kullanıcı çıkarır',
                        inline: false
                    },
                    {
                        name: '🌐 Genel',
                        value: '`/ip` — Sunucu bilgilerini gösterir\n`/yardim` — Bu listeyi gösterir',
                        inline: false
                    }
                )
                .setColor(RENK.basari)
                .setFooter({ text: 'MercimekNW', iconURL: client.user.displayAvatarURL() })
                .setTimestamp();
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // --- /sil ---
        if (commandName === 'sil') {
            if (!yetkiliMi(interaction.member)) {
                return interaction.reply({ embeds: [hataEmbed('Bu komutu kullanmak için yetkili olmalısın.')], ephemeral: true });
            }
            const adet = interaction.options.getInteger('adet') ?? 100;
            if (adet < 1 || adet > 100) {
                return interaction.reply({ embeds: [hataEmbed('Adet 1 ile 100 arasında olmalı.')], ephemeral: true });
            }
            try {
                const silinen = await interaction.channel.bulkDelete(adet, true);
                return interaction.reply({ embeds: [basariEmbed(`${silinen.size} mesaj silindi.`)], ephemeral: true });
            } catch (e) {
                return interaction.reply({ embeds: [hataEmbed('Mesajlar silinirken hata oluştu (14 günden eski mesajlar silinemez).')], ephemeral: true });
            }
        }

        // --- /kilitle ---
        if (commandName === 'kilitle') {
            if (!yetkiliMi(interaction.member)) {
                return interaction.reply({ embeds: [hataEmbed('Bu komutu kullanmak için yetkili olmalısın.')], ephemeral: true });
            }
            try {
                await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false });
                const embed = new EmbedBuilder()
                    .setTitle('🔒 Kanal Kilitlendi')
                    .setDescription(`Bu kanal **${interaction.user.tag}** tarafından kilitlendi.\n\n> Sadece yetkililer mesaj gönderebilir.`)
                    .addFields({ name: '📅 Zaman', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false })
                    .setColor(RENK.kilit)
                    .setFooter({ text: 'MercimekNW', iconURL: client.user.displayAvatarURL() })
                    .setTimestamp();
                return interaction.reply({ embeds: [embed] });
            } catch (e) {
                return interaction.reply({ embeds: [hataEmbed('Kilitleme sırasında hata oluştu.')], ephemeral: true });
            }
        }

        // --- /ac ---
        if (commandName === 'ac') {
            if (!yetkiliMi(interaction.member)) {
                return interaction.reply({ embeds: [hataEmbed('Bu komutu kullanmak için yetkili olmalısın.')], ephemeral: true });
            }
            try {
                await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: null });
                const embed = new EmbedBuilder()
                    .setTitle('🔓 Kanal Kilidi Açıldı')
                    .setDescription(`Bu kanalın kilidi **${interaction.user.tag}** tarafından açıldı.\n\n> Artık herkes mesaj gönderebilir.`)
                    .addFields({ name: '📅 Zaman', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false })
                    .setColor(RENK.basari)
                    .setFooter({ text: 'MercimekNW', iconURL: client.user.displayAvatarURL() })
                    .setTimestamp();
                return interaction.reply({ embeds: [embed] });
            } catch (e) {
                return interaction.reply({ embeds: [hataEmbed('Açma sırasında hata oluştu.')], ephemeral: true });
            }
        }

        // --- /ekle ---
        if (commandName === 'ekle') {
            if (!ticketMi(interaction.channel)) {
                return interaction.reply({ embeds: [hataEmbed('Bu komut sadece ticket kanallarında kullanılabilir.')], ephemeral: true });
            }
            if (!yetkiliMi(interaction.member)) {
                return interaction.reply({ embeds: [hataEmbed('Bu komutu kullanmak için yetkili olmalısın.')], ephemeral: true });
            }
            const kullanici = interaction.options.getUser('kullanıcı');
            try {
                await interaction.channel.permissionOverwrites.edit(kullanici.id, {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true
                });
                return interaction.reply({ embeds: [basariEmbed(`${kullanici} ticket'a eklendi.`)] });
            } catch (e) {
                return interaction.reply({ embeds: [hataEmbed('Ekleme sırasında hata oluştu.')], ephemeral: true });
            }
        }

        // --- /cikar ---
        if (commandName === 'cikar') {
            if (!ticketMi(interaction.channel)) {
                return interaction.reply({ embeds: [hataEmbed('Bu komut sadece ticket kanallarında kullanılabilir.')], ephemeral: true });
            }
            if (!yetkiliMi(interaction.member)) {
                return interaction.reply({ embeds: [hataEmbed('Bu komutu kullanmak için yetkili olmalısın.')], ephemeral: true });
            }
            const kullanici = interaction.options.getUser('kullanıcı');
            try {
                await interaction.channel.permissionOverwrites.delete(kullanici.id);
                return interaction.reply({ embeds: [basariEmbed(`${kullanici} ticket'tan çıkarıldı.`)] });
            } catch (e) {
                return interaction.reply({ embeds: [hataEmbed('Çıkarma sırasında hata oluştu.')], ephemeral: true });
            }
        }
    }

    // ========== TICKET OLUŞTURMA ==========
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_menu') {
        const secilen = interaction.values[0];
        const kategori = TICKET_KATEGORILERI.find(k => k.value === secilen);

        const mevcutKanal = interaction.guild.channels.cache.find(c =>
            c.name === `ticket-${interaction.user.username.toLowerCase()}` && c.parentId === interaction.channel.parentId
        );

        if (mevcutKanal) {
            return interaction.reply({ embeds: [hataEmbed(`Zaten açık bir ticketin var: <#${mevcutKanal.id}>`)], ephemeral: true });
        }

        try {
            const ticketKanal = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: interaction.channel.parentId,
                topic: `MercimekNW Destek • ${kategori.label} • ${interaction.user.tag}`,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                    // Yetkili rol ID'sini buraya yaz:
                    // { id: 'YETKILI_ROL_ID', allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                ],
            });

            const butonlar = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('ticket_kapat').setLabel('Talebi Kapat').setEmoji('🔒').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('ticket_kilitle').setLabel('Kilitle').setEmoji('🔐').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('ticket_bilgi').setLabel('Bilgi').setEmoji('ℹ️').setStyle(ButtonStyle.Primary)
            );

            await ticketKanal.send({ content: `<@${interaction.user.id}>`, embeds: [ticketEmbed(kategori, interaction.user)], components: [butonlar] });
            await interaction.reply({ embeds: [basariEmbed(`Destek talebin oluşturuldu: <#${ticketKanal.id}>`)], ephemeral: true });

        } catch (error) {
            console.error(error);
            await interaction.reply({ embeds: [hataEmbed('Ticket oluşturulurken bir hata oluştu.')], ephemeral: true });
        }
    }

    // ========== BUTONLAR ==========
    if (interaction.isButton()) {
        // --- Kapat ---
        if (interaction.customId === 'ticket_kapat') {
            if (!yetkiliMi(interaction.member) && interaction.channel.name !== `ticket-${interaction.user.username}`) {
                return interaction.reply({ embeds: [hataEmbed('Bu ticketi kapatma yetkin yok.')], ephemeral: true });
            }

            const onayEmbed = new EmbedBuilder()
                .setTitle('🔒 Ticket Kapatma Onayı')
                .setDescription('Bu ticketi kapatmak istediğine emin misin?\n\n> Kapatıldıktan sonra kanal **5 saniye** içinde silinecek ve geri alınamayacak.')
                .setColor(RENK.kapat)
                .setFooter({ text: 'MercimekNW', iconURL: client.user.displayAvatarURL() })
                .setTimestamp();

            const onayButonlari = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('ticket_kapat_onay').setLabel('Evet, Kapat').setEmoji('✅').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('ticket_kapat_iptal').setLabel('İptal').setEmoji('❌').setStyle(ButtonStyle.Secondary)
            );

            return interaction.reply({ embeds: [onayEmbed], components: [onayButonlari] });
        }

        // --- Kapat onay ---
        if (interaction.customId === 'ticket_kapat_onay') {
            await interaction.update({
                embeds: [new EmbedBuilder().setDescription('🔒 Ticket kapatılıyor...').setColor(RENK.kapat)],
                components: []
            });
            setTimeout(async () => {
                try { await interaction.channel.delete(); } catch (e) { console.log('Kanal silinemedi.'); }
            }, 5000);
        }

        // --- Kapat iptal ---
        if (interaction.customId === 'ticket_kapat_iptal') {
            return interaction.update({
                embeds: [new EmbedBuilder().setDescription('❌ Kapatma işlemi iptal edildi.').setColor(RENK.bilgi)],
                components: []
            });
        }

        // --- Kilitle ---
        if (interaction.customId === 'ticket_kilitle') {
            if (!yetkiliMi(interaction.member)) {
                return interaction.reply({ embeds: [hataEmbed('Bu butonu kullanma yetkin yok.')], ephemeral: true });
            }
            try {
                await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false });
                const embed = new EmbedBuilder()
                    .setTitle('🔐 Ticket Kilitlendi')
                    .setDescription(`Bu ticket **${interaction.user.tag}** tarafından kilitlendi.\n\n> Sadece yetkililer mesaj gönderebilir.`)
                    .setColor(RENK.kilit)
                    .setFooter({ text: 'MercimekNW', iconURL: client.user.displayAvatarURL() })
                    .setTimestamp();
                await interaction.reply({ embeds: [embed] });
            } catch (e) {
                await interaction.reply({ embeds: [hataEmbed('Kilitleme sırasında hata oluştu.')], ephemeral: true });
            }
        }

        // --- Bilgi ---
        if (interaction.customId === 'ticket_bilgi') {
            const embed = new EmbedBuilder()
                .setTitle('ℹ️ Ticket Bilgileri')
                .addFields(
                    { name: '📋 Kanal', value: `<#${interaction.channel.id}>`, inline: true },
                    { name: '👤 Açan', value: `<@${interaction.channel.permissionOverwrites.cache.find(p => p.type === 1)?.id || interaction.user.id}>`, inline: true },
                    { name: '📅 Oluşturulma', value: `<t:${Math.floor(interaction.channel.createdTimestamp / 1000)}:R>`, inline: true }
                )
                .setColor(RENK.bilgi)
                .setFooter({ text: 'MercimekNW', iconURL: client.user.displayAvatarURL() })
                .setTimestamp();
            return interaction.reply({ embeds: [embed], ephemeral: true });
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
