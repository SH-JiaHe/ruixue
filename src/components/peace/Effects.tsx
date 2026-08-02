'use client'

import {
  EffectComposer,
  Bloom,
  Vignette,
  ToneMapping,
  SMAA,
} from '@react-three/postprocessing'
import { ToneMappingMode, BlendFunction } from 'postprocessing'

/**
 * Cinematic postprocessing stack:
 *  - SMAA         : high-quality anti-aliasing (subpixel morphological)
 *  - Bloom        : soft glow on the war markers and atmospheric rim
 *  - Vignette     : gentle dark corners to focus the eye on the earth
 *  - ToneMapping  : ACES filmic for natural color roll-off
 *
 * Note: the renderer's own tone mapping is disabled (see page.tsx — we
 * set gl.toneMapping = NoToneMapping) so that tone mapping is applied
 * exactly once, here, by the EffectComposer. This avoids the
 * "double tone mapping" flicker that occurs when both the renderer and
 * the composer apply ACES filmic.
 */
export function Effects() {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        intensity={0.28}
        luminanceThreshold={0.45}
        luminanceSmoothing={0.95}
        mipmapBlur
        radius={0.55}
      />
      <Vignette
        eskil={false}
        offset={0.18}
        darkness={0.78}
        blendFunction={BlendFunction.NORMAL}
      />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <SMAA />
    </EffectComposer>
  )
}
