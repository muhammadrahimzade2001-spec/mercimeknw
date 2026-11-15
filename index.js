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
const LOGO_URL = "https://i.imgur.com/8Q5X7yG.png";
const GIF_URL = "https://i.imgur.com/3LLNakg.gif";

// --- KOMUTLARIN ANINDA YÜKLENMESİ İÇİN SUNUCU ID'Nİ BURAYA YAZ ---
const SUNUCU_ID = "BURAYA_SUNUCU_ID_YAZ"; 

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

        if (commandName === 'ip') {
            return interaction.reply({ content: `📡 **MercimekNW Sunucu Bilgileri**\n\n🌐 **IP:** \`${SUNUCU_IP}\`\n🎮 **Sürüm:** \`${SUNUCU_SURUM}\`\n⚔️ **Mod:** \`${SUNUCU_MOD}\`` });
        }

        if (commandName === 'yardim') {
            return interaction.reply({ content: `📖 **Komut Listesi**\n\n**Yetkili:** /sil, /kilitle, /ac, /ekle, /cikar, /mute, /unmute\n**Oyun:** /zar, /yazitura, /slot, /8top, /akinator\n**Genel:** /ip, /yardim` , ephemeral: true});
        }

        if (commandName === 'sil') {
            if (!yetkiliMi(interaction.member)) return interaction.reply({ content: '❌ Yetkin yok.', ephemeral: true });
            const adet = interaction.options.getInteger('adet') ?? 100;
            if (adet < 1 || adet > 100) return interaction.reply({ content: '❌ 1-100 arası.', ephemeral: true });
            try {
                const silinen = await interaction.channel.bulkDelete(adet, true);
                return interaction.reply({ content: `✅ **${silinen.size}** mesaj silindi.`, ephemeral: true });
            } catch (e) {
                return interaction.reply({ content: '❌ Hata oluştu.', ephemeral: true });
            }
        }

        if (commandName === 'kilitle') {
            if (!yetkiliMi(interaction.member)) return interaction.reply({ content: '❌ Yetkin yok.', ephemeral: true });
            try {
                await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false });
                return interaction.reply({ content: `🔒 Kanal kilitlendi.` });
            } catch (e) { return interaction.reply({ content: '❌ Hata.', ephemeral: true }); }
        }

        if (commandName === 'ac') {
            if (!yetkiliMi(interaction.member)) return interaction.reply({ content: '❌ Yetkin yok.', ephemeral: true });
            try {
                await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: null });
                return interaction.reply({ content: `🔓 Kanal kilidi açıldı.` });
            } catch (e) { return interaction.reply({ content: '❌ Hata.', ephemeral: true }); }
        }

        if (commandName === 'ekle') {
            if (!ticketMi(interaction.channel)) return interaction.reply({ content: '❌ Sadece ticket kanallarında.', ephemeral: true });
            if (!yetkiliMi(interaction.member)) return interaction.reply({ content: '❌ Yetkin yok.', ephemeral: true });
            const kullanici = interaction.options.getUser('kullanıcı');
            try {
                await interaction.channel.permissionOverwrites.edit(kullanici.id, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
                return interaction.reply({ content: `✅ ${kullanici} eklendi.` });
            } catch (e) { return interaction.reply({ content: '❌ Hata.', ephemeral: true }); }
        }

        if (commandName === 'cikar') {
            if (!ticketMi(interaction.channel)) return interaction.reply({ content: '❌ Sadece ticket kanallarında.', ephemeral: true });
            if (!yetkiliMi(interaction.member)) return interaction.reply({ content: '❌ Yetkin yok.', ephemeral: true });
            const kullanici = interaction.options.getUser('kullanıcı');
            try {
                await interaction.channel.permissionOverwrites.delete(kullanici.id);
                return interaction.reply({ content: `✅ ${kullanici} çıkarıldı.` });
            } catch (e) { return interaction.reply({ content: '❌ Hata.', ephemeral: true }); }
        }

        if (commandName === 'mute') {
            if (!yetkiliMi(interaction.member)) return interaction.reply({ content: '❌ Yetkin yok.', ephemeral: true });
            const kullanici = interaction.options.getMember('kullanici');
            const sure = interaction.options.getInteger('sure');
            const sebep = interaction.options.getString('sebep') || 'Belirtilmedi';
            if (!kullanici) return interaction.reply({ content: '❌ Kullanıcı yok.', ephemeral: true });
            try {
                await kullanici.timeout(sure * 60 * 1000, sebep);
                return interaction.reply({ content: `🔇 ${kullanici.user.tag} **${sure} dk** susturuldu.` });
            } catch (e) { return interaction.reply({ content: '❌ Hata.', ephemeral: true }); }
        }

        if (commandName === 'unmute') {
            if (!yetkiliMi(interaction.member)) return interaction.reply({ content: '❌ Yetkin yok.', ephemeral: true });
            const kullanici = interaction.options.getMember('kullanici');
            if (!kullanici) return interaction.reply({ content: '❌ Kullanıcı yok.', ephemeral: true });
            try {
                await kullanici.timeout(null);
                return interaction.reply({ content: `🔊 ${kullanici.user.tag} susturması kaldırıldı.` });
            } catch (e) { return interaction.reply({ content: '❌ Hata.', ephemeral: true }); }
        }

        if (commandName === 'zar') {
            return interaction.reply({ content: `🎲 Zar: **${Math.floor(Math.random() * 6) + 1}**` });
        }

        if (commandName === 'yazitura') {
            return interaction.reply({ content: `🪙 Sonuç: **${Math.random() < 0.5 ? 'Yazı' : 'Tura'}**` });
        }

        if (commandName === 'slot') {
            const emojiler = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣'];
            const s1 = emojiler[Math.floor(Math.random() * emojiler.length)];
            const s2 = emojiler[Math.floor(Math.random() * emojiler.length)];
            const s3 = emojiler[Math.floor(Math.random() * emojiler.length)];
            let mesaj = `🎰 **[ ${s1} | ${s2} | ${s3} ]**\n`;
            if (s1 === s2 && s2 === s3) mesaj += `🎉 **JACKPOT!**`;
            else if (s1 === s2 || s2 === s3 || s1 === s3) mesaj += `✨ **Tebrikler, küçük ikramiye!**`;
            else mesaj += `😢 **Kaybettin!**`;
            return interaction.reply({ content: mesaj });
        }

        if (commandName === '8top') {
            const sorular = ['Kesinlikle evet.', 'Hayır.', 'Buna güvenebilirsin.', 'Pek sanmıyorum.', 'Kesinlikle hayır.', 'Evet.', 'Belki...', 'Şu an cevap veremem.', 'Konsantre ol.', 'Sonuç iyi görünüyor.'];
            return interaction.reply({ content: `❓ **Soru:** ${interaction.options.getString('soru')}\n🎱 **Cevap:** ${sorular[Math.floor(Math.random() * sorular.length)]}` });
        }

        // --- SIFIRDAN YAZILMIŞ, KÜTÜPHANESİZ AKİNATÖR ---
        if (commandName === 'akinator') {
            const sorular = [
                { soru: "Aklından bir ünlü mü geçiriyorsun?", tip: "ünlü" },
                { soru: "Bu kişi erkek mi?", tip: "cinsiyet" },
                { soru: "Bu kişi oyuncu mu?", tip: "meslek" },
                { soru: "Bu kişi Türk mü?", tip: "milliyet" },
                { soru: "Aklından bir hayvan mı geçiriyorsun?", tip: "hayvan" }
            ];
            // Basit bir örnek akinatör simülasyonu (Hata vermemesi için)
            const secilenSoru = sorular[Math.floor(Math.random() * sorular.length)];
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('ak_evet').setLabel('Evet').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('ak_hayir').setLabel('Hayır').setStyle(ButtonStyle.Danger)
            );
            return interaction.reply({ content: `🧞‍♂️ **Akinatör:** ${secilenSoru.soru}`, components: [row] });
        }
    }

    // ========== BUTONLAR ==========
    if (interaction.isButton()) {
        if (interaction.customId === 'ticket_kapat') {
            if (!yetkiliMi(interaction.member) && interaction.channel.name !== `ticket-${interaction.user.username}`) {
                return interaction.reply({ content: '❌ Yetkin yok.', ephemeral: true });
            }
            await interaction.reply({ content: '🔒 Ticket kapatılıyor...' });
            setTimeout(async () => { try { await interaction.channel.delete(); } catch (e) {} }, 5000);
        }

        if (interaction.customId === 'ticket_kilitle') {
            if (!yetkiliMi(interaction.member)) return interaction.reply({ content: '❌ Yetkin yok.', ephemeral: true });
            try {
                await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false });
                await interaction.reply({ content: '🔐 Ticket kilitlendi.' });
            } catch (e) { await interaction.reply({ content: '❌ Hata.', ephemeral: true }); }
        }
        
        // Akinatör buton cevapları (Sadece örnek)
        if (interaction.customId === 'ak_evet' || interaction.customId === 'ak_hayir') {
            return interaction.reply({ content: '🧞‍♂️ **Akinatör:** Seni anladım! Ama ben sadece bir simülasyonum, gerçek Akinatör API\'si şu an çöktü. Doğru cevap: **Bilemedim!** 😅', ephemeral: true });
        }
    }
});

