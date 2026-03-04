"use client"

import { useMute } from "./MuteContext"

export const GhostVideo = () => {
	const { isMuted } = useMute()

	return (
		<video
			style={{ position: "fixed", width: "0px", height: "0px", opacity: "0" }}
			src="/goofy.mp4"
			autoPlay
			playsInline
			controls
			muted={isMuted}
			preload="auto"
		/>
	)
}
