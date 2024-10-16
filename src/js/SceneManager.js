import { LCCRender } from '../../sdk/lcc-0.3.1.js';

export default class SceneManager {
  constructor(option) {
    this.dom = option.dom;
    this.normalControl = false;
    this.init();
  }

  async init() {
    const self = this;
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYTQ2ZjdjNS1jM2E0LTQ1M2EtOWM0My1mODMzNzY3YjYzY2YiLCJpZCI6MjkzMjcsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1OTE5NDIzNjB9.RzKlVTVDTQ9r7cqCo-PDydgUh8Frgw0Erul_BVxiS9c';
    const viewer = await this.loadView();
    self.viewer = viewer;
    const viewInfo = JSON.parse(localStorage.getItem('viewInfo'));
    viewer.cesiumWidget.creditContainer.style.display = 'none';
    // this.loadCesium();
    this.loadDatas();
    this.getPosition();
    this.resetView({
      lat: 30.054604,
      lng: 108.885436,
      alt: 21036414,
      heading: 0,
      pitch: -90,
      duration: 1,
      complete: () => {
        this.resetView({
          lat: 35.58805805063417,
          lng: 117.99221079419415,
          alt: 1260110.9276287237,
          heading: Cesium.Math.toDegrees(0.026766359954148555),
          pitch: Cesium.Math.toDegrees(-1.523291651869684),
          duration: 3
        });
        this.initEvent();
      }
    });
  }

  async loadView() {
    return new Cesium.Viewer(this.dom, {
      // terrainProvider: await Cesium.CesiumTerrainProvider.fromUrl('http://localhost:9056/terrain'),
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      navigationHelpButton: false,
      scene3DOnly: false,
      navigationInstructionsInitiallyVisible: false,
      showRenderLoopErrors: false,
      orderIndependentTranslucency: false,
      useDefaultRenderLoop: true,
      depthTestAgainstTerrain: true,
      resolutionScale: window.devicePixelRatio,
      contextOptions: {
        webgl: {
          alpha: true,
        },
      },
    })
  }

  loadCesium() {
    this.viewer.imageryLayers.removeAll();
    const imageryProvider = new Cesium.UrlTemplateImageryProvider({
      url: "http://localhost:9056/imagery/{z}/{y}/{x}.png",
      tilingScheme: new Cesium.GeographicTilingScheme()
    });
    const imageryLayer = new Cesium.ImageryLayer(imageryProvider, {});
    this.viewer.imageryLayers.add(imageryLayer);
  }


