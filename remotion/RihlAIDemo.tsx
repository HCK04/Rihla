import React from 'react'
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from 'remotion'
import { SceneSplash }     from './scenes/SceneSplash'
import { SceneDiscover }   from './scenes/SceneDiscover'
import { SceneSpotDetail } from './scenes/SceneSpotDetail'
import { SceneScan }       from './scenes/SceneScan'
import { SceneItinerary }  from './scenes/SceneItinerary'
import { SceneChat }       from './scenes/SceneChat'

const FADE = 24

function FadeWrapper({ dur, children }: { dur: number; children: React.ReactNode }) {
  const frame = useCurrentFrame()
  const fadeIn  = interpolate(frame, [0, FADE], [0, 1], { extrapolateRight: 'clamp' })
  const fadeOut = interpolate(frame, [dur - FADE, dur], [1, 0], { extrapolateRight: 'clamp' })
  return (
    <AbsoluteFill style={{ opacity: Math.min(fadeIn, fadeOut) }}>
      {children}
    </AbsoluteFill>
  )
}

// Scene layout — 30f overlap for crossfade
// Splash      0  – 300   (5s)
// Discover   270 – 600   (5.5s)
// SpotDetail 570 – 870   (5s)
// Scan       840 – 1230  (6.5s)
// Itinerary 1200 – 1590  (6.5s)
// Chat      1560 – 2100  (9s)
export const RihlAIDemo: React.FC = () => (
  <AbsoluteFill style={{ background: '#FAF7F2' }}>
    <Sequence from={0}    durationInFrames={300}><FadeWrapper dur={300}><SceneSplash /></FadeWrapper></Sequence>
    <Sequence from={270}  durationInFrames={330}><FadeWrapper dur={330}><SceneDiscover /></FadeWrapper></Sequence>
    <Sequence from={570}  durationInFrames={300}><FadeWrapper dur={300}><SceneSpotDetail /></FadeWrapper></Sequence>
    <Sequence from={840}  durationInFrames={390}><FadeWrapper dur={390}><SceneScan /></FadeWrapper></Sequence>
    <Sequence from={1200} durationInFrames={390}><FadeWrapper dur={390}><SceneItinerary /></FadeWrapper></Sequence>
    <Sequence from={1560} durationInFrames={540}><FadeWrapper dur={540}><SceneChat /></FadeWrapper></Sequence>
  </AbsoluteFill>
)
