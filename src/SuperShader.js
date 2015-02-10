 /**
  Winter Rush Super Shader
  Combines Vignette & BrightnessContrast & Hue/Saturation
  by Felix Turner / @felixturner / www.airtight.cc
 */

THREE.SuperShader = {

	uniforms: {

		"tDiffuse": 	{ type: "t", value: null },
		
		//Vignette
		"vigOffset":   { type: "f", value: 1.0 },
		"vigDarkness": { type: "f", value: 1.0 },

		//BrightnessContrast
		"brightness": { type: "f", value: 0 },

		//HueSaturationShader
		"hue":        { type: "f", value: 0 },
		"hueAmount":  { type: "f", value: 0 }, //0-1
		"saturation": { type: "f", value: 0 },

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		
		"uniform float vigOffset;",
		"uniform float vigDarkness;",

		"uniform float brightness;",
		"uniform float contrast;",

		"uniform float hue;",
		"uniform float hueAmount;",
		"uniform float saturation;",


		"varying vec2 vUv;",

		"void main() {",

			//orig color
			"vec4 col = texture2D( tDiffuse, vUv );",

			//vignette
			"vec2 uv = ( vUv - vec2( 0.5 ) ) * vec2( vigOffset );",
			"col = vec4( mix( col.rgb, vec3( 1.0 - vigDarkness ), dot( uv, uv ) ), col.a );",

			//BrightnessContrast
			"col.rgb += brightness;",

			// hue
			"float angle = hue * 3.14159265;",
			"float s = sin(angle), c = cos(angle);",
			"vec3 weights = (vec3(2.0 * c, -sqrt(3.0) * s - c, sqrt(3.0) * s - c) + 1.0) / 3.0;",
			"float len = length(col.rgb);",
			"vec3 shiftedCol = vec3(",
				"dot(col.rgb, weights.xyz),",
				"dot(col.rgb, weights.zxy),",
				"dot(col.rgb, weights.yzx)",
			");",


 			"col = vec4( mix( col.rgb, shiftedCol.rgb, hueAmount ), 1.0 );",

			"gl_FragColor = col;",

		"}"

	].join("\n")

};
