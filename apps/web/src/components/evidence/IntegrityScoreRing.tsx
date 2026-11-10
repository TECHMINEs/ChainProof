"use client"
import React from 'react'

export interface IntegrityScoreRingProps {
  score: number;
  size?: number;
}

export function IntegrityScoreRing({ score, size = 100 }: IntegrityScoreRingProps) {
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = 'text-green-500';
  if (score < 100 && score >= 66) color = 'text-yellow-500';
  else if (score < 66) color = 'text-red-500';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-neutral-200 dark:text-neutral-200" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`${color} transition-all duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-xl font-bold dark:text-white">{score}</span>
      </div>
    </div>
  )
}
