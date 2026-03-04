"use client"

import { useEffect, useRef } from "react"
import { useMute } from "./MuteContext"

export const GhostVideo = () => {
	const { isMuted } = useMute()
	const videoRef = useRef<HTMLVideoElement>(null)
	const startedRef = useRef(false)

	useEffect(() => {
		const video = videoRef.current
		if (!video) return

		const tryPlay = () => {
			if (startedRef.current) return
			startedRef.current = true
			video.muted = isMuted
			video.play().catch(() => {
				startedRef.current = false
			})
		}

		document.addEventListener("click", tryPlay, { once: true })
		document.addEventListener("touchstart", tryPlay, { once: true })
		document.addEventListener("keydown", tryPlay, { once: true })

		return () => {
			document.removeEventListener("click", tryPlay)
			document.removeEventListener("touchstart", tryPlay)
			document.removeEventListener("keydown", tryPlay)
		}
	}, [isMuted])

	useEffect(() => {
		if (videoRef.current && startedRef.current) {
			videoRef.current.muted = isMuted
		}
	}, [isMuted])

	return (
		<video
			ref={videoRef}
			style={{ position: "fixed", width: "1px", height: "1px", opacity: "0.01" }}
			src="/goofy.mp4"
			playsInline
			preload="auto"
		/>
	)
}
