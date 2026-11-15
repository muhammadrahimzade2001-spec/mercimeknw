const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, StringSelectMenuBuilder } = require('discord.js');
const akinator = require('discord.js-akinator');
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

// --- GÖRSELLER ---
const LOGO_URL = "https://i.imgur.com/8Q5X7yG.png";
const GIF_URL = "https://i.imgur.com/3LLNakg.gif";

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

function ticketMi(channel) { return channel.name.startsWith('ticket-'); }
function yetkiliMi(member) { return member.permissions.has(PermissionFlagsBits.ManageChannels); }

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
                return interaction.reply({ content: '❌ Bu komutu sadece kurucular kullanabilir.', ephemeral: true });
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
                .setColor('#FFA500')
                .setThumbnail(LOGO_URL)
                .setImage(GIF_URL)
                .setFooter({ text: 'Powered by MercimekNW • ticket-tool.app', iconURL: client.user.displayAvatarURL() })
                .setTimestamp();

            const menu = new StringSelectMenuBuilder()
                .setCustomId('ticket_menu')
                .setPlaceholder('Destek kategorisi seçin...')
                .addOptions(TICKET_KATEGORILERI.map(k => ({
                    label: k.label, value: k.value, emoji: k.emoji, description: k.desc
                })));

            const row = new ActionRowBuilder().addComponents(menu);
            
            await interaction.channel.send({ embeds: [panelEmbed], components: [row] });
            return interaction.reply({ content: '✅ Destek paneli başarıyla gönderildi.', ephemeral: true });
        }

        // --- /ip ---
        if (commandName === 'ip') {
            return interaction.reply({ content: `📡 **MercimekNW Sunucu Bilgileri**\n\n🌐 **IP:** \`${SUNUCU_IP}\`\n🎮 **Sürüm:** \`${SUNUCU_SURUM}\`\n⚔️ **Mod:** \`${SUNUCU_MOD}\`` });
        }

        // --- /yardim ---
        if (commandName === 'yardim') {
            const yardimMetni = 
                `📖 **MercimekNW Komut Listesi**\n\n` +
                `👑 **Kurucu Komutları:**\n\`/destek-oluştur\` - Destek panelini gönderir\n\n` +
                `🛠️ **Yetkili Komutları:**\n\`/sil [adet]\` - Mesajları siler\n\`/kilitle\` - Kanalı kilitler\n\`/ac\` - Kanal kilidini açar\n\`/ekle @kullanıcı\` - Ticket'a kullanıcı ekler\n\`/cikar @kullanıcı\` - Ticket'tan kullanıcı çıkarır\n\`/mute @kullanıcı [süre] [sebep]\` - Kullanıcıyı susturur (dakika)\n\`/unmute @kullanıcı\` - Kullanıcının susturmasını kaldırır\n\n` +
                `🎮 **Oyun Komutları:**\n\`/zar\` - Zar atar\n\`/yazitura\` - Yazı tura atar\n\`/slot\` - Slot çevirir\n\`/8top [soru]\` - 8 top soru sorar\n\`/akinator\` - Akinatör oyununu başlatır\n\n` +
                `🌐 **Genel:**\n\`/ip\` - Sunucu bilgilerini gösterir\n\`/yardim\` - Bu listeyi gösterir`;
            return interaction.reply({ content: yardimMetni, ephemeral: true });
        }

        // --- /sil ---
        if (commandName === 'sil') {
            if (!yetkiliMi(interaction.member)) return interaction.reply({ content: '❌ Bu komutu kullanmak için yetkili olmalısın.', ephemeral: true });
            const adet = interaction.options.getInteger('adet') ?? 100;
            if (adet < 1 || adet > 100) return interaction.reply({ content: '❌ Adet 1 ile 100 arasında olmalı.', ephemeral: true });
            try {
                const silinen = await interaction.channel.bulkDelete(adet, true);
                return interaction.reply({ content: `✅ **${silinen.size}** mesaj silindi.`, ephemeral: true });
            } catch (e) {
                return interaction.reply({ content: '❌ Mesajlar silinirken hata oluştu (14 günden eski mesajlar silinemez).', ephemeral: true });
            }
        }

        // --- /kilitle ---
        if (commandName === 'kilitle') {
            if (!yetkiliMi(interaction.member)) return interaction.reply({ content: '❌ Bu komutu kullanmak için yetkili olmalısın.', ephemeral: true });
            try {
                await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false });
                return interaction.reply({ content: `🔒 Bu kanal **${interaction.user.tag}** tarafından kilitlendi. Sadece yetkililer mesaj gönderebilir.` });
            } catch (e) {
                return interaction.reply({ content: '❌ Kilitleme sırasında hata oluştu.', ephemeral: true });
            }
        }

        // --- /ac ---
        if (commandName === 'ac') {
            if (!yetkiliMi(interaction.member)) return interaction.reply({ content: '❌ Bu komutu kullanmak için yetkili olmalısın.', ephemeral: true });
            try {
                await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: null });
                return interaction.reply({ content: `🔓 Bu kanalın kilidi **${interaction.user.tag}** tarafından açıldı. Artık herkes mesaj gönderebilir.` });
            } catch (e) {
                return interaction.reply({ content: '❌ Açma sırasında hata oluştu.', ephemeral: true });
            }
        }

        // --- /ekle ---
        if (commandName === 'ekle') {
            if (!ticketMi(interaction.channel)) return interaction.reply({ content: '❌ Bu komut sadece ticket kanallarında kullanılabilir.', ephemeral: true });
            if (!yetkiliMi(interaction.member)) return interaction.reply({ content: '❌ Bu komutu kullanmak için yetkili olmalısın.', ephemeral: true });
            const kullanici = interaction.options.getUser('kullanıcı');
            try {
                await interaction.channel.permissionOverwrites.edit(kullanici.id, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
                return interaction.reply({ content: `✅ ${kullanici} ticket'a eklendi.` });
            } catch (e) {
                return interaction.reply({ content: '❌ Ekleme sırasında hata oluştu.', ephemeral: true });
            }
        }

        // --- /cikar ---
        if (commandName === 'cikar') {
            if (!ticketMi(interaction.channel)) return interaction.reply({ content: '❌ Bu komut sadece ticket kanallarında kullanılabilir.', ephemeral: true });
            if (!yetkiliMi(interaction.member)) return interaction.reply({ content: '❌ Bu komutu kullanmak için yetkili olmalısın.', ephemeral: true });
            const kullanici = interaction.options.getUser('kullanıcı');
            try {
                await interaction.channel.permissionOverwrites.delete(kullanici.id);
                return interaction.reply({ content: `✅ ${kullanici} ticket'tan çıkarıldı.` });
            } catch (e) {
                return interaction.reply({ content: '❌ Çıkarma sırasında hata oluştu.', ephemeral: true });
            }
        }

        // --- /mute (Süre ve sebep parametreleri düzeltildi) ---
        if (commandName === 'mute') {
            if (!yetkiliMi(interaction.member)) return interaction.reply({ content: '❌ Bu komutu kullanmak için yetkili olmalısın.', ephemeral: true });
            const kullanici = interaction.options.getMember('kullanici'); // İngilizce 'kullanici' olarak güncellendi
            const sure = interaction.options.getInteger('sure'); // İngilizce 'sure' olarak güncellendi
            const sebep = interaction.options.getString('sebep') || 'Sebep belirtilmedi';
            
            if (!kullanici) return interaction.reply({ content: '❌ Kullanıcı bulunamadı.', ephemeral: true });
            
            try {
                await kullanici.timeout(sure * 60 * 1000, sebep);
                return interaction.reply({ content: `🔇 ${kullanici.user.tag} adlı kullanıcı **${sure} dakika** boyunca susturuldu.\n**Sebep:** ${sebep}` });
            } catch (e) {
                return interaction.reply({ content: '❌ Susturma işlemi başarısız oldu. Kullanıcının rolü benden yüksek olabilir.', ephemeral: true });
            }
        }

        // --- /unmute ---
        if (commandName === 'unmute') {
            if (!yetkiliMi(interaction.member)) return interaction.reply({ content: '❌ Bu komutu kullanmak için yetkili olmalısın.', ephemeral: true });
            const kullanici = interaction.options.getMember('kullanici');
            
            if (!kullanici) return interaction.reply({ content: '❌ Kullanıcı bulunamadı.', ephemeral: true });
            
            try {
                await kullanici.timeout(null);
                return interaction.reply({ content: `🔊 ${kullanici.user.tag} adlı kullanıcının susturması kaldırıldı.` });
            } catch (e) {
                return interaction.reply({ content: '❌ Susturma kaldırma işlemi başarısız oldu.', ephemeral: true });
            }
        }

        // --- OYUN KOMUTLARI ---
        if (commandName === 'zar') {
            const sonuc = Math.floor(Math.random() * 6) + 1;
            return interaction.reply({ content: `🎲 Zar atıldı: **${sonuc}**` });
        }

        if (commandName === 'yazitura') {
            const sonuc = Math.random() < 0.5 ? 'Yazı' : 'Tura';
            return interaction.reply({ content: `🪙 Para atıldı: **${sonuc}**` });
        }

        if (commandName === 'slot') {
            const emojiler = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣'];
            const s1 = emojiler[Math.floor(Math.random() * emojiler.length)];
            const s2 = emojiler[Math.floor(Math.random() * emojiler.length)];
            const s3 = emojiler[Math.floor(Math.random() * emojiler.length)];
            
            let mesaj = `🎰 **[ ${s1} | ${s2} | ${s3} ]**\n`;
            if (s1 === s2 && s2 === s3) {
                mesaj += `🎉 **JACKPOT! Büyük ikramiye kazandın!**`;
            } else if (s1 === s2 || s2 === s3 || s1 === s3) {
                mesaj += `✨ **Tebrikler, küçük ikramiye kazandın!**`;
            } else {
                mesaj += `😢 **Kaybettin, tekrar dene!**`;
            }
            return interaction.reply({ content: mesaj });
        }

        if (commandName === '8top') {
            const sorular = [
                'Kesinlikle evet.', 'Hayır.', 'Buna güvenebilirsin.', 'Pek sanmıyorum.', 
                'Kesinlikle hayır.', 'Evet.', 'Belki...', 'Şu an cevap veremem.', 
                'Konsantre ol ve tekrar sor.', 'Sonuç iyi görünüyor.', 'Bunu rüyanda gör.', 'Kesinlikle!'
            ];
            const soru = interaction.options.getString('soru');
            const cevap = sorular[Math.floor(Math.random() * sorular.length)];
            return interaction.reply({ content: `❓ **Soru:** ${soru}\n🎱 **Cevap:** ${cevap}` });
        }

        // --- /akinator ---
        if (commandName === 'akinator') {
            try {
                await akinator(interaction, {
                    language: 'tr',
                    childMode: false,
                    gameType: 'character',
                    useButtons: true,
                    embedColor: '#FFA500'
                });
            } catch (error) {
                console.error(error);
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ content: '❌ Akinatör başlatılırken bir hata oluştu.', ephemeral: true });
                }
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
            return interaction.reply({ content: `❌ Zaten açık bir ticketin var: <#${mevcutKanal.id}>`, ephemeral: true });
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
                ],
            });

            const butonlar = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('ticket_kapat').setLabel('Talebi Kapat').setEmoji('🔒').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('ticket_kilitle').setLabel('Kilitle').setEmoji('🔐').setStyle(ButtonStyle.Secondary)
            );

            const ticketMetni = 
                `👋 Merhaba ${interaction.user}, destek talebin oluşturuldu!\n\n` +
                `📋 **Kategori:** ${kategori.emoji} ${kategori.label}\n\n` +
                `⚠️ **Önemli:** Lütfen talebini detaylıca anlat. Yetkililerimiz en kısa sürede ilgilenecek.`;

            await ticketKanal.send({ content: `<@${interaction.user.id}>`, content: ticketMetni, components: [butonlar] });
            await interaction.reply({ content: `✅ Destek talebin oluşturuldu: <#${ticketKanal.id}>`, ephemeral: true });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Ticket oluşturulurken bir hata oluştu.', ephemeral: true });
        }
    }

    // ========== BUTONLAR ==========
    if (interaction.isButton()) {
        if (interaction.customId === 'ticket_kapat') {
            if (!yetkiliMi(interaction.member) && interaction.channel.name !== `ticket-${interaction.user.username}`) {
                return interaction.reply({ content: '❌ Bu ticketi kapatma yetkin yok.', ephemeral: true });
            }
            await interaction.reply({ content: '🔒 Ticket 5 saniye içinde kapatılıyor...' });
            setTimeout(async () => {
                try { await interaction.channel.delete(); } catch (e) { console.log('Kanal silinemedi.'); }
            }, 5000);
        }

        if (interaction.customId === 'ticket_kilitle') {
            if (!yetkiliMi(interaction.member)) {
                return interaction.reply({ content: '❌ Bu butonu kullanma yetkin yok.', ephemeral: true });
            }
            try {
                await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false });
                await interaction.reply({ content: '🔐 Ticket kanalı kilitlendi.' });
            } catch (e) {
                await interaction.reply({ content: '❌ Kilitleme sırasında hata oluştu.', ephemeral: true });
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
        },
        {
            name: 'mute',
            description: 'Kullanıcıyı belirtilen süre boyunca susturur.',
            options: [
                { name: 'kullanici', description: 'Susturulacak kullanıcı', type: 6, required: true },
                { name: 'sure', description: 'Süre (dakika)', type: 4, required: true },
                { name: 'sebep', description: 'Susturma sebebi', type: 3, required: false }
            ]
        },
        {
            name: 'unmute',
            description: 'Kullanıcının susturmasını kaldırır.',
            options: [{ name: 'kullanici', description: 'Susturması kaldırılacak kullanıcı', type: 6, required: true }]
        },
        { name: 'zar', description: 'Zar atar.' },
        { name: 'yazitura', description: 'Yazı tura atar.' },
        { name: 'slot', description: 'Slot makinesini çevirir.' },
        {
            name: '8top',
            description: 'Sihirli 8 topa soru sorarsınız.',
            options: [{ name: 'soru', description: 'Sorunuz', type: 3, required: true }]
        },
        { name: 'akinator', description: 'Akinatör oyununu başlatır.' }
    ];

    try {
        await client.application.commands.set(commands);
        console.log('Slash komutlar yüklendi.');
    } catch (error) {
        console.error('Komut yüklenirken hata:', error);
    }
});

client.login(process.env.TOKEN);
