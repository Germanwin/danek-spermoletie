"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type MuteContextType = {
	isMuted: boolean
	setIsMuted: (value: boolean) => void
	toggleMute: () => void
}

const MuteContext = createContext<MuteContextType | null>(null)

export function MuteProvider({ children }: { children: ReactNode }) {
	const [isMuted, setIsMuted] = useState(false)

	const toggleMute = () => setIsMuted((prev) => !prev)

	return (
		<MuteContext.Provider value={{ isMuted, setIsMuted, toggleMute }}>
			{children}
		</MuteContext.Provider>
	)
}

export function useMute() {
	const context = useContext(MuteContext)
	if (!context) {
		throw new Error("useMute must be used within a MuteProvider")
	}
	return context
}
