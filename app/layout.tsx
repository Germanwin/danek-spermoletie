import type { Metadata } from "next"
import "./globals.css"
import NavBar from "./NavBar"
import FloatingEmojis from "./FloatingEmojis"
import { GhostVideo } from "./ghostVideo"
import { MuteProvider } from "./MuteContext"

export const metadata: Metadata = {
	title: "💩 ДЕНЬ СПЕРМОЛЕТИЯ ДАНЕЧКИ 💩",
	description: "С днём рождения, Даниил Спермоед!",
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="ru">
			<body>
				<MuteProvider>
					<NavBar />
					<FloatingEmojis />
					<div className="page-wrapper">{children}</div>
					<GhostVideo />
				</MuteProvider>
			</body>
		</html>
	)
}
