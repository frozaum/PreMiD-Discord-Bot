import * as Discord from "discord.js";
import { Ticket } from "../classes/Ticket";
import channels from "../../../channels";
import roles from "../../../roles";
import config from "../../../config";

module.exports = async (message: Discord.Message) => {
	if (message.author.bot) return;

	let t = new Ticket();

	const ticketFound = await t.fetch("channel", message.channel.id);

	if (
		!ticketFound &&
		message.channel.id === channels.supportChannel &&
		!message.author.bot
	) {
		if (message.cleanContent.length > 25) {
			t.create(message);
		} else {
			message.delete();
			(await message.reply("Please write at least 25 characters.")).delete({
				timeout: 10 * 1000
			});
		}

		return;
	}

	if (ticketFound && message.content.startsWith(`${config.prefix}close`)) {
		if (
			message.member.roles.has(roles.ticketManager) ||
			message.member.permissions.has("ADMINISTRATOR")
		)
			t.close(
				message.content
					.split(" ")
					.slice(1, message.content.split(" ").length)
					.join(" ")
			);
		else t.close();
		return;
	}

	if (
		ticketFound &&
		message.content.startsWith("<<") &&
		(message.member.roles.has(roles.ticketManager) ||
			message.member.permissions.has("ADMINISTRATOR"))
	) {
		t.removeSupporter(message.member);
		message.delete();
		return;
	}

	if (
		ticketFound &&
		message.content.startsWith(">>") &&
		(message.member.roles.has(roles.ticketManager) ||
			message.member.permissions.has("ADMINISTRATOR"))
	) {
		const args = message.content
			.split(" ")
			.slice(1, message.content.split(" ").length);
		if (args.length === 0) return;
		const userToAdd = message.guild.members.find(
			m =>
				(m.id === args.join(" ") || m.displayName === args.join(" ")) &&
				(message.member.roles.has(roles.ticketManager) ||
					message.member.permissions.has("ADMINISTRATOR"))
		);
		t.addSupporter(userToAdd);
		message.delete();
		return;
	}

	if (
		ticketFound &&
		!message.content.startsWith("<<") &&
		(message.member.roles.has(roles.ticketManager) ||
			message.member.permissions.has("ADMINISTRATOR"))
	) {
		t.addSupporter(message.member);
		return;
	}
};
