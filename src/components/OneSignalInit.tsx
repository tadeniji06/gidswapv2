"use client";

import { useEffect } from "react";
import OneSignal from "react-onesignal";

export default function OneSignalInit() {
	useEffect(() => {
		// Only run on client side
		if (typeof window !== "undefined") {
			const runOneSignal = async () => {
				try {
					await OneSignal.init({
						appId: "e328ec17-e8ca-4034-a504-4afc282627b7",
						allowLocalhostAsSecureOrigin: true, // Allows testing on localhost
						notifyButton: {
							enable: true,
							prenotify: true,
							showCredit: false,
							text: {
								"tip.state.unsubscribed":
									"Subscribe to notifications",
								"tip.state.subscribed":
									"You're subscribed to notifications",
								"tip.state.blocked": "You've blocked notifications",
								"message.action.subscribed":
									"Thanks for subscribing!",
								"message.action.resubscribed":
									"You're subscribed to notifications",
								"message.action.unsubscribed":
									"You won't receive notifications again",
								"dialog.main.title": "Manage Notifications",
								"dialog.main.button.subscribe": "SUBSCRIBE",
								"dialog.main.button.unsubscribe": "UNSUBSCRIBE",
								"dialog.blocked.title": "Unblock Notifications",
								"dialog.blocked.message":
									"Follow these instructions to allow notifications:",
								"message.action.subscribing": "Subscribing...",
								"message.prenotify":
									"Click to subscribe to notifications",
							},
						},
					});

					// Optionally show the prompt automatically
					// await OneSignal.Slidedown.promptPush();
				} catch (error) {
					console.error("OneSignal initialization error:", error);
				}
			};

			runOneSignal();
		}
	}, []);

	return null;
}
