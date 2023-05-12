let lat = 0
let long = 0
let checking = false
let pos_array = []
let last_center = [0,0]
let canvas
let ctx

class BBox {
    constructor() {
        this.x_small = Infinity
        this.y_small = Infinity
        this.x_large = -Infinity
        this.y_large = -Infinity
        this.z_small = Infinity
        this.z_large = -Infinity
    }
    width() {
        return this.x_large - this.x_small
    }
    height() {
        return this.y_large - this.y_small
    }
    draw(ctx) {
        ctx.strokeRect(this.x_small, this.y_small, this.width(), this.height())
    }
    update(point) {
        if (point.x < this.x_small) {
            this.x_small = point.x
        }
        if (point.y < this.y_small) {
            this.y_small = point.y
        }
        if (point.z < this.z_small) {
            this.z_small = point.z
        }
        if (point.x > this.x_large) {
            this.x_large = point.x
        }
        if (point.y > this.y_large) {
            this.y_large = point.y
        }
        if (point.z > this.z_large) {
            this.z_large = point.z
        }
    }
}

class Point {
    constructor(x, y, z) {
        this.x = x
        this.y = y
        this.z = z
    }
}

class Path {
    constructor() {
        this.bbox = new BBox()
        this.points = []
    }
    push(point) {
        this.bbox.update(point)
        this.points.push(point)
    }
    last_delta() {
        if (this.points.length <= 1) {
            return new Point(0,0,0)
        }
        let len = this.points.length
        return new Point(this.points[len - 1].x - this.points[len - 2].x,
            this.points[len - 1].y - this.points[len - 2].y,
            this.points[len - 1].z - this.points[len - 2].z)
    }
}


let HosePath = new Path();
let REFRESH_INTERVAL = 500
let FAKE_DATA = true

function init() {
    initCanvas()
    // setTimeout(updateLocal, REFRESH_INTERVAL)
    // updateLocal()
}

function toggleDataType() {
    FAKE_DATA = !FAKE_DATA
}

function initCanvas() {
    canvas = document.getElementById('draw_space')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    canvas.onclick = (event) => {
        if (FAKE_DATA) {
            HosePath.push(new Point(event.pageX, event.pageY, 2000))
        }
        updateUI()
        // circle_add()
    }

    ctx = canvas.getContext('2d')
    console.log(ctx)
}

function circle_add() {
    if (HosePath.points.length == 0) {
        HosePath.push(new Point(0,0,0))
    }
    else {
        let len = HosePath.points.length
        let across_scale = 1
        HosePath.push(new Point(Math.sin(len * across_scale) * len , Math.cos(len * across_scale) * len, 2000 + len))
    }
    updateUI()
    setTimeout(circle_add, REFRESH_INTERVAL)
}

function fakeUpdate() {
    let x = 0;
    if (HosePath.points.length != 0) {
        x = HosePath.points[HosePath.points.length - 1].x + 15
    }
    // HosePath.push([x,Math.random() * 50, Math.random() * 50 + 2000])
    HosePath.push(new Point(x, Math.random() * 50, Math.random() * 50 + 2000))
    updateUI()
}

function updateLocal() {
    if (FAKE_DATA) {
        fakeUpdate()
        setTimeout(updateLocal, REFRESH_INTERVAL / 50)
    }
    else {

        let nav = navigator.geolocation
        nav.getCurrentPosition((pos) => {
            console.log("Got Local")
            let lat = pos.coords.latitude
            let long = pos.coords.longitude
            let alt = pos.coords.altitude
            HosePath.push(new Point(lat,long,alt))
            setTimeout(updateLocal, REFRESH_INTERVAL)
            updateUI()
        })
    }
}
    
function updateUI() {
    ctx.clearRect(0,0,canvas.width,canvas.height)
    ctx.fillStyle = "blue"
    let delta = HosePath.last_delta()
    ctx.save()
    ctx.beginPath()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.fillRect(0- 5, 0 - 5, 10, 10)
    ctx.fillStyle = "black"
    // translate to the center of the bbox is in the center of the canvas
    let width = HosePath.bbox.width()
    let height = HosePath.bbox.height()
    let center_x = HosePath.bbox.x_small + width / 2
    let center_y = HosePath.bbox.y_small + height / 2
    let scale = 1
    let scale_x = 1
    let scale_y = 1
    let inside_margin = 10
    scale_x = (canvas.width  - (inside_margin * 2)) / width
    scale_y = (canvas.height  - (inside_margin * 2)) / height
    scale = scale_y
    if (scale_x < scale_y) {
        scale = scale_x
    }
    console.log(`Scale ${scale}`)
    ctx.scale(scale, scale)
    console.log(`Centers ${center_x}, ${center_y}`)
    ctx.translate(-center_x, -center_y)

    HosePath.bbox.draw(ctx)

    HosePath.points.forEach((point) => {
        ctx.save()
        let size = (point.z / 2000) + 5
        ctx.fillRect(point.x - size / 2, point.y - size / 2, size, size)
        ctx.restore()
    })
    ctx.stroke()
    ctx.closePath()
    ctx.restore()
    ctx.fillText((FAKE_DATA)?"GPS":"FAKE    ", 10, 10)
    ctx.fillText(`Delta: (${delta.x}, ${delta.y}, ${delta.z})`, 10,20)
}