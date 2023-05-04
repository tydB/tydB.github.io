let lat = 0
let long = 0
let checking = false


function init() {
    updateLocal()
}

function updateLocal() {
    checking = true
    updateUI()
    let nav = navigator.geolocation
    nav.getCurrentPosition((pos) => {
        lat = pos.coords.latitude
        long = pos.coords.longitude
        checking = false
        updateUI()
        setInterval(updateLocal, 5000)
    })
}

function updateUI() {
    let a = document.getElementById('app')
    let c = checking? "Checking": "Done"
    a.innerHTML = `
        <h3>Location</h3>
        <div>Lat: ${lat}</div>
        <div>Long: ${long}</div>
        <div>${c}</div>
    `
}