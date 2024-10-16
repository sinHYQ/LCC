/**
 * @author zhangti
 * @param viewer  {object} 三维对象
 * @param options {object} 初始化参数
 * @constructor
 */
export default class Measure {
    constructor(viewer, options = {}) {
      if (viewer instanceof Cesium.Viewer) {
        this._drawLayer = new Cesium.CustomDataSource('measureLayer');
        viewer.dataSources.add(this._drawLayer);
  
        this._basePath = options.basePath || '';
        this._viewer = viewer;
      }
    }

    /***
     * 坐标转换 84转笛卡尔
     * 
     * @param {Object} {lng,lat,alt} 地理坐标
     * @return {Object} Cartesian3 三维位置坐标
     */
    transformWGS84ToCartesian(position, alt) {
      if (this._viewer) {
          return position
            ? Cesium.Cartesian3.fromDegrees(
              position.lng || position.lon,
              position.lat,
              position.alt = alt || position.alt,
              Cesium.Ellipsoid.WGS84
            )
            : Cesium.Cartesian3.ZERO
        }
    }
    
      /***
       * 坐标转换 84转笛卡尔
       * 
       * @param {Object} {lng,lat,alt} 地理坐标
       * 
       * @return {Object} Cartesian3 三维位置坐标
       */
      transformWGS84ToCartesian (position, alt) {
        if (this._viewer) {
          return position
            ? Cesium.Cartesian3.fromDegrees(
              position.lng || position.lon,
              position.lat,
              position.alt = alt || position.alt,
              Cesium.Ellipsoid.WGS84
            )
            : Cesium.Cartesian3.ZERO
        }
      }
      /***
      * 坐标数组转换 笛卡尔转84
      * 
      * @param {Array} WSG84Arr {lng,lat,alt} 地理坐标数组
      * @param {Number} alt 拔高
      * @return {Array} Cartesian3 三维位置坐标数组
      */
      transformWGS84ArrayToCartesianArray (WSG84Arr, alt) {
        if (this._viewer && WSG84Arr) {
          const $this = this
          return WSG84Arr
            ? WSG84Arr.map(function (item) { return $this.transformWGS84ToCartesian(item, alt) })
            : []
        }
      }
      /***
       * 坐标转换 笛卡尔转84
       * 
       * @param {Object} Cartesian3 三维位置坐标
       * 
       * @return {Object} {lng,lat,alt} 地理坐标
       */
      transformCartesianToWGS84 (cartesian) {
        if (this._viewer && cartesian) {
          const ellipsoid = Cesium.Ellipsoid.WGS84
          const cartographic = ellipsoid.cartesianToCartographic(cartesian)
          return {
            lng: Cesium.Math.toDegrees(cartographic.longitude),
            lat: Cesium.Math.toDegrees(cartographic.latitude),
            alt: cartographic.height
          }
        }
      }
      /***
      * 坐标数组转换 笛卡尔转86
      * 
      * @param {Array} cartesianArr 三维位置坐标数组
      * 
      * @return {Array} {lng,lat,alt} 地理坐标数组
      */
      transformCartesianArrayToWGS84Array (cartesianArr) {
        if (this._viewer) {
          const $this = this
          return cartesianArr
            ? cartesianArr.map(function (item) { return $this.transformCartesianToWGS84(item) })
            : []
        }
      }
      /**
       * 84坐标转弧度坐标
       * @param {Object} position wgs84
       * @return {Object} Cartographic 弧度坐标
       * 
       */
      transformWGS84ToCartographic (position) {
        return position
          ? Cesium.Cartographic.fromDegrees(
            position.lng || position.lon,
            position.lat,
            position.alt
          )
          : Cesium.Cartographic.ZERO
      }
      /**
     * 拾取位置点
     * 
     * @param {Object} px 屏幕坐标
     * 
     * @return {Object} Cartesian3 三维坐标
     */
      getCatesian3FromPX (px) {

        if (this._viewer && px) {
          const picks = this._viewer.scene.drillPick(px)
          const cartesian = null;
          const isOn3dtiles = false, isOnTerrain = false;
          // drillPick
          for (let i in picks) {
            let pick = picks[i]

            if (pick &&
              pick.primitive instanceof Cesium.Cesium3DTileFeature
              || pick && pick.primitive instanceof Cesium.Cesium3DTileset
              || pick && pick.primitive instanceof Cesium.Model) { //模型上拾取
              isOn3dtiles = true;
            }
            // 3dtilset
            if (isOn3dtiles) {
              this._viewer.scene.pick(px) // pick
              cartesian = this._viewer.scene.pickPosition(px);
              if (cartesian) {
                let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                if (cartographic.height < 0) cartographic.height = 0;
                let lon = Cesium.Math.toDegrees(cartographic.longitude)
                  , lat = Cesium.Math.toDegrees(cartographic.latitude)
                  , height = cartographic.height;
                cartesian = this.transformWGS84ToCartesian({ lng: lon, lat: lat, alt: height })

              }
            }
          }
          // 地形
          let boolTerrain = this._viewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider;
          // Terrain
          if (!isOn3dtiles && !boolTerrain) {
            const ray = this._viewer.scene.camera.getPickRay(px);
            if (!ray) return null;
            cartesian = this._viewer.scene.globe.pick(ray, this._viewer.scene);
            isOnTerrain = true
          }
          // 地球
          if (!isOn3dtiles && !isOnTerrain && boolTerrain) {

            cartesian = this._viewer.scene.camera.pickEllipsoid(px, this._viewer.scene.globe.ellipsoid);
          }
          if (cartesian) {
            let position = this.transformCartesianToWGS84(cartesian)
            if (position.alt < 0) {
              cartesian = this.transformWGS84ToCartesian(position, 0.1)
            }
            return cartesian;
          }
          return false;
        }

      }
      /**
       * 获取84坐标的距离
       * @param {*} positions 
       */
      getPositionDistance (positions) {
        let distance = 0
        for (let i = 0; i < positions.length - 1; i++) {
          let point1cartographic = this.transformWGS84ToCartographic(positions[i])
          let point2cartographic = this.transformWGS84ToCartographic(positions[i + 1])
          let geodesic = new Cesium.EllipsoidGeodesic()
          geodesic.setEndPoints(point1cartographic, point2cartographic)
          let s = geodesic.surfaceDistance
          s = Math.sqrt(
            Math.pow(s, 2) +
            Math.pow(point2cartographic.height - point1cartographic.height, 2)
          )
          distance = distance + s
        }
        return distance.toFixed(3)
      }
      /**
      * 计算一组坐标组成多边形的面积
      * @param {*} positions 
      */
      getPositionsArea (positions) {
        let result = 0
        if (positions) {
          let h = 0
          let ellipsoid = Cesium.Ellipsoid.WGS84
          positions.push(positions[0])
          for (let i = 1; i < positions.length; i++) {
            let oel = ellipsoid.cartographicToCartesian(
              this.transformWGS84ToCartographic(positions[i - 1])
            )
            let el = ellipsoid.cartographicToCartesian(
              this.transformWGS84ToCartographic(positions[i])
            )
            h += oel.x * el.y - el.x * oel.y
          }
          result = Math.abs(h).toFixed(2)
        }
        return result
      }
      /**
       * 测距
       * @param {*} options 
       */
      drawLineMeasureGraphics (options = {}) {
        if (this._viewer && options) {
          const {type} = options; // Horizontal Vertical
          const lccObj = options.lccObj;
          const viewer = this._viewer;
          let positions = [], _lineEntity = new Cesium.Entity(), $this = this, lineObj;

          let tempZ, tempX, tempY;

          const clickHander = function clickHander(evt) {
            let cartesian = lccObj.raycast({ evt: evt, maxDistance: 100, radius: 0.01 });
            if (cartesian && cartesian.x) {
              if (positions.length == 0) {
                positions.push(cartesian.clone());
              }
              if(type === 'Horizontal') { // 水平
                tempZ = cartesian.z;
              } else if(type === 'Vertical') {  // 垂直
                tempX = cartesian.x;
                tempY = cartesian.y;
              }
              _addInfoPoint(cartesian)
              positions.push(cartesian);
            }
          }

          const mousemoveHander = function mousemoveHander(evt) {
            let cartesian = lccObj.raycast({ evt: evt, maxDistance: 100, radius: 0.01 });
            if (positions.length >= 2) {
              if (cartesian && cartesian.x) {
                if(type === 'Horizontal') { // 水平
                  cartesian.z = tempZ;
                } else if(type === 'Vertical') {  // 垂直
                  cartesian.x = tempX;
                  cartesian.y = tempY;
                }
                positions.pop();
                positions.push(cartesian);
              }
            }
          }
          const contextmenuHander = function contextmenuHander(evt) {
            positions.pop();
            viewer.canvas.removeEventListener('click', clickHander);
            viewer.canvas.removeEventListener('mousemove', mousemoveHander);
            viewer.canvas.removeEventListener('contextmenu', contextmenuHander);
            if (typeof options.callback === 'function') {
              options.callback($this.transformCartesianArrayToWGS84Array(positions), lineObj);
            }
          }
          _lineEntity.polyline = {
            width: 4,
            material: Cesium.Color.BLUE,
            clampToGround: false
          }
          _lineEntity.polyline.positions = new Cesium.CallbackProperty(function () {
            return positions
          }, false)

          lineObj = $this._drawLayer.entities.add(_lineEntity)

          function _addInfoPoint(position) {
            _labelEntity = new Cesium.Entity()
            _labelEntity.position = position
            _labelEntity.point = {
              pixelSize: 10,
              outlineColor: Cesium.Color.BLUE,
              outlineWidth: 5
            }
            _labelEntity.label = {
              text: ($this.getPositionDistance($this.transformCartesianArrayToWGS84Array(positions))) + '米',
              show: true,
              showBackground: true,
              font: '16px monospace',
              horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(-20, -80) //left top
            }
            $this._drawLayer.entities.add(_labelEntity)
          }

          viewer.canvas.addEventListener('click', clickHander);
          viewer.canvas.addEventListener('mousemove', mousemoveHander);
          viewer.canvas.addEventListener('contextmenu', contextmenuHander);
        }

      }
      /**
       * 测面积
       * @param {*} options 
       */
      drawAreaMeasureGraphics (options = {}) {
        if (this._viewer && options) {
          const lccObj = options.lccObj;
          const viewer = this._viewer;
          const positions = [], polygon = new Cesium.PolygonHierarchy(), _polygonEntity = new Cesium.Entity(), $this = this, polyObj = null;
          const clickHander = function clickHander(evt) {
            let cartesian = lccObj.raycast({ evt: evt, maxDistance: 100, radius: 0.01 });
            console.log($this.transformCartesianToWGS84(cartesian))
            if (cartesian && cartesian.x) {
              if (positions.length == 0) {
                polygon.positions.push(cartesian.clone())
                positions.push(cartesian.clone());
              }
              positions.push(cartesian.clone());
              polygon.positions.push(cartesian.clone())

              // _addInfoPoint(cartesian)
              if (!polyObj) create()
            }
          };
          const mousemoveHander = function mousemoveHander(evt) {
            let cartesian = lccObj.raycast({ evt: evt, maxDistance: 100, radius: 0.01 });
            if (positions.length >= 2) {
              if (cartesian && cartesian.x) {
                positions.pop()
                positions.push(cartesian);
                polygon.positions.pop()
                polygon.positions.push(cartesian);
              }
            }
          };
          const contextmenuHander = function contextmenuHander(evt) {
            viewer.canvas.removeEventListener('click', clickHander);
            viewer.canvas.removeEventListener('mousemove', mousemoveHander);
            viewer.canvas.removeEventListener('contextmenu', contextmenuHander);
            positions.push(positions[0]);
            // 添加信息点
            _addInfoPoint(positions[0])
            if (typeof options.callback === 'function') {
              options.callback($this.transformCartesianArrayToWGS84Array(positions), polyObj);
            }
          };

          function create() {
            _polygonEntity.polyline = {
              width: 5,
              material: Cesium.Color.BLUE,
              clampToGround: false
            }

            _polygonEntity.polyline.positions = new Cesium.CallbackProperty(function () {
              return positions
            }, false)

            // _polygonEntity.polygon = {
            //   hierarchy: new Cesium.CallbackProperty(function () {
            //     return polygon
            //   }, false),
            //   material: Cesium.Color.RED,
            //   clampToGround: false
            // }

            polyObj = $this._drawLayer.entities.add(_polygonEntity)
          }

          function _addInfoPoint(position) {
            const _labelEntity = new Cesium.Entity()
            _labelEntity.position = position
            _labelEntity.point = {
              pixelSize: 10,
              outlineColor: Cesium.Color.BLUE,
              outlineWidth: 5
            }
            _labelEntity.label = {
              text: ($this.getPositionsArea($this.transformCartesianArrayToWGS84Array(positions))) + '平方米',
              show: true,
              showBackground: true,
              font: '14px monospace',
              horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(-20, -50) //left top
            }
            $this._drawLayer.entities.add(_labelEntity)
          }


          viewer.canvas.addEventListener('click', clickHander);
          viewer.canvas.addEventListener('mousemove', mousemoveHander);
          viewer.canvas.addEventListener('contextmenu', contextmenuHander);
        }

      }
      /**
       * 画三角量测
       * @param {*} options 
       */
      drawTrianglesMeasureGraphics (options = {}) {
        options.style = options.style ||
        {
          width: 3
          , material: Cesium.Color.BLUE.withAlpha(0.5)
        }
        if (this._viewer && options) {

          const _trianglesEntity = new Cesium.Entity(), _tempLineEntity = new Cesium.Entity(), _tempLineEntity2 = new Cesium.Entity(),
            _positions = [], _tempPoints = [], _tempPoints2 = [], $this = this,
            _handler = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas);
          // 高度
          function _getHeading(startPosition, endPosition) {
            if (!startPosition && !endPosition) return 0
            if (Cesium.Cartesian3.equals(startPosition, endPosition)) return 0
            let cartographic = Cesium.Cartographic.fromCartesian(startPosition);
            let cartographic2 = Cesium.Cartographic.fromCartesian(endPosition);
            return (cartographic2.height - cartographic.height).toFixed(2)
          }
          // 偏移点
          function _computesHorizontalLine(positions) {
            let cartographic = Cesium.Cartographic.fromCartesian(positions[0]);
            let cartographic2 = Cesium.Cartographic.fromCartesian(positions[1]);
            return Cesium.Cartesian3.fromDegrees(
              Cesium.Math.toDegrees(cartographic.longitude),
              Cesium.Math.toDegrees(cartographic.latitude),
              cartographic2.height
            )
          }
          // left
          _handler.setInputAction(function (movement) {

            const position = $this.getCatesian3FromPX(movement.position);
            if (!position && !position.z) return false
            if (_positions.length == 0) {
              _positions.push(position.clone())
              _positions.push(position.clone())
              _tempPoints.push(position.clone())
              _tempPoints.push(position.clone())
            } else {
              _handler.destroy();
              if (typeof options.callback === 'function') {

                options.callback({ e: _trianglesEntity, e2: _tempLineEntity, e3: _tempLineEntity2 });
              }
            }
          }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
          // mouse
          _handler.setInputAction(function (movement) {

            const position = $this.getCatesian3FromPX(movement.endPosition);
            if (position && _positions.length > 0) {
              //直线
              _positions.pop()
              _positions.push(position.clone());
              let horizontalPosition = _computesHorizontalLine(_positions)
              //高度
              _tempPoints.pop()
              _tempPoints.push(horizontalPosition.clone())
              //水平线
              _tempPoints2.pop(), _tempPoints2.pop()
              _tempPoints2.push(position.clone())
              _tempPoints2.push(horizontalPosition.clone())
            }
          }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

          // create entity

          //直线
          _trianglesEntity.polyline = {
            positions: new Cesium.CallbackProperty(function () {
              return _positions
            }, false),
            ...options.style
          }
          _trianglesEntity.position = new Cesium.CallbackProperty(function () {
            return _positions[0]
          }, false)
          _trianglesEntity.point = {
            pixelSize: 5,
            outlineColor: Cesium.Color.BLUE,
            outlineWidth: 5
          }
          _trianglesEntity.label = {
            text: new Cesium.CallbackProperty(function () {
              return '直线:' + $this.getPositionDistance($this.transformCartesianArrayToWGS84Array(_positions)) + '米'
            }, false),
            show: true,
            showBackground: true,
            font: '14px monospace',
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(50, -100) //left top
          }
          //高度
          _tempLineEntity.polyline = {
            positions: new Cesium.CallbackProperty(function () {
              return _tempPoints
            }, false),
            ...options.style
          }
          _tempLineEntity.position = new Cesium.CallbackProperty(function () {
            return _tempPoints2[1]
          }, false)
          _tempLineEntity.point = {
            pixelSize: 5,
            outlineColor: Cesium.Color.BLUE,
            outlineWidth: 5
          }
          _tempLineEntity.label = {
            text: new Cesium.CallbackProperty(function () {
              return '高度:' + _getHeading(_tempPoints[0], _tempPoints[1]) + '米'
            }, false),
            show: true,
            showBackground: true,
            font: '14px monospace',
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(-20, 100) //left top
          }
          //水平
          _tempLineEntity2.polyline = {
            positions: new Cesium.CallbackProperty(function () {
              return _tempPoints2
            }, false),
            ...options.style
          }
          _tempLineEntity2.position = new Cesium.CallbackProperty(function () {
            return _positions[1]
          }, false)
          _tempLineEntity2.point = {
            pixelSize: 5,
            outlineColor: Cesium.Color.BLUE,
            outlineWidth: 5
          }
          _tempLineEntity2.label = {
            text: new Cesium.CallbackProperty(function () {
              return '水平距离:' + $this.getPositionDistance($this.transformCartesianArrayToWGS84Array(_tempPoints2)) + '米'
            }, false),
            show: true,
            showBackground: true,
            font: '14px monospace',
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(-150, -20) //left top
          }
          this._drawLayer.entities.add(_tempLineEntity2)
          this._drawLayer.entities.add(_tempLineEntity)
          this._drawLayer.entities.add(_trianglesEntity)
        }
      }
}
Cesium.Measure = Measure;