import { Composition } from 'remotion'
import { RihlAIDemo } from './RihlAIDemo'

export const RemotionRoot = () => (
  <Composition
    id="RihlAIDemo"
    component={RihlAIDemo}
    durationInFrames={2100}
    fps={60}
    width={393}
    height={852}
  />
)
