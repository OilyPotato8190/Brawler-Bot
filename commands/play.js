const { QueryType } = require('discord-player');

module.exports = {
   name: 'play',
   aliases: ['p'],
   description: 'Joins and plays a video from youtube',
   async execute(message, args) {
      if (!this.interactions) this.interactions = [];

      interactionFound = this.interactions.find(
         (element) =>
            element.authorId === message.author.id && element.channelId === message.channel.id
      );

      if (interactionFound && !(message.content <= 5 && message.content >= 1)) {
         return;
      }

      if (!args[0]) return await message.reply('include what you want to play');

      const res = await player.search(args.join(' '), {
         requestedBy: message.member,
         searchEngine: QueryType.AUTO,
      });

      if (!res || !res.tracks.length) return message.reply('no results found');

      const queue = await player.createQueue(message.guild, {
         metadata: message.channel,
      });

      try {
         if (!queue.connection) await queue.connect(message.member.voice.channel);
      } catch {
         await player.deleteQueue(message.guild.id);
         return message.reply('was not able to join your vc');
      }

      this.interactions.push({ authorId: message.author.id, channelId: message.channel.id });

      let choicesString = `**1:** ${res.tracks[0].title} (${res.tracks[0].duration})\n`;

      if (!res.tracks[1]) return play();

      if (res.tracks[1]) {
         choicesString += `**2:** ${res.tracks[1].title} (${res.tracks[1].duration})\n`;
      } else if (res.tracks[2]) {
         choicesString += `**3:** ${res.tracks[2].title} (${res.tracks[2].duration})\n`;
      } else if (res.tracks[3]) {
         choicesString += `**4:** ${res.tracks[3].title} (${res.tracks[3].duration})\n`;
      } else if (res.tracks[4]) {
         choicesString += `**5:** ${res.tracks[4].title} (${res.tracks[4].duration})`;
      }

      message.reply(choicesString).then(() => {
         songChoices = message.channel.lastMessage;
      });

      const filter = (m) =>
         m.content.includes(client.prefix + (this.name || this.aliases)) &&
         m.content <= 5 &&
         m.content >= 1;

      message.channel
         .awaitMessages({
            filter,
            max: 1,
            time: 10000,
            errors: ['time'],
         })

         .then(() => {
            message.reply('thats crazy you answered');
         })

         .catch((error) => {
            message.reply('you took too long');
            songChoices.delete();
         });

      async function play() {
         res.playlist ? queue.addTracks(res.tracks) : queue.addTrack(res.tracks[0]);

         if (!queue.playing) await queue.play();
      }
   },
};