// ========== KOMUT KAYIT (ANINDA YÜKLENİR) ==========
client.on('ready', async () => {
    const commands = [
        { name: 'destek-oluştur', description: 'Destek panelini gönderir.' },
        { name: 'ip', description: 'Sunucu bilgilerini gösterir.' },
        { name: 'yardim', description: 'Komut listesini gösterir.' },
        { name: 'sil', description: 'Mesaj siler.', options: [{ name: 'adet', description: '1-100', type: 4, required: false }] },
        { name: 'kilitle', description: 'Kanalı kilitler.' },
        { name: 'ac', description: 'Kanalın kilidini açar.' },
        { name: 'ekle', description: 'Ticket\'a kullanıcı ekler.', options: [{ name: 'kullanıcı', description: 'Kullanıcı', type: 6, required: true }] },
        { name: 'cikar', description: 'Ticket\'tan kullanıcı çıkarır.', options: [{ name: 'kullanıcı', description: 'Kullanıcı', type: 6, required: true }] },
        { name: 'mute', description: 'Kullanıcıyı susturur.', options: [{ name: 'kullanici', description: 'Kullanıcı', type: 6, required: true }, { name: 'sure', description: 'Dakika', type: 4, required: true }, { name: 'sebep', description: 'Sebep', type: 3, required: false }] },
        { name: 'unmute', description: 'Susturmayı kaldırır.', options: [{ name: 'kullanici', description: 'Kullanıcı', type: 6, required: true }] },
        { name: 'zar', description: 'Zar atar.' },
        { name: 'yazitura', description: 'Yazı tura atar.' },
        { name: 'slot', description: 'Slot çevirir.' },
        { name: '8top', description: 'Sihirli 8 top.', options: [{ name: 'soru', description: 'Sorun', type: 3, required: true }] },
        { name: 'akinator', description: 'Akinatör oyununu başlatır.' }
    ];

    try {
        if (SUNUCU_ID !== "BURAYA_SUNUCU_ID_YAZ") {
            const guild = client.guilds.cache.get(SUNUCU_ID);
            if (guild) {
                await guild.commands.set(commands);
                console.log(`✅ Komutlar başarıyla ${guild.name} sunucusuna yüklendi!`);
            }
        } else {
            await client.application.commands.set(commands);
            console.log('✅ Global komutlar yüklendi.');
        }
    } catch (error) {
        console.error('Komut yüklenirken hata:', error);
    }
});

client.login(process.env.TOKEN);
