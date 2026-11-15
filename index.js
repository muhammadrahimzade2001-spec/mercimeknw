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

const SUNUCU_IP = "play.mercimeknw.com.tr";
const SUNUCU_SURUM = "1.20.1x";
const SUNUCU_MOD = "BoxPvP";

// SENİN VERDİĞİN GIF
const GIF_URL = "https://i.imgur.com/3LLNakg.gif"; 

// BURAYA SUNUCU ID'Nİ YAZ
const SUNUCU_ID = "123456789012345678"; 

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

function ticketMi(channel) { return channel.name.startsWith('ticket-'); }
function yetkiliMi(member) { return member.permissions.has(PermissionFlagsBits.ManageChannels); }

client.once('ready', () => {
    console.log(`[MercimekNW] ${client.user.tag} olarak giriş yapıldı!`);
    client.user.setActivity(`${SUNUCU_IP} | ${SUNUCU_MOD}`, { type: 'PLAYING' });
});

client.on('interactionCreate', async interaction => {
    try {
        if (!interaction.isChatInputCommand() && !interaction.isButton() && !interaction.isStringSelectMenu()) return;

        // ========== SLASH KOMUTLAR ==========
        if (interaction.isChatInputCommand()) {
            const { commandName } = interaction;

            // --- /destek-oluştur ---
            if (commandName === 'destek-oluştur') {
                if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                    return interaction.reply({ content: 'Kanka bu komutu sadece kurucular kullanabilir.', ephemeral: true });
                }

                const panelEmbed = new EmbedBuilder()
                    .setTitle('Mercimek Network Destek')
                    .setDescription(
                        `Bilet oluşturmadan önce aşağıdaki kuralları okuyunuz. Aşağıdaki butonlardan size uygun kategoriyi seçerek destek talebi oluşturabilirsiniz.\n\n` +
                        `**Genel Kurallar:**\n` +
                        `• Biletinizi 24 saat içerisinde kontrol etmek zorundasınız.\n` +
                        `• Yönetim üyelerine özel mesaj atmaktan kaçının.\n` +
                        `• Sorunlarınızı bilet aracılığıyla iletişim kurun.\n\n` +
                        `**Sorun Bildirimi:**\n` +
                        `• Sorunu detaylı bir şekilde açıklayın.\n` +
                        `• Gerekli bilgileri eksiksiz paylaşın.`
                    )
                    .setColor('#2b2d31') // Discord arka plan rengi, göze hoş görünür
                    .setImage(GIF_URL)   // İşte senin GIF'in burada
                    .setFooter({ text: 'Powered by MercimekNW', iconURL: client.user.displayAvatarURL() })
                    .setTimestamp();

                const menu = new StringSelectMenuBuilder()
                    .setCustomId('ticket_menu')
                    .setPlaceholder('Destek kategorisi seçin...')
                    .addOptions(TICKET_KATEGORILERI.map(k => ({
                        label: k.label, value: k.value, emoji: k.emoji, description: k.desc
                    })));

                const row = new ActionRowBuilder().addComponents(menu);
                await interaction.channel.send({ embeds: [panelEmbed], components: [row] });
                return interaction.reply({ content: 'Destek paneli başarıyla gönderildi.', ephemeral: true });
            }

            // --- /ip ---
            if (commandName === 'ip') {
                return interaction.reply({ content: `**MercimekNW Sunucu Bilgileri**\n\nIP: \`${SUNUCU_IP}\`\nSürüm: \`${SUNUCU_SURUM}\`\nMod: \`${SUNUCU_MOD}\`` });
            }

            // --- /yardim ---
            if (commandName === 'yardim') {
                return interaction.reply({ content: `**Mevcut Komutlar:**\n\n/destek-oluştur\n/ip\n/sil [adet]\n/kilitle\n/ac\n/ekle @kullanıcı\n/cikar @kullanıcı` , ephemeral: true});
            }

            // --- /sil ---
            if (commandName === 'sil') {
                if (!yetkiliMi(interaction.member)) return interaction.reply({ content: 'Bunu yapmak için yetkin yok.', ephemeral: true });
                const adet = interaction.options.getInteger('adet') ?? 100;
                const silinen = await interaction.channel.bulkDelete(adet, true);
                return interaction.reply({ content: `${silinen.size} mesajı sildim.`, ephemeral: true });
            }

            // --- /kilitle ---
            if (commandName === 'kilitle') {
                if (!yetkiliMi(interaction.member)) return interaction.reply({ content: 'Bunu yapmak için yetkin yok.', ephemeral: true });
                await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false });
                return interaction.reply({ content: `Kanalı kilitledim.` });
            }

            // --- /ac ---
            if (commandName === 'ac') {
                if (!yetkiliMi(interaction.member)) return interaction.reply({ content: 'Bunu yapmak için yetkin yok.', ephemeral: true });
                await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: null });
                return interaction.reply({ content: `Kanalın kilidini açtım.` });
            }

            // --- /ekle ---
            if (commandName === 'ekle') {
                if (!ticketMi(interaction.channel)) return interaction.reply({ content: 'Bu komut sadece bilet kanallarında çalışır.', ephemeral: true });
                if (!yetkiliMi(interaction.member)) return interaction.reply({ content: 'Bunu yapmak için yetkin yok.', ephemeral: true });
                const kullanici = interaction.options.getUser('kullanıcı');
                await interaction.channel.permissionOverwrites.edit(kullanici.id, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
                return interaction.reply({ content: `${kullanici} kişisini bilete ekledim.` });
            }

            // --- /cikar ---
            if (commandName === 'cikar') {
                if (!ticketMi(interaction.channel)) return interaction.reply({ content: 'Bu komut sadece bilet kanallarında çalışır.', ephemeral: true });
                if (!yetkiliMi(interaction.member)) return interaction.reply({ content: 'Bunu yapmak için yetkin yok.', ephemeral: true });
                const kullanici = interaction.options.getUser('kullanıcı');
                await interaction.channel.permissionOverwrites.delete(kullanici.id);
                return interaction.reply({ content: `${kullanici} kişisini biletten çıkardım.` });
            }
        }

        // ========== MENÜ SEÇİMİ (TICKET) ==========
        if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_menu') {
            const secilen = interaction.values[0];
            const kategori = TICKET_KATEGORILERI.find(k => k.value === secilen);

            const mevcutKanal = interaction.guild.channels.cache.find(c =>
                c.name === `ticket-${interaction.user.username.toLowerCase()}` && c.parentId === interaction.channel.parentId
            );

            if (mevcutKanal) {
                return interaction.reply({ content: `Zaten açık bir biletin var: <#${mevcutKanal.id}>`, ephemeral: true });
            }

            const ticketKanal = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: interaction.channel.parentId,
                topic: `MercimekNW Destek • ${kategori.label} • ${interaction.user.tag}`,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                ],
            });

            const butonlar = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('ticket_kapat').setLabel('Kapat').setEmoji('🔒').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('ticket_kilitle').setLabel('Kilitle').setEmoji('🔐').setStyle(ButtonStyle.Secondary)
            );

            const ticketMetni = 
                `Merhaba ${interaction.user}, biletin başarıyla oluşturuldu.\n\n` +
                `**Kategori:** ${kategori.label}\n\n` +
                `Yetkililerimizle konuşmaya başlayabilirsin, lütfen sorununu detaylıca anlat.`;

            await ticketKanal.send({ content: `<@${interaction.user.id}>`, content: ticketMetni, components: [butonlar] });
            return interaction.reply({ content: `Biletin açıldı: <#${ticketKanal.id}>`, ephemeral: true });
        }

        // ========== BUTONLAR ==========
        if (interaction.isButton()) {
            if (interaction.customId === 'ticket_kapat') {
                if (!yetkiliMi(interaction.member) && interaction.channel.name !== `ticket-${interaction.user.username}`) {
                    return interaction.reply({ content: 'Bunu yapmak için yetkin yok.', ephemeral: true });
                }
                await interaction.reply({ content: 'Bilet 5 saniye içinde kapatılıyor...' });
                setTimeout(async () => { try { await interaction.channel.delete(); } catch (e) {} }, 5000);
            }

            if (interaction.customId === 'ticket_kilitle') {
                if (!yetkiliMi(interaction.member)) return interaction.reply({ content: 'Bunu yapmak için yetkin yok.', ephemeral: true });
                await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false });
                return interaction.reply({ content: 'Bilet kilitlendi.' });
            }
        }
    } catch (error) {
        console.error(error);
        if (!interaction.replied && !interaction.deferred) {
            interaction.reply({ content: 'Bir şeyler ters gitti, tekrar dener misin?', ephemeral: true }).catch(() => {});
        }
    }
});

