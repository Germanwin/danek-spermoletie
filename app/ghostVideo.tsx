"use client"

import { useEffect, useRef } from "react"
import { useMute } from "./MuteContext"

export const GhostVideo = () => {
	const { isMuted } = useMute()
	const videoRef = useRef<HTMLVideoElement>(null)
	const hasStarted = useRef(false)

	useEffect(() => {
		const video = videoRef.current
		if (!video || hasStarted.current) return

		hasStarted.current = true
		video.muted = true
		video.play().then(() => {
			video.muted = isMuted
		}).catch(() => {})
	}, [isMuted])

	useEffect(() => {
		const video = videoRef.current
		if (!video || !hasStarted.current) return
		video.muted = isMuted
	}, [isMuted])

	return (
		<video
			ref={videoRef}
			style={{ position: "fixed", width: "0px", height: "0px", opacity: "0" }}
			src="/goofy.mp4"
			playsInline
			preload="auto"
		/>
	)
}
