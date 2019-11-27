const Botkit = require('botkit')

const controller = new Botkit.slackbot({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  clientSigningSecret: process.env.SIGNING_SECRET,
  scopes: ['bot', 'chat:write:bot'],
  debug: false
})

controller.spawn({
  token: process.env.ACCESS_TOKEN
})

controller.setupWebserver(process.env.PORT || 3000, (err, webserver) => {
  controller.createWebhookEndpoints(controller.webserver)
  controller.createOauthEndpoints(controller.webserver)
})

controller.hears('', 'ambient', (bot, message) => {
  const user = message.event.user
  const ts = message.event.ts
  const channel = message.event.channel
  if (channel === 'GQSP5A4HF') console.log(message)

  if (
    !hasUrl(message.event.text) &&
    message.event.thread_ts === undefined &&
    channel === 'GQSP5A4HF'
  ) {
    bot.api.chat.delete({
      token: process.env.ACCESS_TOKEN,
      channel: channel,
      ts: ts
    })

    bot.whisper(
      message,
      `Ahoy Matey! Ye posted a message with 'ot a file ore URL.\n\nI've removed yer post fer the time bein', but ye can repost a shipped project with a file or URL an I'll let it be. Let <@U0C7B14Q3> know if a made a mistaeke.`
    )
  }
  //console.log(`${message.event.text}, ${message.event.channel}`)
})

const hasUrl = message => {
  return new RegExp(
    '([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?'
  ).test(message)
}