// ========== KOMUT KAYIT ==========
client.on('ready', async () => {
    const commands = [
        { name: 'destek-oluştur', description: 'Destek panelini gönderir.' },
        { name: 'ip', description: 'Sunucu bilgilerini gösterir.' },
        { name: 'yardim', description: 'Komut listesini gösterir.' },
        { name: 'sil', description: 'Mesaj siler.', options: [{ name: 'adet', description: '1-100', type: 4, required: false }] },
        { name: 'kilitle', description: 'Kanalı kilitler.' },
        { name: 'ac', description: 'Kanalın kilidini açar.' },
        { name: 'ekle', description: 'Ticket\'a kullanıcı ekler.', options: [{ name: 'kullanıcı', description: 'Kullanıcı', type: 6, required: true }] },
        { name: 'cikar', description: 'Ticket\'tan kullanıcı çıkarır.', options: [{ name: 'kullanıcı', description: 'Kullanıcı', type: 6, required: true }] }
    ];

    try {
        if (SUNUCU_ID !== "123456789012345678") {
            const guild = client.guilds.cache.get(SUNUCU_ID);
            if (guild) {
                await guild.commands.set(commands);
                console.log(`Komutlar ${guild.name} sunucusuna yüklendi!`);
            }
        } else {
            await client.application.commands.set(commands);
            console.log('Komutlar global olarak yüklendi.');
        }
    } catch (error) {
        console.error('Komut yüklenirken hata:', error);
    }
});

client.login(process.env.TOKEN);
