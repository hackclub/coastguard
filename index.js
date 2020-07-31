const { App } = require('@slack/bolt')
const AirtablePlus = require('airtable-plus')
const cheerio = require('cheerio')
const axios = require('axios')

const app = new App({
  signingSecret: process.env.SIGNING_SECRET,
  token: process.env.BOT_TOKEN
});

const shipsTable = new AirtablePlus({
  apiKey: process.env.AIRTABLE_API_KEY,
  baseID: 'appnzwlmqTft69NhW',
  tableName: 'Ships'
})

app.event('message', async body => {
  if ((body.event.channel === 'CQPG0EUD8' || body.event.channel === 'C0M8PUPU6') && typeof body.message.thread_ts === 'undefined') {
    if (!hasUrl(body.event.text)
      && body.event.subtype !== 'message_deleted' && body.event.files === undefined
      && body.message.text !== `<@${body.message.user}> has joined the channel`) {
      await app.client.chat.delete({
        token: process.env.OAUTH_TOKEN,
        channel: body.event.channel,
        ts: body.event.event_ts
      })
      await app.client.chat.postEphemeral({
        token: process.env.BOT_TOKEN,
        attachments: [],
        channel: body.event.channel,
        text: `Ahoy Matey! You posted a message without a file or URL:\n\n"${body.event.text}"\n\nI’ve removed your message, but you can repost a shipped project with a file or URL and I’ll let it be. Let <@U4QAK9SRW> know if you have any questions or if I made a mistake.`,
        user: body.event.user
      })
    }
  }
});

const logShip = async (ts, userId, message, imageUrl, projectUrl) => {
  let userInfo = await app.client.users.info({
    token: process.env.BOT_TOKEN,
    user: userId
  })
  let username = `@${userInfo.user.name}`
  let avatar = userInfo.user.profile.image_192

  let profile = await app.client.users.profile.get({
    token: process.env.BOT_TOKEN,
    user: userId
  })

  let website
  try {
    website = profile.profile.fields['Xf5LNGS86L'].value
  } catch { }

  let d = new Date(ts * 1000)

  shipsTable.create({
    'Timestamp': d.toISOString(),
    'Message': message,
    'User ID': userId,
    'User Name': username,
    'User Avatar': avatar,
    'User Website': website,
    'Image URL': imageUrl,
    'Project URL': projectUrl,
    'Public': true
  })
}

const hasUrl = message => (
  new RegExp(
    '([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?'
  ).test(message)
);

const findUrl = message => {
  let url = message.match(/<.*>/)[0]
  return url.slice(1, url.indexOf('|'))
};

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ Bolt app is running!");
})();
