window.handleOrientation = function(event) {
      // gamma: esquerda/direita, beta: frente/trás
      window.tiltX = event.gamma || 0;
      window.tiltY = event.beta || 0;
    }

window.enableOrientation = async function() {
    try {
        if (typeof DeviceOrientationEvent !== "undefined" &&
            typeof DeviceOrientationEvent.requestPermission === "function") {
            const response = await DeviceOrientationEvent.requestPermission();
            if (response === "granted") {
            window.addEventListener("deviceorientation", handleOrientation);
            statusEl.textContent = "Sensores ativados! Jogo em curso.";
            gameStarted = true;
            } else {
            statusEl.textContent = "Permissão negada. Não é possível usar o sensor de movimento.";
            }
    } else {
        // Android / outros
        window.addEventListener("deviceorientation", handleOrientation);
        statusEl.textContent = "Sensores ativados! Jogo em curso.";
        gameStarted = true;
    }
    } catch (err) {
        console.error(err);
        statusEl.textContent = "Erro ao tentar aceder ao sensor de movimento.";
    }
}