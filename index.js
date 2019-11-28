const Botkit = require('botkit')

const controller = new Botkit.slackbot({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  clientSigningSecret: process.env.SIGNING_SECRET,
  scopes: ['bot', 'chat:write:bot']
})

controller.spawn({
  token: process.env.ACCESS_TOKEN
})

controller.setupWebserver(process.env.PORT || 3000, (err, webserver) => {
  controller.createWebhookEndpoints(controller.webserver)
  controller.createOauthEndpoints(controller.webserver)
})

controller.hears('', 'ambient', (bot, message) => {
  const ts = message.event.ts
  const channel = message.event.channel
  const text = message.event.text

  if (
    !hasUrl(message.event.text) &&
    message.event.thread_ts === undefined &&
    (channel === 'GQSP5A4HF' || channel === 'CQPG0EUD8' || channel === 'C0M8PUPU6')
  ) {
    bot.api.chat.delete({
      token: process.env.ACCESS_TOKEN,
      channel: channel,
      ts: ts
    })

    bot.whisper(
      message,
      `Ahoy Matey! You posted a message without a file or URL:\n\n"${text}"\n\nI've removed your post for the time being, but you can repost a shipped project with a file or URL an I'll let it be. Let <@U0C7B14Q3> know if you have any questions ore if a made a mistake.`
    )
  }
})

const hasUrl = message => {
  return new RegExp(
    '([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?'
  ).test(message)
}
