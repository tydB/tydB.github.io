let lat = 0
let long = 0
let checking = false
let pos_array = []
let last_center = [0,0]
let canvas
let ctx

let REFRESH_INTERVAL = 500
let FAKE_DATA = false

function init() {
    initCanvas()
    // setTimeout(updateLocal, REFRESH_INTERVAL)
    updateLocal()
}

function toggleDataType() {
    FAKE_DATA = !FAKE_DATA
}

function initCanvas() {
    canvas = document.getElementById('draw_space')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    ctx = canvas.getContext('2d')
    console.log(ctx)
}

function fakeUpdate() {
    let x = 0;
    if (pos_array.length != 0) {
        x = pos_array[pos_array.length - 1][0] + 5
    }
    pos_array.push([x,Math.random() * 50   ])
    updateUI()
}

function updateLocal() {
    if (FAKE_DATA) {
        fakeUpdate()
        setTimeout(updateLocal, REFRESH_INTERVAL)
    }
    else {

        let nav = navigator.geolocation
        nav.getCurrentPosition((pos) => {
            console.log("Got Local")
            let lat = pos.coords.latitude
            let long = pos.coords.longitude
            pos_array.push([lat,long])
            setTimeout(updateLocal, REFRESH_INTERVAL)
            updateUI()
        })
    }
}
    
function updateUI() {
    // console.log(pos_array.length)
    let new_center = [0,0]
    ctx.clearRect(0,0,canvas.width,canvas.height)
    ctx.save()
    ctx.translate((canvas.width / 2) - last_center[0], (canvas.height / 2) - last_center[1])
    ctx.beginPath()
    ctx.moveTo(pos_array[0][0], pos_array[0][1])
    pos_array.forEach((pos) => {
        new_center[0] += pos[0]
        new_center[1] += pos[1]
        ctx.lineTo(pos[0], pos[1])
        ctx.fillRect(pos[0] - 5, pos[1] - 5, 10, 10)
    })
    ctx.stroke()
    ctx.closePath()
    ctx.restore()
    new_center[0] /= pos_array.length
    new_center[1] /= pos_array.length
    last_center = new_center
}