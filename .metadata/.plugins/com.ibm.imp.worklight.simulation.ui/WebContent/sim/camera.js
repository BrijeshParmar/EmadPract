require(
		[ "dojo/dom", "dijit/registry" ],
		function(dom, registry) {

			addService(
					"Camera",
					function() {
						var cameraDir = "";
						var curCameraImage = "";
						var curAlbumImage = "";
						var MDbase64 = "/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0a"
								+ "HBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIy"
								+ "MjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCABzAHMDASIA"
								+ "AhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQA"
								+ "AAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3"
								+ "ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWm"
								+ "p6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEA"
								+ "AwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSEx"
								+ "BhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElK"
								+ "U1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3"
								+ "uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDw+jPF"
								+ "FFZmg9ELsFHWryxJCvqfbqfeoLNclxjkgAH0/wA8UpmaJmiiGe2WGSOuaaE2AKKQApJY8jHNDMpL"
								+ "KSQ2cYIyfrShRlW3dOeKMMSQirnPDE800Iifej7lJPY+uKaJHkOxmAAyeuTUsnyhsEMy9cdPw9aj"
								+ "VVIYlwXI+VRzn/A0wBgF2/MTg52g804u67TgbDyRx/8ArqEArITg/SkJbrnHseooYi2drNhQRgdD"
								+ "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"
								+ "D0KZ06M2wc0UUVzm5//Z";
						// Public
						// Set image to return for camera
						this.setCameraImage = function(image) {
							curCameraImage = image;
							dom.byId("cameraSelectedId").src = cameraDir
									+ curCameraImage;
							dom.byId("cameraSizeId").innerHTML = image;
						};

						// Public
						// Set image to return for library
						this.setAlbumImage = function(image) {
							curAlbumImage = image;
							dom.byId("albumSelectedId").src = cameraDir
									+ curAlbumImage;
							dom.byId("albumSizeId").innerHTML = image;
						};

						// Get image for camera or library
						var getCameraImage = function(source) {
							_consoleLog("camera image=" + curCameraImage);
							if (source == 1) {
								return cameraDir + curCameraImage;
							}
							return cameraDir + curAlbumImage;
						};

						// Public
						// Handle requests
						this.exec = function(action, args, callbackId, uuid) {
							// [quality, destinationType, sourceType,
							// targetWidth, targetHeight,
							// encodingType]
							if (action == 'takePicture') {

								var destinationType = args[1];
								var r = null;
								if (destinationType == 0) // Camera.DestinationType
															// = {
									// DATA_URL: 0, // Return base64
									// encoded string
									// FILE_URI: 1 // Return file uri
									r = MDbase64;
								else
									r = getCameraImage(args[2]);
								return new PluginResult(callbackId,
										PluginResultStatus.OK, r, false);
							}
							if (action == 'cleanup') {
								var platformID = getSimByUUID(uuid).device.platformID;
								var isiOS = platformID.toString().indexOf(
										".ios.") != -1;
								if (isiOS)
									return new PluginResult(callbackId,
											PluginResultStatus.OK, "", false);
								else
									return new PluginResult(callbackId,
											PluginResultStatus.INVALID_ACTION,
											"", false);
							}
							return new PluginResult(callbackId,
									PluginResultStatus.INVALID_ACTION);
						};

						// Initialization
						{
							var n = _pg_sim_nls;

							var td;
							td = dom.byId('sim_camera_choose_image_camera');
							td.innerHTML = n.sim_camera_choose_image_camera;
							td = dom
									.byId('sim_camera_currently_selected_camera');
							td.innerHTML = n.sim_camera_currently_selected_camera;
							td = dom.byId('sim_camera_choose_image_album');
							td.innerHTML = n.sim_camera_choose_image_album;
							td = dom
									.byId('sim_camera_currently_selected_album');
							td.innerHTML = n.sim_camera_currently_selected_album;

							sim_camera_imagexs_button.set("label",
									n.sim_camera_xs);
							sim_camera_images_button.set("label",
									n.sim_camera_s);
							sim_camera_imagem_button.set("label",
									n.sim_camera_m);
							sim_camera_imagel_button.set("label",
									n.sim_camera_l);
							sim_camera_imagexl_button.set("label",
									n.sim_camera_xl);

							sim_camera2_imagexs_button.set("label",
									n.sim_camera_xs);
							sim_camera2_images_button.set("label",
									n.sim_camera_s);
							sim_camera2_imagem_button.set("label",
									n.sim_camera_m);
							sim_camera2_imagel_button.set("label",
									n.sim_camera_l);
							sim_camera2_imagexl_button.set("label",
									n.sim_camera_xl);

							sim_camera_albumxs_button.set("label",
									n.sim_camera_xs);
							sim_camera_albums_button.set("label",
									n.sim_camera_s);
							sim_camera_albumm_button.set("label",
									n.sim_camera_m);
							sim_camera_albuml_button.set("label",
									n.sim_camera_l);
							sim_camera_albumxl_button.set("label",
									n.sim_camera_xl);

							sim_camera2_albumxs_button.set("label",
									n.sim_camera_xs);
							sim_camera2_albums_button.set("label",
									n.sim_camera_s);
							sim_camera2_albumm_button.set("label",
									n.sim_camera_m);
							sim_camera2_albuml_button.set("label",
									n.sim_camera_l);
							sim_camera2_albumxl_button.set("label",
									n.sim_camera_xl);
							// Determine base URL for this JS file
							cameraDir = getScriptBase("camera.js") + "camera/";

							this.setCameraImage("camera1_m.jpg");
							this.setAlbumImage("album1_m.jpg");
						}
					});
		});