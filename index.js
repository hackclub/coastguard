const { App } = require('@slack/bolt')

const app = new App({
	signingSecret: process.env.SIGNING_SECRET,
	token: process.env.BOT_TOKEN
});

app.event('message', async body => {
	if (!hasUrl(body.event.text)
		&& typeof body.event.thread_ts === 'undefined'
		&& (body.event.channel === 'CQPG0EUD8' || body.event.channel === 'C0M8PUPU6')
		&& body.event.subtype !== 'message_deleted') {
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
});

const hasUrl = message => (
	new RegExp(
		'([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?'
	).test(message)
);

(async () => {
	await app.start(process.env.PORT || 3000);
	console.log("⚡️ Bolt app is running!");
})();