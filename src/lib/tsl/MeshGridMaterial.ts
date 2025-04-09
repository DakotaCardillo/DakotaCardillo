import * as THREE from 'three';
import { MeshGridMaterialLine } from './MeshGridMaterialLine';
import { uniform, varying, vec2, vec3, float, int, If, mod, abs, thickness, mix, Loop, vec4, Fn } from 'three/tsl';


interface MeshGridMaterialOptions {
	scale?: number;
	maxLines?: number;
}

export class MeshGridMaterial extends THREE.ShaderMaterial {
	constructor(lines: MeshGridMaterialLine[] = [], options: MeshGridMaterialOptions = {}) {
		const maxLines: number = options.maxLines || 16;
		const lineColors: number[] = [];
		const lineOffsets: number[] = [];
		const lineThicknesses: number[] = [];
		const lineCrosses: number[] = [];

		// Fill arrays to a fixed max size for uniform consistency.
		for (let i = 0; i < maxLines; i++) {
			if (i < lines.length) {
				const line = lines[i];
				lineColors.push(line.color.r, line.color.g, line.color.b);
				lineOffsets.push(line.offset);
				lineThicknesses.push(line.thickness);
				lineCrosses.push(line.cross);
			} else {
				// Fill with defaults
				lineColors.push(0, 0, 0);
				lineOffsets.push(0.0);
				lineThicknesses.push(0.0);
				lineCrosses.push(0.0);
			}
		}

		const uniforms = {
			uLineCount: { value: lines.length },
			uLineColors: { value: lineColors },
			uLineOffsets: { value: lineOffsets },
			uLineThicknesses: { value: lineThicknesses },
			uLineCrosses: { value: lineCrosses },
			uScale: { value: options.scale !== undefined ? options.scale : 1.0 },
		};

		const vertexShader = `
      varying vec2 vWorldPos;
      uniform float uScale;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        gl_Position = projectionMatrix * mvPosition;
        // For demo purposes, pass through a scaled version of the position.xy
        vWorldPos = (position.xz * uScale);
      }
    `;

		const fragmentShader = `
      precision highp float;
      uniform int uLineCount;
      uniform float uLineOffsets[${maxLines}];
      uniform float uLineThicknesses[${maxLines}];
      uniform float uLineCrosses[${maxLines}];
      uniform float uLineColors[${maxLines * 3}];
      
      varying vec2 vWorldPos;
      
      float pristineGrid(vec2 uv, vec2 lineWidth)
      {
      		vec2 ddx = dFdx(uv);
					vec2 ddy = dFdy(uv);
					vec2 uvDeriv = vec2(length(vec2(ddx.x, ddy.x)), length(vec2(ddx.y, ddy.y)));
					bvec2 invertLine = bvec2(lineWidth.x > 0.5, lineWidth.y > 0.5);
					vec2 targetWidth = vec2(
						invertLine.x ? 1.0 - lineWidth.x : lineWidth.x,
						invertLine.y ? 1.0 - lineWidth.y : lineWidth.y
						);
					vec2 drawWidth = clamp(targetWidth, uvDeriv, vec2(0.5));
					vec2 lineAA = uvDeriv * 1.5;
					vec2 gridUV = abs(fract(uv) * 2.0 - 1.0);
					gridUV.x = invertLine.x ? gridUV.x : 1.0 - gridUV.x;
					gridUV.y = invertLine.y ? gridUV.y : 1.0 - gridUV.y;
					vec2 grid2 = smoothstep(drawWidth + lineAA, drawWidth - lineAA, gridUV);
			
					grid2 *= clamp(targetWidth / drawWidth, 0.0, 1.0);
					grid2 = mix(grid2, targetWidth, clamp(uvDeriv * 2.0 - 1.0, 0.0, 1.0));
					grid2.x = invertLine.x ? 1.0 - grid2.x : grid2.x;
					grid2.y = invertLine.y ? 1.0 - grid2.y : grid2.y;
					return mix(grid2.x, 1.0, grid2.y);
      }

      void main() {
        vec3 baseColor = vec3(0.0);
        float alpha = 0.0;

        // Loop over the available lines and accumulate color if within threshold.
        for (int i = 0; i < ${maxLines}; i++) {
          if (i >= uLineCount) break;
          
          vec3 lineColor = vec3(
            uLineColors[i * 3 + 0],
            uLineColors[i * 3 + 1],
            uLineColors[i * 3 + 2]
          );
          float offset = uLineOffsets[i];
          float thickness = uLineThicknesses[i];
          float crossVal = uLineCrosses[i];

          // For this example, assume horizontal lines at unit intervals.
          float dist = abs(mod(vWorldPos.y - offset, 1.0) - 0.5);
          // Basic cross logic: if there's a cross value, skip drawing part of the line.
          float crossPattern = mod(vWorldPos.x - offset, 1.0);
          if (crossVal > 0.0 && crossPattern > crossVal) {
            continue;
          }
          if (dist < thickness) {
            // Mix the base color with this line's color
            baseColor = mix(baseColor, lineColor, 0.5);
            alpha = 1.0;
          }
        }
        gl_FragColor = vec4(baseColor, alpha);
      }
    `;

		super({
			uniforms,
			vertexShader,
			fragmentShader,
			transparent: true, // if you require transparency
		});
	}
}
