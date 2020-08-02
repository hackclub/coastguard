const { App } = require('@slack/bolt')

const app = new App({
  signingSecret: process.env.SIGNING_SECRET,
  token: process.env.BOT_TOKEN
})

app.event('message', async body => {
  if (
    (body.event.channel === 'CQPG0EUD8' ||
      body.event.channel === 'C0M8PUPU6') &&
    (typeof body.message.thread_ts === 'undefined' ||
      body.event.subtype === 'thread_broadcast')
  ) {
    if (
      (!hasUrl(body.event.text) &&
        body.event.subtype !== 'message_deleted' &&
        body.event.files === undefined &&
        body.message.text !==
        `<@${body.message.user}> has joined the channel`) ||
      body.event.subtype == 'thread_broadcast'
    ) {
      await app.client.chat.delete({
        token: process.env.OAUTH_TOKEN,
        channel: body.event.channel,
        ts: body.event.event_ts,
        broadcast_delete: true //if it's a threaded message, leave it in the thread
      })
      if (!body.event.hasOwnProperty('thread_ts')) {
        //check if it's a threaded message
        await app.client.chat.postEphemeral({
          token: process.env.BOT_TOKEN,
          attachments: [],
          channel: body.event.channel,
          text: `Ahoy Matey! You posted a message without a file or URL:\n\n"${body.event.text}"\n\nI’ve removed your message, but you can repost a shipped project with a file or URL and I’ll let it be. Let <@U4QAK9SRW> know if you have any questions or if I made a mistake.`,
          user: body.event.user
        })
      } else {
        await app.client.chat.postEphemeral({
          token: process.env.BOT_TOKEN,
          attachments: [],
          channel: body.event.channel,
          user: body.event.user,
          text: `Ahoy matey! You posted a message in a thread and sent it to the channel - I've removed your message from the channel (as it's reserved for ships), but left it in the thread. Let <@U4QAK9SRW> know if you have any questions or if I made a mistake.`
        })
      }
    }
  }
})

const hasUrl = message =>
  new RegExp(
    '([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?'
  ).test(message)

const findUrl = message => {
  let url = message.match(/<.*>/)[0]
  return url.slice(1, url.indexOf('|'))
}

(async () => {
  await app.start(process.env.PORT || 3000)
  console.log('⚡️ Bolt app is running!')
})()
