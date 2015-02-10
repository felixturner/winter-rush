/**
	Winter Rush Snow
	Handles falling snow, bars, sky
	by Felix Turner / @felixturner / www.airtight.cc
**/

var WRSnow = function() {

	var SNOW_COUNT = 400;
	var SNOW_EDGE = 100;
	var SNOW_TOP = 1600;
	var SNOW_BOTTOM = -300;
	var BAR_COUNT = 20;
	
	var windDir = 0;
	var windStrength = 0;
	var snowTime = 0;
	var snowGeometry;
	var bars;
	var barMaterial;
	var skyMaterial;

	var snoise = new ImprovedNoise();

	function init(){


		//make falling snow
		snowGeometry = new THREE.Geometry();

		var snowSprite = THREE.ImageUtils.loadTexture( "res/img/snow.png" );

		for ( i = 0; i < SNOW_COUNT; i ++ ) {

			var vertex = new THREE.Vector3();
			vertex.x = ATUtil.randomRange(-WRConfig.FLOOR_WIDTH/2,WRConfig.FLOOR_WIDTH/2);
			vertex.y = ATUtil.randomRange(SNOW_BOTTOM,SNOW_TOP);
			vertex.z = ATUtil.randomRange(-WRConfig.FLOOR_DEPTH/2,WRConfig.FLOOR_DEPTH/2);

			snowGeometry.vertices.push( vertex );

		}

		var snowMaterial = new THREE.PointCloudMaterial( { 
			size: 50, 
			sizeAttenuation: true, 
			map: snowSprite, 
			transparent: true ,
			blending: THREE.AdditiveBlending,
			depthTest: true,
			opacity:0.7,
			depthWrite:false
		} );

		var particles = new THREE.PointCloud( snowGeometry, snowMaterial );
		WRGame.getMoverGroup().add( particles );

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

		for (i = 0; i < BAR_COUNT; i++) {

			var bar = new THREE.Mesh( barGeom, barMaterial );

			bar.scale.x = ATUtil.randomRange(0.2,2);
			bar.origYScale = ATUtil.randomRange(0.2,2);
			bar.scale.z = ATUtil.randomRange(0.2,2);

			WRGame.getMoverGroup().add( bar );

			bar.rotation.x = Math.PI/2;
			bar.rotation.y = Math.PI/2;

			bar.position.x = ATUtil.randomRange(-WRConfig.FLOOR_WIDTH/2,WRConfig.FLOOR_WIDTH/2);
			bar.position.y = ATUtil.randomRange(-300,600);
			bar.position.z = ATUtil.randomRange(-WRConfig.FLOOR_DEPTH/2,WRConfig.FLOOR_DEPTH/2);

			bars.push(bar);

		}

		//SKY
		var textureSky = THREE.ImageUtils.loadTexture( "res/img/xmas-sky.jpg" );
		skyMaterial = new THREE.MeshBasicMaterial( {
			map:textureSky,
			transparent:true,
			depthTest: true,
			fog:false
		} );

		var planeGeometry = new THREE.PlaneGeometry( 800, 300,1,1 );
		skyMesh = new THREE.Mesh( planeGeometry, skyMaterial );
		WRMain.getScene().add( skyMesh );			
		skyMesh.scale.x = skyMesh.scale.y = 15;
		skyMesh.position.z = -3600;
		skyMesh.position.y = 1500;

	}

	function shift(){


		for(  i = 0; i < SNOW_COUNT; i++) {

			var vert = snowGeometry.vertices[i];
			vert.z += WRConfig.MOVE_STEP;

			if (vert.z + WRGame.getMoverGroup().position.z > WRConfig.FLOOR_DEPTH/2){
				vert.z	-= WRConfig.FLOOR_DEPTH;
			}			 

		}
		snowGeometry.verticesNeedUpdate = true;

		for (i = 0; i < BAR_COUNT; i++) {
			var p = bars[i].position;
			p.z += WRConfig.MOVE_STEP;
			if (p.z + WRGame.getMoverGroup().position.z > WRConfig.FLOOR_DEPTH/2){
				p.z	-= WRConfig.FLOOR_DEPTH;
			}		
		}

	}


	function animate(){

		//global perlin wind
		snowTime += 0.001;
		windStrength = snoise.noise(snowTime,0,0)*20;
		windDir = (snoise.noise(snowTime + 100,0,0) + 1)/2 * Math.PI*2;

		for(  i = 0; i < SNOW_COUNT; i++) {
			var vert = snowGeometry.vertices[i];

			//gravity
			vert.y -= 3;

			//bounds wrapping
			if (vert.y < SNOW_BOTTOM){
				vert.y = SNOW_TOP;
			}

			//only do fancy wind if not playing
			if (!WRGame.getPlaying()){

				vert.x += Math.cos(windDir)*windStrength;
				vert.z += Math.sin(windDir)*windStrength;

					//wrap around edges
				if (vert.x > WRConfig.FLOOR_WIDTH/2 + SNOW_EDGE) vert.x = -WRConfig.FLOOR_WIDTH/2 + SNOW_EDGE;
				if (vert.x < -WRConfig.FLOOR_WIDTH/2 + SNOW_EDGE) vert.x = WRConfig.FLOOR_WIDTH/2 + SNOW_EDGE;

				if (vert.z > WRConfig.FLOOR_DEPTH/2 + SNOW_EDGE) vert.z = -WRConfig.FLOOR_DEPTH/2 + SNOW_EDGE;
				if (vert.z < -WRConfig.FLOOR_DEPTH/2 + SNOW_EDGE) vert.z = WRConfig.FLOOR_DEPTH/2 + SNOW_EDGE;
		
			}

		}
		snowGeometry.verticesNeedUpdate = true;

		var opac = (WRGame.getSpeed() - 0.5) *2;

		barMaterial.opacity = opac*2/3;
		skyMaterial.opacity = opac;

		for (i = 0; i < BAR_COUNT; i++) {
			var p = bars[i].position;
			p.z +=40;

			bars[i].scale.y = bars[i].origYScale * opac;
		}


	}

	return {
		init:init,
		animate:animate,
		shift:shift
	};


}();