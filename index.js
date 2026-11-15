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

// GIF BURADA (Kendi GIF'in varsa buraya linkini yapıştır)
const CALISAN_GIF = "https://cdn.discordapp.com/attachments/1114828090680356935/1174320778513788938/discord-banner.gif"; 

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

            if (commandName === 'destek-oluştur') {
                if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                    return interaction.reply({ content: 'Kanka bu komutu sadece kurucular kullanabilir.', ephemeral: true });
                }

                const panelEmbed = new EmbedBuilder()
                    .setTitle('Mercimek Network | Destek')
                    .setDescription(
                        `Selamlar! Destek talebi oluşturmak için aşağıdaki menüyü kullanabilirsin.\n\n` +
                        `**Dikkat Etmen Gerekenler:**\n` +
                        `• Açtığın bileti 24 saat içinde takip etmelisin.\n` +
                        `• Yetkililere DM'den ulaşmak yerine bilet açın.\n` +
                        `• Lütfen sorununu açık ve net bir şekilde anlat.\n\n` +
                        `*İyi oyunlar dileriz!*`
                    )
                    .setColor('#2b2d31') // Discord'un koyu arka plan rengi (Daha doğal durması için)
                    .setImage(CALISAN_GIF)
                    .setFooter({ text: 'MercimekNW • Destek Sistemi', iconURL: client.user.displayAvatarURL() });

                const menu = new StringSelectMenuBuilder()
                    .setCustomId('ticket_menu')
                    .setPlaceholder('Kategori seç ve bilet oluştur...')
                    .addOptions(TICKET_KATEGORILERI.map(k => ({
                        label: k.label, value: k.value, emoji: k.emoji, description: k.desc
                    })));

                const row = new ActionRowBuilder().addComponents(menu);
                await interaction.channel.send({ embeds: [panelEmbed], components: [row] });
                return interaction.reply({ content: 'Destek paneli gönderildi kanka.', ephemeral: true });
            }

            if (commandName === 'ip') {
                return interaction.reply({ content: `Sunucu IP'miz: \`${SUNUCU_IP}\`\nSürüm: \`${SUNUCU_SURUM}\`\nMod: \`${SUNUCU_MOD}\`\n\nHemen gel, seni bekliyoruz!` });
            }

            if (commandName === 'yardim') {
                return interaction.reply({ content: `**Komutlar:**\n/sil [adet]\n/kilitle\n/ac\n/ekle @kullanıcı\n/cikar @kullanıcı\n/mute @kullanıcı [süre]\n/unmute @kullanıcı\n/zar\n/yazitura\n/slot\n/8top\n/akinator` , ephemeral: true});
            }

            if (commandName === 'sil') {
                if (!yetkiliMi(interaction.member)) return interaction.reply({ content: 'Bunu yapmak için yetkin yok.', ephemeral: true });
                const adet = interaction.options.getInteger('adet') ?? 100;
                const silinen = await interaction.channel.bulkDelete(adet, true);
                return interaction.reply({ content: `${silinen.size} mesajı temizledim.`, ephemeral: true });
            }

            if (commandName === 'kilitle') {
                if (!yetkiliMi(interaction.member)) return interaction.reply({ content: 'Bunu yapmak için yetkin yok.', ephemeral: true });
                await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false });
                return interaction.reply({ content: `Kanalı kilitledim.` });
            }

            if (commandName === 'ac') {
                if (!yetkiliMi(interaction.member)) return interaction.reply({ content: 'Bunu yapmak için yetkin yok.', ephemeral: true });
                await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: null });
                return interaction.reply({ content: `Kanalın kilidini açtım.` });
            }

            if (commandName === 'ekle') {
                if (!ticketMi(interaction.channel)) return interaction.reply({ content: 'Bu komut sadece bilet kanallarında çalışır.', ephemeral: true });
                if (!yetkiliMi(interaction.member)) return interaction.reply({ content: 'Bunu yapmak için yetkin yok.', ephemeral: true });
                const kullanici = interaction.options.getUser('kullanıcı');
                await interaction.channel.permissionOverwrites.edit(kullanici.id, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
                return interaction.reply({ content: `${kullanici} kişisini bilete ekledim.` });
            }

            if (commandName === 'cikar') {
                if (!ticketMi(interaction.channel)) return interaction.reply({ content: 'Bu komut sadece bilet kanallarında çalışır.', ephemeral: true });
                if (!yetkiliMi(interaction.member)) return interaction.reply({ content: 'Bunu yapmak için yetkin yok.', ephemeral: true });
                const kullanici = interaction.options.getUser('kullanıcı');
                await interaction.channel.permissionOverwrites.delete(kullanici.id);
                return interaction.reply({ content: `${kullanici} kişisini biletten çıkardım.` });
            }

            if (commandName === 'mute') {
                if (!yetkiliMi(interaction.member)) return interaction.reply({ content: 'Bunu yapmak için yetkin yok.', ephemeral: true });
                const kullanici = interaction.options.getMember('kullanici');
                const sure = interaction.options.getInteger('sure');
                const sebep = interaction.options.getString('sebep') || 'Sebep belirtilmedi';
                if (!kullanici) return interaction.reply({ content: 'Kullanıcıyı bulamadım.', ephemeral: true });
                
                await kullanici.timeout(sure * 60 * 1000, sebep);
                return interaction.reply({ content: `${kullanici.user.tag} adlı kişiyi ${sure} dakika susturdum. Sebep: ${sebep}` });
            }

            if (commandName === 'unmute') {
                if (!yetkiliMi(interaction.member)) return interaction.reply({ content: 'Bunu yapmak için yetkin yok.', ephemeral: true });
                const kullanici = interaction.options.getMember('kullanici');
                if (!kullanici) return interaction.reply({ content: 'Kullanıcıyı bulamadım.', ephemeral: true });
                
                await kullanici.timeout(null);
                return interaction.reply({ content: `${kullanici.user.tag} adlı kişinin susturmasını kaldırdım.` });
            }

            if (commandName === 'zar') {
                return interaction.reply({ content: `Zar attım: **${Math.floor(Math.random() * 6) + 1}**` });
            }
            
            if (commandName === 'yazitura') {
                return interaction.reply({ content: `Para attım: **${Math.random() < 0.5 ? 'Yazı' : 'Tura'}**` });
            }

            if (commandName === 'slot') {
                const emojiler = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣'];
                const s1 = emojiler[Math.floor(Math.random() * emojiler.length)];
                const s2 = emojiler[Math.floor(Math.random() * emojiler.length)];
                const s3 = emojiler[Math.floor(Math.random() * emojiler.length)];
                let mesaj = `**[ ${s1} | ${s2} | ${s3} ]**\n`;
                if (s1 === s2 && s2 === s3) mesaj += `JACKPOT! Büyük vurgun yaptın!`;
                else if (s1 === s2 || s2 === s3 || s1 === s3) mesaj += `Tebrikler, ufak bir ikramiye kaptın!`;
                else mesaj += `Maalesef kaybettin, bir daha dene.`;
                return interaction.reply({ content: mesaj });
            }

            if (commandName === '8top') {
                const sorular = ['Kesinlikle evet.', 'Hayır.', 'Bence öyle.', 'Pek sanmıyorum.', 'Kesinlikle hayır.', 'Evet.', 'Belki...', 'Şu an cevap veremem.', 'Bence bunu sormalısın.', 'İyi görünüyor.'];
                return interaction.reply({ content: `**Soru:** ${interaction.options.getString('soru')}\n**Cevap:** ${sorular[Math.floor(Math.random() * sorular.length)]}` });
            }

            if (commandName === 'akinator') {
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('ak_evet').setLabel('Evet').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId('ak_hayir').setLabel('Hayır').setStyle(ButtonStyle.Danger)
                );
                return interaction.reply({ content: `Aklından bir ünlü mü geçiriyorsun?`, components: [row] });
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
            
            if (interaction.customId === 'ak_evet' || interaction.customId === 'ak_hayir') {
                return interaction.reply({ content: 'Seni anladım! Ama ben sadece bir simülasyonum, doğru cevap: **Bilemedim!** 😅', ephemeral: true });
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
