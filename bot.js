// Déclaration des fichiers nécessaires
const Discord = require("discord.js"),
    fs = require("fs"),
    google = require("google"),
    request = require("request")

// Déclaration des fichiers
const botmanager = require("./botmanager.json"),
    botachievements = require("./achievements.json"),
    botfinish = JSON.parse(fs.readFileSync("./Achievements/bot.json", "utf8")),
    emj = JSON.parse(fs.readFileSync("./Achievements/emoji.json", "utf8")),
    fm = JSON.parse(fs.readFileSync("./Achievements/message.json", "utf8")),
    voice = JSON.parse(fs.readFileSync("./Achievements/vocal.json", "utf8")),
    list = JSON.parse(fs.readFileSync("./Achievements/list.json", "utf8")),
    px = JSON.parse(fs.readFileSync("./Achievements/exp.json", "utf8"))

// Déclaration des constantes fichiers
const achievements = botachievements.List,
    Token = botmanager.Token,
    prefix = botmanager.prefix

//Ouverture du bot
const bot = new Discord.Client({ disableEveryone: true })

const Enmap = require("enmap");
bot.points = new Enmap({ name: "points" });

var Mnw = new Date(),
    jour = Mnw.getDate(),
    heure = Mnw.getHours(),
    mins = Mnw.getMinutes(),
    mois = Mnw.getMonth() + 1

// Emitter quand le bot est lancé
bot.on("ready", async () => {
    console.log(jour + "/" + mois + " // " + heure + ":" + mins + " " + "I'm ready to start ! Manager is ready !")

    bot.user.setActivity("Management | $help")

    setInterval(() => {
        const filtered2 = bot.points.filter(p => p.guild === bot.guilds.get("434449610459840512").id);
        const rightNow = new Date();
        const toRemove = filtered2.filter(data => {
            return !bot.guilds.get("434449610459840512").members.has(data.user) || rightNow - 2592000000 > data.lastSeen;
        });
        toRemove.forEach(data => {
            bot.points.delete(`${bot.guilds.get("434449610459840512").id}-${data.user}`);
        });
        console.log("Data erased " + toRemove.size)
        bot.guilds.get("434449610459840512").owner.send(`𝔻𝕐ℕ𝔸𝕊𝕋𝕐 𝙗𝙤𝙩 𝘼𝙜𝙚𝙣𝙘𝙮\n${toRemove.size} Data erased`)
    }, 3600000);

})

// Emitter quitte vocal
bot.on("voiceStateUpdate", async (member) => {
    if (member.id === "539183106524184586" || member.id === "184405311681986560") return
    if (member.voiceChannel) {
        if (!voice[member.id]) {
            bot.channels.get("522398078414749709").send("Good job " + member + "! You were in a channel for the first time !")
            voice[member.id] = {
                author: 0
            }

            voice[member.id].author++
            if (!list[member.id]) {
                list[member.id] = {
                    author: 0
                }
            }
            list[member.id].author++

            fs.writeFile(`./Achievements/vocal.json`, JSON.stringify(voice), (err) => {
                if (err) console.log(err)
            });
            fs.writeFile(`./Achievements/list.json`, JSON.stringify(list), (err) => {
                if (err) console.log(err)
            });
        }
    }
})

// Emitter membre quitte la guilde
bot.on("guildMemberRemove", member => {
    const filtered2 = bot.points.filter(p => p.guild === member.guild.id);
    const rightNow = new Date();
    const toRemove = filtered2.filter(data => {
        return !member.guild.members.has(data.user) || rightNow - 2592000000 > data.lastSeen;
    });
    toRemove.forEach(data => {
        bot.points.delete(`${member.guild.id}-${data.user}`);
    });
    console.log("Data erased " + toRemove.size)
})

