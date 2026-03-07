'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

export default function CoinCounter({ value }: { value: number }) {
  const spring = useSpring(value, { damping: 20, stiffness: 100 })
  const display = useTransform(spring, v => Math.round(v).toLocaleString('fr-FR'))
  const [displayValue, setDisplayValue] = useState(value.toLocaleString('fr-FR'))

  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  useEffect(() => {
    const unsub = display.on('change', v => setDisplayValue(v))
    return unsub
  }, [display])

  return <span>{displayValue}</span>
}