  initEvent() {
    const self = this;
    const handler = new Cesium.ScreenSpaceEventHandler(self.viewer.scene.canvas);
    handler.setInputAction((event) => {
      let pick = self.viewer.scene.drillPick(event.position);
      if (pick.length > 0) {
        if (pick[0].id.name === 3) {
          self.setMode('firstPerson');
          self.resetView({
            lat: 34.71957771184801,
            lng: 117.54794343812074,
            alt: 2,
            heading: Cesium.Math.toDegrees(4.843085851308917),
            pitch: Cesium.Math.toDegrees(-0.1297979929811217),
            duration: 3
          });
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.setInputAction((event) => {
      let pick = self.viewer.scene.drillPick(event.position ? event.position : event.endPosition);
      if (pick.length > 0) {
        self.viewer.container.style.cursor = 'pointer'
      } else {
        self.viewer.container.style.cursor = 'auto'
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }

  resetView(options = {}) {
    const { viewer } = this;
    const { lat,
      lng,
      alt,
      heading,
      pitch,
      duration = 0,
      complete } = options;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lng, lat, alt),
      orientation: {
        heading: Cesium.Math.toRadians(heading),
        pitch: Cesium.Math.toRadians(pitch)
      },
      duration,
      complete
    });
  }

  saveView() {
    const { viewer } = this;
    var position = viewer.camera.positionCartographic;
    var longitude = Cesium.Math.toDegrees(position.longitude);
    var latitude = Cesium.Math.toDegrees(position.latitude);
    var height = position.height;
    let heading = viewer.camera.heading;
    let pitch = viewer.camera.pitch;
    let roll = viewer.camera.roll;
    const viewInfo = {
      height,
      latitude,
      longitude,
      heading,
      pitch,
      roll
    };
    localStorage.setItem('viewInfo', JSON.stringify(viewInfo));
  }

  setMode(type) {
    if (type === 'firstPerson') {
      this.Ismovement(true);
      this.normalControl = false;
    }
    if (type === 'normal') {
      this.Ismovement(false);
      this.normalControl = true;
    }
  }

  Ismovement(flag) {
    var that = this;
    this.normalControl = !flag;

    if (flag) {
      var ellipsoid = this.viewer.scene.globe.ellipsoid;

      this.viewer.scene.screenSpaceCameraController.enableRotate = false;
      this.viewer.scene.screenSpaceCameraController.enableTranslate = false;
      this.viewer.scene.screenSpaceCameraController.enableZoom = false;
      this.viewer.scene.screenSpaceCameraController.enableTilt = false;
      this.viewer.scene.screenSpaceCameraController.enableLook = false;

      var startMousePosition;
      var mousePosition;

      var flags = {
        looking: false,
        moveForward: false,
        moveBackward: false,
        moveUp: false,
        moveDown: false,
        moveLeft: false,
        moveRight: false,
        rotateLeft: false,
        rotateRight: false,
        rotateUp: false,
        rotateDown: false,
      };

      this.viewer.screenSpaceEventHandler.setInputAction(function (movement) {
        flags.looking = true;
        mousePosition = startMousePosition = Cesium.Cartesian3.clone(
          movement.position
        );
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

      this.viewer.screenSpaceEventHandler.setInputAction(function (movement) {
        mousePosition = movement.endPosition;
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      this.viewer.screenSpaceEventHandler.setInputAction(function (position) {
        flags.looking = false;
      }, Cesium.ScreenSpaceEventType.LEFT_UP);

      function getFlagForKeyCode(keyCode) {
        switch (keyCode) {
          case "W".charCodeAt(0):
            return "moveForward";
          case "S".charCodeAt(0):
            return "moveBackward";
          case "Q".charCodeAt(0):
            return "moveUp";
          case "E".charCodeAt(0):
            return "moveDown";
          case "D".charCodeAt(0):
            return "moveRight";
          case "A".charCodeAt(0):
            return "moveLeft";
          case 37:
            return "rotateLeft";
          case 38:
            return "rotateUp";
          case 39:
            return "rotateRight";
          case 40:
            return "rotateDown";
          default:
            return undefined;
        }
      }

      document.addEventListener(
        "keydown",
        (this.down = function (e) {
          var flagName = getFlagForKeyCode(e.keyCode);
          if (typeof flagName !== "undefined") {
            flags[flagName] = true;
          }
        }),
        false
      );

      document.addEventListener(
        "keyup",
        (this.up = (e) => {
          var flagName = getFlagForKeyCode(e.keyCode);
          if (typeof flagName !== "undefined") {
            flags[flagName] = false;
          }
        }),
        false
      );

      this.viewer.clock.onTick.addEventListener(function (clock) {
        var camera = that.viewer.camera;
        if (flags.looking) {
          var width = that.viewer.canvas.clientWidth;
          var height = that.viewer.canvas.clientHeight;
          var lookFactor = 0.1;
          var x = (mousePosition.x - startMousePosition.x) / width;
          var y = -(mousePosition.y - startMousePosition.y) / height;
          camera.setView({
            orientation: {
              heading: camera.heading + x * lookFactor,
              pitch: camera.pitch + y * lookFactor,
              roll: 0.0,
            },
          });
        }
        var cameraHeight = ellipsoid.cartesianToCartographic(
          camera.position
        ).height;
        var moveRate = cameraHeight / 50.0;
        if (flags.rotateUp) {
          camera.lookUp(Cesium.Math.toDegrees(0.00005));
          camera.setView({
            orientation: {
              heading: camera.heading,
              pitch: camera.pitch,
              roll: 0.0,
            },
          });
        }
        if (flags.rotateDown) {
          camera.lookDown(Cesium.Math.toDegrees(0.00005));
          camera.setView({
            orientation: {
              heading: camera.heading,
              pitch: camera.pitch,
              roll: 0.0,
            },
          });
        }
        if (flags.rotateLeft) {
          camera.lookLeft(Cesium.Math.toDegrees(0.00005));
          camera.setView({
            orientation: {
              heading: camera.heading,
              pitch: camera.pitch,
              roll: 0.0,
            },
          });
        }
        if (flags.rotateRight) {
          camera.lookRight(Cesium.Math.toDegrees(0.00005)); camera.setView({
            orientation: {
              heading: camera.heading,
              pitch: camera.pitch,
              roll: 0.0,
            },
          });
        }
        if (flags.moveForward) {
          camera.moveForward(moveRate);
        }
        if (flags.moveBackward) {
          camera.moveBackward(moveRate);
        }
        if (flags.moveUp) {
          camera.moveUp(moveRate);
        }
        if (flags.moveDown) {
          camera.moveDown(moveRate);
        }
        if (flags.moveLeft) {
          camera.moveLeft(moveRate);
        }
        if (flags.moveRight) {
          camera.moveRight(moveRate);
        }
      });
    } else {
      this.viewer.scene.screenSpaceCameraController.enableRotate = true;
      this.viewer.scene.screenSpaceCameraController.enableTranslate = true;
      this.viewer.scene.screenSpaceCameraController.enableZoom = true;
      this.viewer.scene.screenSpaceCameraController.enableTilt = true;
      this.viewer.scene.screenSpaceCameraController.enableLook = true;
      this.viewer.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_DOWN
      );
      this.viewer.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.MOUSE_MOVE
      );
      this.viewer.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_UP
      );
      document.removeEventListener("keydown", this.down, false);
      document.removeEventListener("keyup", this.up, false);
    }
  }

  loadDatas() {
    datas.forEach((_datas) => {
      if (_datas.type === 'station') {
        _datas.datas.forEach(data => {
          const label = new Cesium.Entity();
          const position = Cesium.Cartesian3.fromDegrees(data.location.longitude, data.location.latitude, data.location.height);
          label.position = position;
          label.name = data.id;
          label.billboard = new Cesium.BillboardGraphics({
            image: data.image,
            width: 48,
            height: 48,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 2200000.0)
          });
          const labelGrapihcs = new Cesium.LabelGraphics({
            text: data.name,
            font: '18px sans-serif',
            eyeOffset: new Cesium.Cartesian3(data.location.longitude, data.location.latitude, data.location.height),
            pixelOffset: new Cesium.Cartesian2(0, 45),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 2200000.0)
          });
          label.label = labelGrapihcs;
          this.viewer.entities.add(label);
        });
      }
      if (_datas.type === 'lcc') {
        _datas.datas.forEach(data => {
          if (data.name === 'qz') {
            this.qzurl = data.url;
          }
          if (data.name === 'bhs') {
            this.bhsurl = data.url;
          }
        });
      }
    });
  }

  loadQz() {
    this.resetView({
      lat: 34.71957771184801,
      lng: 117.54794343812074,
      alt: 2,
      heading: Cesium.Math.toDegrees(4.843085851308917),
      pitch: Cesium.Math.toDegrees(-0.1297979929811217),
      duration: 3
    });
    this.destoryLCC();
    this.qz = this.loadLCC({ url: this.qzurl });
    console.log(this.qz)
  }

  loadBhs() {
    this.resetView({
      lat: 34.720300957239765,
      lng: 117.54618634366045,
      alt: 3,
      heading: Cesium.Math.toDegrees(2.743609142988583),
      pitch: Cesium.Math.toDegrees(-0.33967328540304886),
      duration: 3
    });
    this.destoryLCC();
    this.bhs = this.loadLCC({ url: this.bhsurl });
    console.log(this.bhs)
  }

  loadLCC(options = {}) {
    const { viewer } = this;
    const cart3 = Cesium.Ellipsoid.WGS84.cartographicToCartesian(Cesium.Cartographic.fromDegrees(117.546202, 34.720254, 51));
    const m1 = Cesium.Transforms.eastNorthUpToFixedFrame(cart3);
    return LCCRender.load({
      camera: viewer.camera,
      scene: viewer.scene,
      dataPath: options.url,
      renderLib: Cesium,
      modelMatrix: m1,
      canvas: viewer.scene.canvas,
      useEnv: false
    }, (mesh) => {
      console.log("Lcc object loaded: ", mesh);
      mesh.setTranslationOffset(new Cesium.Cartesian3(0, 0, -50))
    });
  }

  destoryLCC() {
    if (this.bhs) {
      LCCRender.unLoad(this.bhs);
      this.bhs = null;
    }
    if (this.qz) {
      LCCRender.unLoad(this.qz);
      this.qz = null;
    }
  }

  getPosition() {
    const { viewer } = this;
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((event) => {
      let cartesian = viewer.camera.pickEllipsoid(event.position);
      let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      let lng = Cesium.Math.toDegrees(cartographic.longitude); // 经度
      let lat = Cesium.Math.toDegrees(cartographic.latitude); // 纬度
      let alt = cartographic.height; // 高度，椭球面height永远等于0
      let coordinate = {
        longitude: Number(lng.toFixed(6)),
        latitude: Number(lat.toFixed(6)),
        altitude: Number(alt.toFixed(2))
      };
      console.log(coordinate)
      return coordinate;
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }
}
