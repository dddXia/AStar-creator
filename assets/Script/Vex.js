

var Vex = cc.Class({
    extends: cc.Component,

    ctor:function(  ){
        this.x = 0
        this.y = 0
        this.F = 0
        this.G = 0
        this.H = 0
        this.parentVex = null
    },

    getWidth:function( ){
        return this.node.width
    },

    getHeight:function( ){
        return this.node.height
    },

    properties: {

    },

    init:function( x, y, F, G, H ){
      this.x = x
      this.y = y
      this.F = F?F:0
      this.G = G?G:0
      this.H = H?G:0
    },

    onLoad(  ) {
        this.canvas = cc.find( 'Canvas' )
        this.node.on( 'mousedown', this.changeVex, this  )
    },

    changeVex:function (  ) {
        console.log('点击' )
        this.canvas.emit( 'changeVex', {
            x:this.x,
            y:this.y,
        })
    },
});
