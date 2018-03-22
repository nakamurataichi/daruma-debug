window.addEventListener("load", async () => {
  const socket = new WebSocket(config.wsServer);
  const sleep = ms => {
    return new Promise((resolve, reject) => setTimeout(resolve, ms));
  };
  const drive = speed => {
    socket.send(JSON.stringify({
      type: "status",
      onoff: "COMMAND",
      command: speed
    }));
  };
  const stop = () => {
    socket.send(JSON.stringify({
      type: "status",
      onoff: "COMMAND",
      command: "stop"
    }));
  };
  const speedLabel = document.getElementById("speed");
  const statusLabel = document.getElementById("status");
  const textArea = document.getElementById("script-area");
  const button = document.getElementById("player");
  let playing = false;

  document.getElementById("sleepFunc").onclick = e => {
    textArea.value += "sleep();\n";
    textArea.focus();
  };
  document.getElementById("driveFunc").onclick = e => {
    textArea.value += "drive();\n";
    textArea.focus();
  };
  document.getElementById("stopFunc").onclick = e => {
    textArea.value += "stop();\n";
    textArea.focus();
  };

  for (const radioButton of document.getElementsByTagName("input")) {
    radioButton.onclick = e => {
      socket.send(JSON.stringify({
        type: "status",
        onoff: "COMMAND",
        command: radioButton.value
      }));
    };
  }

  button.onclick = async e => {
    if (!playing) {
      playing = true;
      button.textContent = "終了";
      const functions = textArea.value.split("\n");
      for (const func of functions) {
        func.replace("sleep(", "await sleep(");
        if (playing !== false) {
          await eval(func);
        } else {
          return;
        }
      }
    } else {
      playing = false;
      button.textContent = "開始";
      stop();
    }
  };

  socket.onmessage = message => {
    const data = JSON.parse(message);
    if (data.type === "motor") {
      statusLabel.textContent = `status=${data.err} stat: ${data.stat}`;
    }
    if (data.type === "speed") {
      speedLabel.textContent = `speed=${data.speed}`;
    }
  };
});
