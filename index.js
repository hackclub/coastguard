const Botkit = require('botkit')
const redisStorage = require('botkit-storage-redis')

const controller = new Botkit.slackbot({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  clientSigningSecret: process.env.SIGNING_SECRET,
  scopes: ['bot', 'chat:write:bot'],
  storage: redisStorage({ url: process.env.REDISCLOUD_URL }),
  debug: true
})

controller.spawn({ token: process.env.ACCESS_TOKEN })

controller.setupWebserver(process.env.PORT || 3000, (err, webserver) => {
  controller.createWebhookEndpoints(controller.webserver)
  controller.createOauthEndpoints(controller.webserver)
})

controller.hears('', 'ambient', (bot, message) => {
  const { ts, channel, text } = message.event

  if (
    !hasUrl(message.event.text) &&
    message.event.thread_ts === undefined &&
    (channel === 'CQPG0EUD8' || channel === 'C0M8PUPU6')
  ) {
    bot.api.chat.delete({ token: process.env.ACCESS_TOKEN, channel, ts })
    bot.whisper(
      message,
      `Ahoy Matey! You posted a message without a file or URL:\n\n"${text}"\n\nI’ve removed your post for the time being, but you can repost a shipped project with a file or URL and I’ll let it be. Let <@U0C7B14Q3> know if you have any questions or if I made a mistake.`
    )
  }
})

const hasUrl = message => (
  new RegExp(
    '([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?'
  ).test(message)
)
