function redeemA() {
    navigator.geolocation.getCurrentPosition(showPosition);
}

function showPosition(position) {
    var {latitude,longitude } = position.coords;
    console.log(latitude,longitude);
}

async function reddem() {
    console.log(await axios.get("http://localhost:3000/reddem/"));
}