
let Vex = require( 'Vex' )
cc.Class({
    extends: cc.Component,

    properties: {
        RoadPrefab:cc.Prefab,
        ObstaclePrefab:cc.Prefab,
    },

    getVexOfMinF( openList ){
        let minF = openList[ 0 ].F
        let minVex = openList[ 0 ]
        for( let i=1; i<openList.length; ++i ){
            if( openList[ i ].F < minF ){
                minF = openList[i].F
                minVex = openList[i]
            }
        }
        return minVex
    },

    removeVexFromArray:function( array, vex  ){
        for( let i=0; i<array.length; ++i ){
            if( array[ i ] == vex ){
                array.splice( i,1 )
                break;
            }
        }
    },

    getVexFromList:function( array, vex ){
        for( let i=0; i<array.length; ++i ){
            if( array[ i ] == vex ){
                return array[ i ]
            }
        }
        return false
    },

    EstimatedH:function( vex, end  ){
        let disX = Math.abs( vex.x - end.x )
        let disY = Math.abs( vex.y - end.y )
        let H = disX + disY
        return H
    },

    Astar:function(start, end, graph, vexList ){
        let openList = [ ], closeList = [ ]
        let direction = [ [0,1], [ 1,0 ], [ 0,-1 ], [ -1,0 ] ]//顺时针
        openList.push( start )
        while( openList.length >0 ){
            //从openList中获取F最小的顶点,从open列表移除后加入close列表
            let minVex = this.getVexOfMinF( openList )

            if( minVex == end ){
                return true
            }

            this.removeVexFromArray( openList, minVex  )
            closeList.push( minVex )
            console.log( openList, closeList )

            //遍历周围可到达的，不在close列表中，且不是障碍物的顶点
            for( let i=0; i<direction.length; ++i ){
                let nextX = minVex.x + direction[i][0]
                let nextY = minVex.y + direction[i][1]
                if( nextX>=0&&nextX<graph[0].length && nextY>=0&&nextY<graph.length && graph[nextX][nextY]==0 && !this.getVexFromList( closeList,vexList[nextX][nextY]  ) ){
                    if( this.getVexFromList( openList, vexList[nextX][nextY] ) ){ //在openList中
                        //计算该探测顶点能否通过当前处理的最小顶点使得G值变小
                        if( minVex.G+1<vexList[nextX][nextY].G ){
                            vexList[nextX][nextY].parentVex = minVex
                            vexList[ nextX ][ nextY ].G = minVex.G+1
                            vexList[ nextX ][ nextY ].F = vexList[ nextX ][ nextY ].H + vexList[ nextX ][ nextY ].G
                        }
                    }else {//不在openList中
                        vexList[nextX][nextY].parentVex = minVex
                        vexList[ nextX ][ nextY ].G = minVex.G+1
                        vexList[ nextX ][ nextY ].H = this.EstimatedH( vexList[ nextX ][ nextY ], end )
                        vexList[ nextX ][ nextY ].F = vexList[ nextX ][ nextY ].H + vexList[ nextX ][ nextY ].G
                        openList.push( vexList[nextX][nextY] )
                    }
                }
            }
        }
        return false
    },

    //建立网格图
    createGraph:function( row, col ){//行列
        return  [
            [0,0,0,0,0,0,0,0],
            [1,0,0,0,0,0,0,0],
            [1,0,0,0,0,0,0,0],
            [1,0,0,0,0,0,0,0],
            [1,0,0,1,0,0,0,0],
            [0,0,1,1,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [1,0,0,0,0,0,0,0],
        ]
    },

    createMap:function( vexList ){
        //将顶点保存在二维数组中，顶点坐标就为顶点在二维数组中的行列号
        //创建顶点,图为5*5，顶点坐标为0,0 - 4,4
        for( let i =0; i<this.graph.length; ++i ){
            for( let j=0; j<this.graph[0].length; ++j ){
                let road = null
                if( this.graph[i][j] == 0 ){
                    road =  cc.instantiate(this.RoadPrefab).getComponent( Vex )
                }else{
                    road =  cc.instantiate(this.ObstaclePrefab).getComponent( Vex )
                }

                road.x = i
                road.y = j
                road.node.parent = this.Map
                road.node.x = road.x * road.node.width
                road.node.y = road.y * road.node.height
                vexList[i][j] = road
            }
        }
        console.log( vexList )
    },

    showPath:function( start, end, vexList){
        let res = this.Astar( start, end, this.graph, vexList  )

        if( !res ){//路径不存在
            this.tip.active = true
            console.log( '路径不存在' )
        }else{
            this.tip.active = false
        }
        var path = [ ]
        let vex = end
        while( vex.parentVex ){
            path.push( vex )
            vex = vex.parentVex
        }
        path.push( start )

        while ( path.length ){
            let vex = path.pop()
            vex.node.opacity = 100
            console.log(vex.x + ','+vex.y + '->' )
        }

    },

    resetVex:function(  vexList ){
        for( let i=0; i<vexList.length; ++i ){
            for( let j=0; j<vexList[i].length; ++j ){
                vexList[ i ][ j ].node.opacity = 255
            }
        }
    },

    onLoad () {
        this.canvas = cc.find( 'Canvas' )
        this.Map =  this.canvas.getChildByName( 'Map' )
        this.tip = this.canvas.getChildByName( 'Tip' )

        let road = cc.instantiate(this.RoadPrefab).getComponent( Vex )
        let obstacle = cc.instantiate( this.ObstaclePrefab ).getComponent( Vex )
        console.log( road )
        console.log( obstacle )

        this.graph = this.createGraph( )
        console.log( this.graph )
        let vexList = new Array( this.graph.length )
        for( let i=0; i<vexList.length; ++i ){
            vexList[ i ] = new Array( this.graph[0].length )
        }

        this.createMap( vexList )

        console.log( vexList )

        let end = vexList[this.graph.length-1][this.graph[0].length-1]
        let start = vexList[0][0]

        this.showPath( start, end, vexList )

        this.canvas.on( 'changeVex', ( event )=>{
            let vexX = event.detail.x
            let vexY = event.detail.y
            let vex = vexList[vexX][vexY]
            if( this.graph[ vexX ][ vexY ] == 0 ){
                this.graph[ vexX ][ vexY ] = 1//改为障碍物
                cc.loader.loadRes("Obstacle", cc.SpriteFrame,  (err, spriteFrame)=>{
                    vex.node.getComponent(cc.Sprite).spriteFrame = spriteFrame
                    this.resetVex( vexList )
                    this.showPath( start, end, vexList )
                })
            }else{
                this.graph[ vexX ][ vexY ] = 0
                cc.loader.loadRes("Road", cc.SpriteFrame,  (err, spriteFrame)=> {
                    vex.node.getComponent(cc.Sprite).spriteFrame = spriteFrame
                    this.resetVex( vexList )
                    this.showPath( start, end, vexList )
                })
            }
        } )
    },

    start () {

    },

    // update (dt) {},
});
