/**
	Winter Rush Snow
	Snow + bars + sky
	by Felix Turner / www.airtight.cc / @felixturner
**/

var XRSnow = function() {

	var SNOW_COUNT = 400;
	var SNOW_EDGE = 100;
	
	var snow = [];
	var windDir = 0;
	var windStrength = 0;
	var snowTime = 0;
	var snowGeometry;
	var bars;
	var barCount = 20;
	var barMaterial;
	var textureSky;
	var skyMaterial;

	function init(){


			//make snow

		if (XRConfig.snow){

			snowGeometry = new THREE.Geometry();

			var snowSprite = THREE.ImageUtils.loadTexture( "res/img/snow.png" );

			for ( i = 0; i < SNOW_COUNT; i ++ ) {

				var vertex = new THREE.Vector3();
				vertex.x = ATUtil.randomRange(-FLOOR_WIDTH/2,FLOOR_WIDTH/2);
				vertex.y = ATUtil.randomRange(-300,1200);
				vertex.z = ATUtil.randomRange(-FLOOR_DEPTH/2,FLOOR_DEPTH/2);

				snowGeometry.vertices.push( vertex );

			}

			var snowMaterial = new THREE.PointCloudMaterial( { 
				size: 50, 
				sizeAttenuation: true, 
				map: snowSprite, 
				transparent: true ,
				blending: THREE.AdditiveBlending,
				depthTest: true,
				opacity:0.7
			} );

			var particles = new THREE.PointCloud( snowGeometry, snowMaterial );
			XRGame.getMoverGroup().add( particles );

			//STRIPS
			//add bars for at high speed

			barMaterial = new THREE.MeshBasicMaterial({
				color: 0x0FF66FF,
				blending: THREE.AdditiveBlending,
				depthTest: false,
				transparent: true,
				opacity:.6,
				sizeAttenuation: true,
				side: THREE.DoubleSide,
			});

			var width = 4;
			var spread =  1000;

			var barGeom = new THREE.PlaneGeometry(20,500,1,1);

			bars = [];

			for (i = 0; i < barCount; i++) {

				var bar = new THREE.Mesh( barGeom, barMaterial );

				bar.scale.x = ATUtil.randomRange(0.2,2);
				bar.origYScale = ATUtil.randomRange(0.2,2);
				bar.scale.z = ATUtil.randomRange(0.2,2);

				XRGame.getMoverGroup().add( bar );

				bar.rotation.x = Math.PI/2;
				bar.rotation.y = Math.PI/2;

				bar.position.x = ATUtil.randomRange(-FLOOR_WIDTH/2,FLOOR_WIDTH/2);
				bar.position.y = ATUtil.randomRange(-300,600);
				bar.position.z = ATUtil.randomRange(-FLOOR_DEPTH/2,FLOOR_DEPTH/2);

				bars.push(bar);

			}

			//SKY
			textureSky = THREE.ImageUtils.loadTexture( "res/img/xmas-sky.jpg" );
			skyMaterial = new THREE.MeshBasicMaterial( {
				map:textureSky,
				transparent:true,
				depthTest: true,
			} );

			var planeGeometry = new THREE.PlaneGeometry( 800, 300,1,1 );
			skyMesh = new THREE.Mesh( planeGeometry, skyMaterial );
			XRMain.getScene().add( skyMesh );			
			skyMesh.scale.x = skyMesh.scale.y = 15;
			skyMesh.position.z = -2000;
			skyMesh.position.y = 1500;

		}

	}

	function shift(){


		if (XRConfig.snow){
			for(  i = 0; i < SNOW_COUNT; i++) {

				var vert = snowGeometry.vertices[i];
				vert.z += MOVE_STEP;

				if (vert.z + XRGame.getMoverGroup().position.z > FLOOR_DEPTH/2){
					vert.z	-= FLOOR_DEPTH;
				}			 

			}
			snowGeometry.verticesNeedUpdate = true;
		}

		for (i = 0; i < barCount; i++) {
			var p = bars[i].position;
			p.z += MOVE_STEP;
			if (p.z + XRGame.getMoverGroup().position.z > FLOOR_DEPTH/2){
				p.z	-= FLOOR_DEPTH;
			}		
		}

	}


	function animate(){


		if (XRConfig.snow){

			//global perlin wind
			snowTime += 0.001;
			windStrength = snoise.noise(snowTime,0,0)*20;
			windDir = (snoise.noise(snowTime + 100,0,0) + 1)/2 * Math.PI*2;

			for(  i = 0; i < SNOW_COUNT; i++) {
				var vert = snowGeometry.vertices[i];

				//gravity
				vert.y -= 3;

				//bounds wrapping
				if (vert.y < -300){
					vert.y = 1200;
				}

				//only do fancy wind if not playing
				if (!XRGame.getPlaying()){

					vert.x += Math.cos(windDir)*windStrength;
					vert.z += Math.sin(windDir)*windStrength;

 					//wrap around edges
					if (vert.x > FLOOR_WIDTH/2 + SNOW_EDGE) vert.x = -FLOOR_WIDTH/2 + SNOW_EDGE;
					if (vert.x < -FLOOR_WIDTH/2 + SNOW_EDGE) vert.x = FLOOR_WIDTH/2 + SNOW_EDGE;

					if (vert.z > FLOOR_DEPTH/2 + SNOW_EDGE) vert.z = -FLOOR_DEPTH/2 + SNOW_EDGE;
					if (vert.z < -FLOOR_DEPTH/2 + SNOW_EDGE) vert.z = FLOOR_DEPTH/2 + SNOW_EDGE;
			
				}

			}
			snowGeometry.verticesNeedUpdate = true;

			var opac = (XRGame.getSpeed() - 0.5) *2;

			barMaterial.opacity = opac*2/3;
			skyMaterial.opacity = opac;

			for (i = 0; i < barCount; i++) {
				var p = bars[i].position;
				p.z +=40;

				bars[i].scale.y = bars[i].origYScale * opac;
			}

		}

	}

	return {
		init:init,
		animate:animate,
		shift:shift
	};


}();