import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import Section from './Section'
import Layout from './Layout'
import { sections } from './sections'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Icon from '@/components/ui/icon'

const CLICKS_URL = 'https://functions.poehali.dev/f01c82f2-d2e3-4373-bd36-f33792630a8c'

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState(0)
  const [targetUrl, setTargetUrl] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [saved, setSaved] = useState(false)
  const [clicks, setClicks] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ container: containerRef })
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollPosition = containerRef.current.scrollTop
        const windowHeight = window.innerHeight
        const newActiveSection = Math.floor(scrollPosition / windowHeight)
        setActiveSection(newActiveSection)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  const handleNavClick = (index: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: index * window.innerHeight,
        behavior: 'smooth'
      })
    }
  }

  const fetchClicks = async () => {
    const res = await fetch(CLICKS_URL)
    const data = await res.json()
    setClicks(data.total)
  }

  useEffect(() => {
    fetchClicks()
    const interval = setInterval(fetchClicks, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleSave = () => {
    const url = inputValue.trim()
    if (!url) return
    setTargetUrl(url.startsWith('http') ? url : 'https://' + url)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleClick = async (url: string) => {
    window.open(url, '_blank')
    await fetch(CLICKS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    })
    fetchClicks()
  }

  return (
    <Layout>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col gap-2 items-center w-[90vw] max-w-lg">
        {clicks !== null && (
          <div className="flex items-center gap-2 bg-black/70 border border-[#FF4D00]/30 backdrop-blur-md rounded-xl px-4 py-2 text-sm text-white/80 self-end">
            <Icon name="MousePointerClick" size={14} className="text-[#FF4D00]" />
            <span>Переходов: <strong className="text-white">{clicks}</strong></span>
          </div>
        )}
        <div className="flex items-center gap-2 bg-black/80 border border-white/10 backdrop-blur-md rounded-2xl px-4 py-3 shadow-2xl w-full">
          <Icon name="Link" size={18} className="text-[#FF4D00] shrink-0" />
          <Input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="Вставьте ссылку для рекламы..."
            className="bg-transparent border-none text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 h-8 p-0 text-sm"
          />
          <Button
            size="sm"
            onClick={handleSave}
            className="bg-[#FF4D00] hover:bg-[#ff6a20] text-white shrink-0 h-8 px-4 text-sm"
          >
            {saved ? <Icon name="Check" size={14} /> : 'Применить'}
          </Button>
        </div>
      </div>
      <nav className="fixed top-0 right-0 h-screen flex flex-col justify-center z-30 p-4">
        {sections.map((section, index) => (
          <button
            key={section.id}
            className={`w-3 h-3 rounded-full my-2 transition-all ${
              index === activeSection ? 'bg-white scale-150' : 'bg-gray-600'
            }`}
            onClick={() => handleNavClick(index)}
          />
        ))}
      </nav>
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-white origin-left z-30"
        style={{ scaleX }}
      />
      <div
        ref={containerRef}
        className="h-full overflow-y-auto snap-y snap-mandatory"
      >
        {sections.map((section, index) => (
          <Section
            key={section.id}
            {...section}
            isActive={index === activeSection}
            targetUrl={targetUrl}
            onButtonClick={targetUrl ? handleClick : undefined}
          />
        ))}
      </div>
    </Layout>
  )
}