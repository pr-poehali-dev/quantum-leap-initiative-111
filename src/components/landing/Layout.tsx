import { ReactNode } from 'react'
import { Squares } from "./squares-background"

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="h-screen overflow-hidden bg-black relative">
      <div className="absolute inset-0 z-10">
        <Squares
          direction="diagonal"
          speed={0.5}
          squareSize={40}
          borderColor="#1a1a1a"
          hoverFillColor="#FF4D00"
        />
      </div>
      <div className="relative z-20 h-full">
        <header className="fixed top-0 left-0 z-30 p-6 flex items-center gap-3">
          <img
            src="https://cdn.poehali.dev/projects/34462cba-1475-45a6-9700-2b02907285ab/files/71af1e8b-521b-45e1-b8fc-8e914e0afc60.jpg"
            alt="От А до Я"
            className="w-10 h-10 rounded-lg object-cover"
          />
          <span className="text-white font-bold text-lg tracking-wide">
            от <span style={{ color: '#FF4D00' }}>А</span> до <span style={{ color: '#FF4D00' }}>Я</span>
          </span>
        </header>
        {children}
      </div>
    </div>
  )
}