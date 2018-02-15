require(["dojo/dom", "dojo/has", "dojo/dom-construct"], function(dom, has, domConstruct){
	addService("Capture", function(){
		this.captureDir = undefined;
		this.audioFiles = [];
		this.videoFiles = [];
		this.video = dom.byId("captureVideoPlayer");

		// Public
		// Handle requests
		this.exec = function(action, args, callbackId){
			_consoleLog("Capture." + action + "()");
			switch (action) {
				case "captureAudio" :
					var r = this.getAudioFiles();
					return new PluginResult(callbackId, PluginResultStatus.OK, r, false);
				case "captureVideo" :
					r = this.getVideoFiles();
					return new PluginResult(callbackId, PluginResultStatus.OK, r, false);
				default :
					alert('Capture.' + action + "() not implemented");
					return new PluginResult(callbackId, PluginResultStatus.OK, "NOT IMPLEMENTED", false);
			}
		};

		this.playVideo = function(f){
			f = this.captureDir + f;
			if (!this.video) {
				var captureVideoContainer = dom.byId("captureVideoContainer");
				this.video = dom.create("video", {
				    autoplay : true,
				    style : "width : 150px; "
				}, captureVideoContainer);
			}
			var v = this.video;
			v.src = f;
		};

		this.newMediaFile = function() {
			var f = window.frames;
			if(f) {
			    for ( var i = 0; i < f.length; i++) {
			    	if (typeof f[i].MediaFile !== "undefined")
			    		return new f[i].MediaFile();
				}
			}
			return {};
		};
		
		this.getAudioFiles = function(){
			var a = this.audioFiles;
			var ret = [];
			for ( var i = 0; i < a.length; i++) {
				var f = a[i];
				var mediaFile = this.newMediaFile();
				mediaFile.name = f;
				mediaFile.fullPath = this.captureDir + f;
				mediaFile.type = "audio/ogg";
				mediaFile.lastModifiedDate = new Date().toString();
				mediaFile.size = rand(10000, 0) + 500;
				ret.push(mediaFile);
			}
			return ret;
		};

		this.getVideoFiles = function(){
			var a = this.videoFiles;
			var ret = [];
			for ( var i = 0; i < a.length; i++) {
				var f = a[i];
				var mediaFile = this.newMediaFile();
				mediaFile.name = f;
				mediaFile.fullPath = this.captureDir + f;
				mediaFile.type = "video/ogg";
				mediaFile.lastModifiedDate = new Date().toString();
				mediaFile.size = rand(10000, 0) + 500;
				ret.push(mediaFile);
			}
			return ret;
		};

		this.setFile = function(a, checked, data){
			var i = a.indexOf(data);

			if (checked) {
				if (i == -1)
					a.push(data);
			} else if (i != -1) {
				a.splice(i, 1);
			}
		};

		this.setAudioFile = function(checked, data){
			this.setFile(this.audioFiles, checked, data);
		};

		this.setVideoFile = function(checked, data){
			this.setFile(this.videoFiles, checked, data);
		};

		// Initialization
		{
			var n = _pg_sim_nls;
			if (!(has("chrome") || has("ff"))) {
				var parentNode = dom.byId("capture");
				domConstruct.empty(parentNode);
				parentNode.innerHTML = n.sim_capture_browserSupport;
			} else {
				dom.byId('sim_capture_choose_audio').innerHML = n.sim_capture_choose_audio;
				dom.byId('sim_capture_audio1').innerHTML = n.sim_capture_audio1;
				dom.byId('sim_capture_audio2').innerHTML = n.sim_capture_audio2;
				dom.byId('sim_capture_audio3').innerHTML = n.sim_capture_audio3;
				
				dom.byId('sim_capture_choose_video').innerHML = n.sim_capture_choose_video;
				dom.byId('sim_capture_video1').innerHTML = n.sim_capture_video1;
				dom.byId('sim_capture_video2').innerHTML = n.sim_capture_video2;
				dom.byId('sim_capture_video3').innerHTML = n.sim_capture_video3;
				sim_capture_playVideo1_button.set("label", n.sim_capture_playVideo);
				sim_capture_playVideo2_button.set("label", n.sim_capture_playVideo);
				sim_capture_playVideo3_button.set("label", n.sim_capture_playVideo);
				
				this.captureDir = getScriptBase("capture.js") + "capture/";
				
				// Fix for Chrome which does not rewind  (Defect 98516)
				var captureAudioPlayer1 = dom.byId("captureAudioPlayer1");
				captureAudioPlayer1.addEventListener('ended', function() {
						captureAudioPlayer1.pause();
						captureAudioPlayer1.currentTime = 0;
					}
 				);
				
				var captureAudioPlayer2 = dom.byId("captureAudioPlayer2");
				captureAudioPlayer2.addEventListener('ended', function() {
						captureAudioPlayer2.pause();
						captureAudioPlayer2.currentTime = 0;
					}
 				);
				
				var captureAudioPlayer3 = dom.byId("captureAudioPlayer3");
				captureAudioPlayer3.addEventListener('ended', function() {
						captureAudioPlayer3.pause();
						captureAudioPlayer3.currentTime = 0;
					}
 				);
			}
		}
	});
});