// Emitter envoie un msg
bot.on("message", async message => {

    if (message.author.bot) return
    if (message.author.id === "539183106524184586" || message.author.id === "184405311681986560") return
    if (message.channel.type === "dm") return
    const args = message.content.slice(prefix.length).trim().split(/ +/g)
    const cmd = args.shift().toLowerCase()


    if (!list[message.author.id]) {
        list[message.author.id] = {
            author: 0
        }

        fs.writeFile(`./Achievements/list.json`, JSON.stringify(list), (err) => {
            if (err) console.log(err)
        });
    }

    const key = `${message.guild.id}-${message.author.id}`
    bot.points.ensure(`${message.guild.id}-${message.author.id}`, {
        user: message.author.id,
        guild: message.guild.id,
        points: 0,
        level: 1
    });
    bot.points.inc(key, /* "+", 10,  */"points");
    const curLevel = Math.floor(0.3 * Math.sqrt(bot.points.get(key, "points")));
    if (bot.points.get(key, "level") < curLevel) {
        message.reply({
            embed: {
                title: "**Level up incoming !**",
                footer: bot.user.username + bot.user.avatarURL,
                description: `Congratulations to **${message.author.username}**\nYou're now level **${curLevel}** ! Continue like that !`,
            }
        })
        bot.points.set(key, curLevel, "level");
    }

    const filter = (reaction, user) => ["😃", "🔪", "🍶", "⚔", "🦊", "🎮", "🌠", "💚", "🔴", "🔷", "💛", "🔶", "🖤", "⬜", "👍", "👎", "🎹", "🔥"].includes(reaction.emoji.name) && user.id === message.author.id

    if (message.content.startsWith(prefix)) {
        switch (cmd) {
            case "shop":
                message.delete()
                var embed4 = new Discord.RichEmbed()
                    .setDescription("Shop menu")
                    .setAuthor(message.author.id, message.author.avatarURL)
                    .addField("3 Sections, 3 shops (this is a preview):", "LoL : 🎮 ; Anime : 🌠 ; $buyrole for buy a role (be careful it will cost you 50pts)")
                message.channel.send(embed4).then(message => {
                    message.react("🌠")
                    message.react("🎮")
                    message.awaitReactions(filter, {
                        max: 1,
                        time: 30000,
                        errors: ["time"]
                    }).then(async (collected) => {
                        const reaction = collected.first()
                        switch (reaction.emoji.name) {
                            case "🎮":
                                message.delete(embed4)
                                var embed4 = new Discord.RichEmbed()
                                    .setDescription("LoL Menu")
                                    .addField("There is a lot of sections", "1. Akali 😃 | 2. Pyke 🔪 | 3. Jax 🍶 | 4. Aatrox ⚔ | 5. Rakan 🦊")
                                message.channel.send(embed4).then(message => {
                                    message.react("😃")
                                    message.react("🔪")
                                    message.react("🍶")
                                    message.react("⚔")
                                    message.react("🦊")
                                    message.awaitReactions(filter, {
                                        max: 1,
                                        time: 30000,
                                        errors: ["time"]
                                    }).then(async (collected) => {
                                        const reaction = collected.first()

                                        switch (reaction.emoji.name) {
                                            case "😃":
                                                reaction.remove(bot.user)
                                                var msg = [
                                                    "https://image.noelshack.com/fichiers/2019/07/5/1550256806-4.jpg",
                                                    "https://image.noelshack.com/fichiers/2019/07/5/1550256797-3.jpeg",
                                                    "https://image.noelshack.com/fichiers/2019/07/5/1550256803-2.jpeg"
                                                ]; await message.channel.send(msg)
                                                setTimeout(() => {
                                                    message.channel.bulkDelete(1)
                                                    message.channel.send("Ordre => 3/2/1 => Pour les acheter faites $buy 3/2/1 par exemple")
                                                }, 60000);
                                                break

                                            case "🔪":
                                                reaction.remove(bot.user)
                                                var msg2 = [
                                                    "https://image.noelshack.com/fichiers/2019/07/5/1550257738-11.jpeg",
                                                    "https://image.noelshack.com/fichiers/2019/07/5/1550257772-10.jpeg"
                                                ]
                                                await message.channel.send(msg2)
                                                setTimeout(() => {
                                                    message.channel.bulkDelete(1)
                                                    message.channel.send("Ordre => 2/1 => Pour les acheter faites $buy 1/2 par exemple")
                                                }, 60000);
                                                break

                                            case "🍶":
                                                reaction.remove(bot.user)
                                                var msg3 = [
                                                    "https://image.noelshack.com/fichiers/2019/07/5/1550260054-6.jpeg"
                                                ]
                                                message.channel.send(msg3)
                                                setTimeout(() => {
                                                    message.channel.bulkDelete(1)
                                                    message.channel.send("Pour l'acheter il suffit de faire $buy 1")
                                                }, 60000);
                                                break

                                            case "⚔":
                                                reaction.remove(bot.user)
                                                var msg4 = [
                                                    "https://image.noelshack.com/fichiers/2019/07/5/1550260246-1.jpeg"
                                                ]
                                                message.channel.send(msg4)
                                                setTimeout(() => {
                                                    message.channel.bulkDelete(1)
                                                    message.channel.send("Pour l'acheter il suffit de faire $buy 1")
                                                }, 60000);
                                                break

                                            case "🦊":
                                                reaction.remove(bot.user)
                                                var msg5 = [
                                                    "https://image.noelshack.com/fichiers/2019/07/5/1550260235-15.jpeg"
                                                ]
                                                message.channel.send(msg5)
                                                setTimeout(() => {
                                                    message.channel.bulkDelete(1)
                                                    message.channel.send("Pour l'acheter il suffit de faire $buy 1")
                                                }, 600000);
                                                break
                                        }
                                    })
                                })
                                break

                            case "🌠":
                                message.delete(embed4)
                                var embed4 = new Discord.RichEmbed()
                                    .setDescription("Anime Menu")
                                    .addField("There is a lot of sections", "1. Guilty Crown 😃 | 2. Your Lie In April 🎹 | 3. Assassination Classroom ⚔ | 4. Kokoro Connect 🦊 | 5. Code:Breaker 🔥")
                                message.channel.send(embed4).then(message => {
                                    message.react("😃")
                                    message.react("🎹")
                                    message.react("🔥")
                                    message.react("⚔")
                                    message.react("🦊")
                                    message.awaitReactions(filter, {
                                        max: 1,
                                        time: 30000,
                                        errors: ["time"]
                                    }).then(async (collected) => {
                                        const reaction = collected.first()

                                        switch (reaction.emoji.name) {
                                            case "😃":
                                                reaction.remove(bot.user)
                                                var msg = [
                                                    "https://image.noelshack.com/fichiers/2019/08/2/1550613294-1.jpg",
                                                    "https://image.noelshack.com/fichiers/2019/08/2/1550613375-2.jpg",
                                                    "https://image.noelshack.com/fichiers/2019/08/2/1550613275-3.jpg",
                                                    "https://image.noelshack.com/fichiers/2019/08/2/1550613287-4.jpg",
                                                    "https://image.noelshack.com/fichiers/2019/08/2/1550613529-5.jpg",
                                                    "https://image.noelshack.com/fichiers/2019/08/2/1550613292-6.jpg",
                                                    "https://image.noelshack.com/fichiers/2019/08/2/1550613358-7.jpg",
                                                    "https://image.noelshack.com/fichiers/2019/08/2/1550613289-8.jpg",
                                                    "https://image.noelshack.com/fichiers/2019/08/2/1550613293-9.jpg"
                                                ]; await message.channel.send(msg)
                                                setTimeout(() => {
                                                    message.channel.bulkDelete(1)
                                                    message.channel.send("Pour les acheter faites $buy 1/2/3/4/5/6/7/8/9 par exemple")
                                                }, 120000);
                                                break

                                            case "🎹":
                                                reaction.remove(bot.user)
                                                var msg = [
                                                    "https://image.noelshack.com/fichiers/2019/08/2/1550613666-1.jpg",
                                                    "https://image.noelshack.com/fichiers/2019/08/2/1550613669-2.jpg",
                                                    "https://image.noelshack.com/fichiers/2019/08/2/1550613668-3.jpg",
                                                    "https://image.noelshack.com/fichiers/2019/08/2/1550613670-4.jpg",
                                                    "https://image.noelshack.com/fichiers/2019/08/2/1550613669-5.jpg"
                                                ]
                                                await message.channel.send(msg)
                                                setTimeout(() => {
                                                    message.channel.bulkDelete(1)
                                                    message.channel.send("Pour les acheter faites $buy 1/2/3/4/5 par exemple")
                                                }, 60000);
                                                break

                                            case "⚔":
                                                reaction.remove(bot.user)
                                                var msg = [
                                                    "https://image.noelshack.com/fichiers/2019/08/2/1550615919-1.jpg",
                                                    "https://image.noelshack.com/fichiers/2019/08/2/1550615898-2.jpg",
                                                    "https://image.noelshack.com/fichiers/2019/08/2/1550615893-3.jpg",
                                                    "https://image.noelshack.com/fichiers/2019/08/2/1550615896-4.jpg",
                                                    "https://image.noelshack.com/fichiers/2019/08/2/1550615925-5.jpg",
                                                    "https://image.noelshack.com/fichiers/2019/08/2/1550615914-6.jpg"
                                                ]
                                                message.channel.send(msg)
                                                setTimeout(() => {
                                                    message.channel.bulkDelete(1)
                                                    message.channel.send("Pour l'acheter il suffit de faire $buy ")
                                                }, 60000);
                                                break

                                            case "🦊":
                                                reaction.remove(bot.user)
                                                var msg = [
                                                    "https://image.noelshack.com/fichiers/2019/08/2/1550616302-1.jpg",
                                                    "https://image.noelshack.com/fichiers/2019/08/2/1550616297-2.jpg",
                                                    "https://image.noelshack.com/fichiers/2019/08/2/1550616297-3.jpg"
                                                ]
                                                message.channel.send(msg)
                                                setTimeout(() => {
                                                    message.channel.bulkDelete(1)
                                                    message.channel.send("Pour l'acheter il suffit de faire $buy ")
                                                }, 60000);
                                                break

                                            case "🔥":
                                                reaction.remove(bot.user)
                                                var msg = [
                                                    "https://image.noelshack.com/fichiers/2019/08/2/1550617195-1.jpg",
                                                    "https://image.noelshack.com/fichiers/2019/08/2/1550617197-2.jpg",
                                                    "https://image.noelshack.com/fichiers/2019/08/2/1550617196-3.jpg",
                                                    "https://image.noelshack.com/fichiers/2019/08/3/1550617202-4.jpg",
                                                    "https://image.noelshack.com/fichiers/2019/08/2/1550617192-5.jpg",
                                                    "https://image.noelshack.com/fichiers/2019/08/2/1550617195-6.jpg",
                                                    "https://image.noelshack.com/fichiers/2019/08/3/1550617269-7.jpg"
                                                ]
                                                message.channel.send(msg)
                                                setTimeout(() => {
                                                    message.channel.bulkDelete(1)
                                                    message.channel.send("Pour l'acheter il suffit de faire $buy ")
                                                }, 120000);
                                                break
                                        }
                                    })
                                })
                                break
                        }
                    })
                })
                break

            case "buy":
                var fil = args[0].toLowerCase()
                var file = args[1].toLowerCase()
                var img = args[2].toLowerCase()
                if (!fil || !file || !img) {
                    message.channel.send("Please specify or the type (Anime/LoL) or the champs/the anime or the image you want (TIPS : Guilty Crown => Guilty / Assassination Classroom => AC / Kokoro Connect => Kokoro / Your Lie In April => YLIP / Code:Breaker => CodeBreaker")
                } else if (fil && file && img) {
                    if (fil === "anime") {
                        var sxnd = { files: [`./achats/${fil}/${file}/${img}.jpg`] }
                        const user2 = message.author;
                        const pointsToAdd2 = parseInt(50, 10);
                        bot.points.ensure(`${message.guild.id}-${user2.id}`, {
                            user: message.author.id,
                            guild: message.guild.id,
                            points: 0,
                            level: 1
                        });
                        let userPoints2 = bot.points.get(`${message.guild.id}-${user2.id}`, "points");
                        userPoints2 -= pointsToAdd2;
                        bot.points.set(`${message.guild.id}-${user2.id}`, userPoints2, "points")
                        message.reply("I hope you won't be disappointed." + "You lost " + pointsToAdd2 + ` and now stand at ${userPoints2}`)
                        message.channel.send(sxnd)
                        setTimeout(() => {
                            message.delete(sxnd)
                        }, 30000);
                    } else if (fil === "lol") {
                        var sxnd = { files: [`./achats/${fil}/${file}/${img}.png`] }
                        const user2 = message.author;
                        const pointsToAdd2 = parseInt(50, 10);
                        bot.points.ensure(`${message.guild.id}-${user2.id}`, {
                            user: message.author.id,
                            guild: message.guild.id,
                            points: 0,
                            level: 1
                        });
                        let userPoints2 = bot.points.get(`${message.guild.id}-${user2.id}`, "points");
                        userPoints2 -= pointsToAdd2;
                        bot.points.set(`${message.guild.id}-${user2.id}`, userPoints2, "points")
                        message.reply("I hope you won't be disappointed." + "You lost " + pointsToAdd2 + ` and now stand at ${userPoints2}`)
                        message.channel.send(sxnd)
                        setTimeout(() => {
                            message.delete(sxnd)
                        }, 30000);
                    }
                }

                break

            case "buyrole":
                let rolex = args.join(" ")
                let rolef = message.guild.roles.find(r => r.name === rolex)
                if (message.author.id !== bot.user.id) {
                    if (rolef) {
                        message.channel.send(`${rolef} has been applied on you!`)
                        message.guild.members.get(message.author.id).addRole(rolef)
                    } else {
                        if (!rolex) {
                            message.channel.send("Specify your role name please!")
                        } else if (rolex) {
                            const user2 = message.author;
                            const pointsToAdd2 = parseInt(50, 10);
                            bot.points.ensure(`${message.guild.id}-${user2.id}`, {
                                user: message.author.id,
                                guild: message.guild.id,
                                points: 0,
                                level: 1
                            });
                            let userPoints2 = bot.points.get(`${message.guild.id}-${user2.id}`, "points");
                            userPoints2 -= pointsToAdd2;
                            bot.points.set(`${message.guild.id}-${user2.id}`, userPoints2, "points")
                            var embed4 = new Discord.RichEmbed()
                                .setDescription("Role menu")
                                .addField(`So you want the role **${rolex}** ? Click on the reaction for the color of your role`, "Red 🔴 ; Green 💚 ; Blue 🔷 ; Yellow 💛 ; Gold 🔶 ; Black 🖤 ; White ⬜")
                            message.channel.send(embed4).then(message => {
                                message.react("💚")
                                message.react("🔴")
                                message.react("🔷")
                                message.react("💛")
                                message.react("🔶")
                                message.react("🖤")
                                message.react("⬜")
                                message.awaitReactions(filter, {
                                    max: 1,
                                    time: 30000,
                                    errors: ["time"]
                                }).then(async (collected) => {
                                    const reaction = collected.first()
                                    switch (reaction.emoji.name) {
                                        case "💚":
                                            message.member.guild.createRole({
                                                color: "0x00FF00",
                                                name: rolex,
                                                permissions: []
                                            }).then(role => {
                                                message.channel.send(role + " role has been created ! Type the command again and you will have it ! " + "You lost " + pointsToAdd2 + ` and now stand at ${userPoints2}`)
                                            })
                                            setTimeout(() => {
                                                message.delete(embed4)
                                            }, 10000);
                                            break

                                        case "🔴":
                                            message.member.guild.createRole({
                                                color: "0xFF0000",
                                                name: rolex,
                                                permissions: []
                                            }).then(role => {
                                                message.channel.send(role + " role has been created ! Type the command again and you will have it !" + "You lost " + pointsToAdd2 + ` and now stand at ${userPoints2}`)
                                            })
                                            setTimeout(() => {
                                                message.delete(embed4)
                                            }, 10000);
                                            break

                                        case "🔷":
                                            message.member.guild.createRole({
                                                color: "0x0000FF",
                                                name: rolex,
                                                permissions: []
                                            }).then(role => {
                                                message.channel.send(role + " role has been created ! Type the command again and you will have it !" + "You lost " + pointsToAdd2 + ` and now stand at ${userPoints2}`)
                                            })
                                            setTimeout(() => {
                                                message.delete(embed4)
                                            }, 10000);
                                            break

                                        case "💛":
                                            message.member.guild.createRole({
                                                color: "0xf8ff00",
                                                name: rolex,
                                                permissions: []
                                            }).then(role => {
                                                message.channel.send(role + " role has been created ! Type the command again and you will have it !" + "You lost " + pointsToAdd2 + ` and now stand at ${userPoints2}`)
                                            })
                                            setTimeout(() => {
                                                message.delete(embed4)
                                            }, 10000);
                                            break

                                        case "🔶":
                                            message.member.guild.createRole({
                                                color: "0xeecb2e",
                                                name: rolex,
                                                permissions: []
                                            }).then(role => {
                                                message.channel.send(role + " role has been created ! Type the command again and you will have it !" + "You lost " + pointsToAdd2 + ` and now stand at ${userPoints2}`)
                                            })
                                            setTimeout(() => {
                                                message.delete(embed4)
                                            }, 10000);
                                            break

                                        case "🖤":
                                            message.member.guild.createRole({
                                                color: "0x000000",
                                                name: rolex,
                                                permissions: []
                                            }).then(role => {
                                                message.channel.send(role + " role has been created ! Type the command again and you will have it !" + "You lost " + pointsToAdd2 + ` and now stand at ${userPoints2}`)
                                            })
                                            setTimeout(() => {
                                                message.delete(embed4)
                                            }, 10000);
                                            break

                                        case "⬜":
                                            message.member.guild.createRole({
                                                color: "0xFFFFFF",
                                                name: rolex,
                                                permissions: []
                                            }).then(role => {
                                                message.channel.send(role + " role has been created ! Type the command again and you will have it !" + "You lost " + pointsToAdd2 + ` and now stand at ${userPoints2}`)
                                            })
                                            setTimeout(() => {
                                                message.delete(embed4)
                                            }, 10000);
                                            break
                                    }
                                })
                            })
                        }
                    }
                }
                break

            case "lvlup":
                const embedp = new Discord.RichEmbed()
                    .setAuthor(message.author.username, message.author.avatarURL)
                    .setColor("RANDOM")
                    .setFooter(bot.user.username, bot.user.avatarURL)
                    .addField(`This show you how many messages need to be send before level up`, `2nd level : 45 messages\n
                    3rd level : 100 messages\n
                    4th level : 178 messages\n
                    5th level : 277 messages\n
                    6th level : 400 messages\n
                    7th level : 545 messages\n
                    8th level : 711 messages\n
                    9th level : 900 messages\n
                    10th level : 1112 messages\n
                    11th level : 1345 messages\n
                    12th level : 1600 messages\n
                    Coming soon...`)
                message.channel.send(embedp)
                break
            case "xpremove":
                if (!message.member.hasPermission("ADMINISTRATOR"))
                    return message.reply("You're not the boss of me, you can't do that!");
                const user3 = message.mentions.users.first() || bot.users.get(args[0]);
                if (!user3) return message.reply("You must mention someone or give their ID!")
                const LevelToAdd = parseInt(args[1], 10);
                if (!LevelToAdd)
                    return message.reply("You didn't tell me how many points to give...")
                bot.points.ensure(`${message.guild.id}-${user3.id}`, {
                    user: message.author.id,
                    guild: message.guild.id,
                    points: 0,
                    level: 1
                });
                let userLevel = bot.points.get(`${message.guild.id}-${user3.id}`, "level");
                userLevel -= LevelToAdd;
                bot.points.set(`${message.guild.id}-${user3.id}`, userLevel, "level")
                message.channel.send(`The owner ${message.author} has removed ${LevelToAdd} level to ${user3.tag} and now this user stands at level ${userLevel}.`);
                break
            case "achievements":
                var a = 1
                var finalOuput = `**Achievements :** \n\n`
                for (var n in achievements) {
                    finalOuput += `${a} - ${achievements[n]}\n`
                    a++
                }
                const embeed = new Discord.RichEmbed()
                    .addField("Here is the list", finalOuput)
                message.channel.send(embeed)
                break

            case "gif":
                const gifGenerator = function (search) {
                    const APIkey = '&api_key=' + 'dc6zaTOxFJmzC&tag';
                    let queryURL = `https://api.giphy.com/v1/gifs/search?q=${args.join("_") + APIkey}&limit=30`
                    request(queryURL, function (err, response, body) {
                        if (err) throw err
                        const results = JSON.parse(body)
                        const randomNum = Math.floor(Math.random() * 10)

                        const gifURL = results.data[randomNum].images.fixed_height.url
                        message.channel.send(gifURL)
                            .catch(console.error)
                    });
                }
                gifGenerator()
                break

            case "ping":
                let msgping1 = new Date()
                let botping = message.createdAt - new Date()
                let msgping2 = new Date() - msgping1
                let pingembed = new Discord.RichEmbed()
                    .setColor("RANDOM")
                    .addField('API Ping : ', Math.floor(bot.ping) + 'ms')
                    .addField('Bot Ping : ', Math.floor(botping) + 'ms')
                    .addField('Message Ping : ', '~' + Math.round(msgping2) + 'ms')
                    .setTimestamp(new Date())
                    .setFooter(`requested by ${message.author.tag}`)

                message.channel.send(pingembed);
                break

            case "google":
                let suffix = args.join(' ')

                if (!suffix) {
                    message.channel.send({
                        embed: {
                            color: 0xff0000,
                            description: `Be careful, ${message.author.username}, you didn't give me anything to search`,
                            footer: {
                                text: `API Latence : ${Date.now() - message.createdTimestamp}ms`
                            }
                        }
                    })
                }
                google.resultsPerPage = 5;
                google(suffix, function (err, res) {
                    if (err) message.channel.send({
                        embed: {
                            color: 0xFF0000,
                            description: `:warning: ${message.author.username}, ${err}`,
                            footer: {
                                text: `API Latence : ${Date.now() - message.createdTimestamp}ms`
                            }
                        }
                    })
                    for (var i = 0; i < res.links.length; i++) {
                        var link = res.links[i]
                        if (!link.href) {
                            res.next
                        } else {
                            let embed = new Discord.RichEmbed()
                                .setColor("RANDOM")
                                .setDescription(`Result for ${suffix} \n**Link**: ${link.href}\n**Description**: ${link.description}`)
                            message.channel.send(embed)
                        }
                    }
                })
                break

            case "addach":
                message.channel.send("Unavailable at the moment.")
                break

            case "points":
                const key = `${message.guild.id}-${message.author.id}`;
                message.channel.send(`You currently have ${bot.points.get(key, "points")} points, and are level ${bot.points.get(key, "level")}!`);
                break

            case "msglead":
                if (args.join(' ') == "10") {
                    var i = 1
                    const filtered = bot.points.filter(p => p.guild === message.guild.id).array()
                    const sorted = filtered.sort((a, b) => b.points - a.points)
                    const top10 = sorted.splice(0, 10);
                    const embed3 = new Discord.RichEmbed()
                        .setTitle("**__Leaderboard__**\n**Our top 10 points leaders !**")
                        .setAuthor(bot.user.username, bot.user.avatarURL)
                        .setColor(0x00AE86)
                        .setFooter(`Ranking : 666 - Points : ${bot.points.get(`${message.guild.id}-${message.author.id}`, "points")}`)
                    for (const data of top10) {
                        embed3.addField(`[${i}]  > ${bot.users.get(data.user).tag}`, `Total points : ${data.points} Level : ${data.level}`)
                        i++
                    }
                    message.channel.send(embed3);
                } else if (args.join(' ') == "20") {
                    var i = 11
                    const filtered = bot.points.filter(p => p.guild === message.guild.id).array()
                    const sorted = filtered.sort((a, b) => b.points - a.points);
                    const top20 = sorted.splice(10, 20);
                    const embed3 = new Discord.RichEmbed()
                        .setTitle("Leaderboard")
                        .setAuthor(bot.user.username, bot.user.avatarURL)
                        .setDescription("Our top 11-20 points leaders!")
                        .setColor(0x00AE86);
                    for (const data of top20) {
                        embed3.addField(`${i} - ${bot.users.get(data.user).tag}`, `${data.points} points (level ${data.level})`);
                        embed3.setFooter(`Ranking : 666 - Points : ${bot.points.get(`${message.guild.id}-${message.author.id}`, "points")}`)
                        i++
                    }
                    message.channel.send(embed3);
                } else if (!args.join(' ') || args.join(' ') < 10 || args.join(' ') > 20 || args.join(' ') >= 11 || args.join(' ') <= 19) return message.channel.send("Type 10 or 20 after please !")
                break

            case "give":
                if (!message.member.hasPermission("ADMINISTRATOR"))
                    return message.reply("You're not the boss of me, you can't do that!");
                const user = message.mentions.users.first() || bot.users.get(args[0]);
                if (!user) return message.reply("You must mention someone or give their ID!");
                const pointsToAdd = parseInt(args[1], 10);
                if (!pointsToAdd)
                    return message.reply("You didn't tell me how many points to give...")
                bot.points.ensure(`${message.guild.id}-${user.id}`, {
                    user: message.author.id,
                    guild: message.guild.id,
                    points: 0,
                    level: 1
                });
                let userPoints = bot.points.get(`${message.guild.id}-${user.id}`, "points");
                userPoints += pointsToAdd;
                bot.points.set(`${message.guild.id}-${user.id}`, userPoints, "points")
                message.channel.send(`The owner ${message.author} has added ${pointsToAdd} points to ${user.tag} and now this user stands at ${userPoints} points.`);
                break

            case "remove":
                if (!message.member.hasPermission("ADMINISTRATOR"))
                    return message.reply("You're not the boss of me, you can't do that!");
                const user2 = message.mentions.users.first() || bot.users.get(args[0]);
                if (!user2) return message.reply("You must mention someone or give their ID!");
                const pointsToAdd2 = parseInt(args[1], 10);
                if (!pointsToAdd2)
                    return message.reply("You didn't tell me how many points to give...")
                bot.points.ensure(`${message.guild.id}-${user2.id}`, {
                    user: message.author.id,
                    guild: message.guild.id,
                    points: 0,
                    level: 1
                });
                let userPoints2 = bot.points.get(`${message.guild.id}-${user2.id}`, "points");
                userPoints2 -= pointsToAdd2;
                bot.points.set(`${message.guild.id}-${user2.id}`, userPoints2, "points")
                message.channel.send(`The owner ${message.author} has removed ${pointsToAdd2} points to ${user2.tag} and now this user stands at ${userPoints2} points.`);
                break

            case "cleanup":
                const filtered2 = bot.points.filter(p => p.guild === message.guild.id);
                const rightNow = new Date();
                const toRemove = filtered2.filter(data => {
                    return !message.guild.members.has(data.user) || rightNow - 2592000000 > data.lastSeen;
                });
                toRemove.forEach(data => {
                    bot.points.delete(`${message.guild.id}-${data.user}`);
                });
                message.channel.send(`I've cleaned up ${toRemove.size} old farts.`);
                break

            case "invlead":
                let invites = await message.guild.fetchInvites().catch(error => {
                    return message.channel.send('Sorry, I don\'t have the proper permissions to view invites!')
                });

                invites = invites.array()

                var x = 1

                let possibleinvites = []
                invites.forEach(function (invites) {
                    possibleinvites.push(`-${x}- ${invites.inviter.username} ||  ${invites.uses} || ${invites.code} \n`)
                    x = x + 1
                })

                const embed = new Discord.RichEmbed()
                    .setTitle(`**𝔻𝕐ℕ𝔸𝕊𝕋𝕐 𝙗𝙤𝙩 𝘼𝙜𝙚𝙣𝙘𝙮**`)
                    .setDescription("**Invite Leaderboard**")
                    .setColor(0xCB5A5E)
                    .addField('Invites', `\`\`${possibleinvites.join('\n')}\`\``)
                    .setTimestamp()
                message.channel.send(embed)
                break

            case "ach":
                var a = 0
                for (var n in achievements) {
                    a++
                }
                message.channel.send(`You succeeded ${list[message.author.id].author} achievements on ${a}`)
                break

            case "help":
                let msg = await message.reply("Here you can find out some help with many commands ! \nWait command's loading...")
                setTimeout(() => {
                    const embeded = new Discord.RichEmbed()
                        .setTitle("__𝔻𝕐ℕ𝔸𝕊𝕋𝕐 𝙗𝙤𝙩 𝘼𝙜𝙚𝙣𝙘𝙮__")
                        .setColor("RANDOM")
                        .setDescription("**You'll find your pleasure here**")
                        .setFooter(`𝔻𝕐ℕ𝔸𝕊𝕋𝕐 - 𝐂𝐫𝐞́𝐞 𝐩𝐚𝐫 𝐄𝐭𝐞𝐫𝐧𝐚𝐥𝐑𝐚𝐭`)
                        .setThumbnail(message.guild.iconURL)
                        .setTimestamp()
                        .addField(":robot: Ranking System :", "`xpremove, give, remove, cleanup, msglead, invlead`")
                        .addField(":tada: Fun commands :", "`google, gif`")
                        .addField(":first_place: Special commands :", "`achievements, addach, ach`")
                        .addField(":department_store: Shop :", "`shop, buyrole, buy`")
                        .addField("For more infos type :", "$info [commands]")
                    message.channel.send(embeded)
                    msg.delete()
                }, 5000)
                break

            case "info":
                if (args[0] === "ach") {
                    var phrase = "You can see how many achievements you succeeded"
                }
                if (args[0] === "shop") {
                    var phrase = "See the shop (preview) menu for lol/anime"
                }
                if (args[0] === "buy") {
                    var phrase = "Buy some images from lol/anime"
                }
                if (args[0] === "buyrole") {
                    var phrase = "Buy your own custom role with 6 colors and with a custom name ! But when you'll do this command you'll loose 50 pts so be fast!"
                }
                if (args[0] === "msglead") {
                    var phrase = "Leaderboard for users' message"
                }
                if (args[0] === "invlead") {
                    var phrase = "Leaderboard for invitation"
                }
                if (args[0] === "achievements") {
                    var phrase = "Take a look on the list of achievements"
                }
                if (args[0] === "addach") {
                    var phrase = "Unwork actually => Adding an achievements with this commands"
                }
                if (args[0] === "google") {
                    var phrase = "Do a research on google with your own words"
                }
                if (args[0] === "cleanup") {
                    var phrase = "Clean the leaderboard for inactive's users since 1 month"
                }
                if (args[0] === "give") {
                    var phrase = "Only for boss => Giving points"
                }
                if (args[0] === "remove") {
                    var phrase = "Only for boss => Removing points"
                }
                if (args[0] === "xpremove") {
                    var phrase = "Only for boss => Removing level"
                }
                if (args[0] === "points") {
                    var phrase = "Show your count of points"
                }
                message.reply(phrase)
                break

            default:
                message.reply("This isn't a command ! Specify $help !")
                break
        }
    }

    if (message.content.startsWith(prefix + cmd)) {
        setTimeout(() => {
            if (!botfinish[message.author.id]) {
                message.reply("Congratulations ! You finished an achievements, you used the bot for the first time !")
                botfinish[message.author.id] = {
                    author: 0
                }

                botfinish[message.author.id].author++
                list[message.author.id].author++

                fs.writeFile(`./Achievements/list.json`, JSON.stringify(list), (err) => {
                    if (err) console.log(err)
                });
                fs.writeFile(`./Achievements/bot.json`, JSON.stringify(botfinish), (err) => {
                    if (err) console.log(err)
                })
            }
        }, 10000)
    }

    if (message.content == message.guild.emojis.map(e => e.toString()).join(" ")) {
        if (!emj[message.author.id]) {
            message.reply("Congratulations ! You finished an achievements, you sent an emoji for the first time !")
            emj[message.author.id] = {
                author: 0
            }
            emj[message.author.id].author++
            list[message.author.id].author++

            fs.writeFile(`./Achievements/list.json`, JSON.stringify(list), (err) => {
                if (err) console.log(err)
            });
            fs.writeFile(`./Achievements/emoji.json`, JSON.stringify(emj), (err) => {
                if (err) console.log(err)
            });
        }
    }

    if (!fm[message.author.id]) {

        setTimeout(() => {
            message.reply("Congratulations ! You finished an achievements, you spoke for the first time !")
            fm[message.author.id] = {
                author: 0
            }
            fm[message.author.id].author++
            list[message.author.id].author++

            fs.writeFile(`./Achievements/list.json`, JSON.stringify(list), (err) => {
                if (err) console.log(err)
            });
            fs.writeFile(`./Achievements/message.json`, JSON.stringify(fm), (err) => {
                if (err) console.log(err)
            });
        }, 5000);
    }

    if (bot.points.get(`${message.guild.id}-${message.author.id}`, "points") === 100) {
        setTimeout(() => {
            message.channel.send("Congratulations ! You finished an achievements, you spoke like 100 times in this server !")
            list[message.author.id].author++
            fs.writeFile(`./Achievements/list.json`, JSON.stringify(list), (err) => {
                if (err) console.log(err)
            });
        }, 5000)
    }

    if (curLevel === 5) {
        if (!px[message.author.id]) {
            message.reply("Congratulations you're now level 5, you succeeded another achievements !")
            px[message.author.id] = {
                author: 0
            }
            px[message.author.id].author++
            list[message.author.id].author++

            fs.writeFile(`./Achievements/list.json`, JSON.stringify(list), (err) => {
                if (err) console.log(err)
            })
            fs.writeFile(`./Achievements/exp.json`, JSON.stringify(px), (err) => {
                if (err) console.log(err)
            })
        }
    }

    if (curLevel === 10) {
        if (px[message.author.id] == { author: 1 }) {
            message.reply("Congratulations you're now level 10, you succeeded another achievements !")
            px[message.author.id].author++
            list[message.author.id].author++

            fs.writeFile(`./Achievements/list.json`, JSON.stringify(list), (err) => {
                if (err) console.log(err)
            })
            fs.writeFile(`./Achievements/exp.json`, JSON.stringify(px), (err) => {
                if (err) console.log(err)
            })
        }
    }

    if (curLevel === 15) {
        if (px[message.author.id] == { author: 2 }) {
            message.reply("Congratulations you're now level 15, you succeeded another achievements !")
            px[message.author.id].author++
            list[message.author.id].author++

            fs.writeFile(`./Achievements/list.json`, JSON.stringify(list), (err) => {
                if (err) console.log(err)
            })
            fs.writeFile(`./Achievements/exp.json`, JSON.stringify(px), (err) => {
                if (err) console.log(err)
            })
        }
    }

    if (curLevel === 20) {
        if (px[message.author.id] === { author: 3 }) {
            message.reply("Congratulations you're now level 20, you succeeded another achievements !")
            px[message.author.id].author++
            list[message.author.id].author++

            fs.writeFile(`./Achievements/list.json`, JSON.stringify(list), (err) => {
                if (err) console.log(err)
            })
            fs.writeFile(`./Achievements/exp.json`, JSON.stringify(px), (err) => {
                if (err) console.log(err)
            })
        }
    }

})

bot.login(Token)