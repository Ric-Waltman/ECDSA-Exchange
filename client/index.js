import "./index.scss";
const secp = require('@noble/secp256k1');

const server = "http://localhost:3042";

document.getElementById("exchange-address").addEventListener('input', ({ target: {value} }) => {
  if(value === "") {
    document.getElementById("balance").innerHTML = 0;
    return;
  }

  fetch(`${server}/balance/${value}`).then((response) => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});

document.getElementById("transfer-amount").addEventListener('click', async () => {
  const sender = document.getElementById("exchange-address").value;
  const privateKey = document.getElementById("private-key").value;
  const amount = document.getElementById("send-amount").value;
  const recipient = document.getElementById("recipient").value;

  // Ensure inputs are valid
  if (!sender) {
    console.error("`Your Public Key` must be valid");
    return;
  }
  else if (!privateKey) {
    console.error("`Private Key` must be valid");
    return;
  }
  else if (!amount) {
    console.error("`Send Amount` must be valid");
    return;
  }
  else if (!recipient) {
    console.error("`To: Public` Key must be valid");
    return;
  }

  let message = { sender, amount, recipient };
  const messageBuf = Buffer.from(JSON.stringify(message));

  let messageHash = await secp.utils.sha256(messageBuf);
  messageHash = Buffer.from(messageHash).toString('hex');

  let signature = await secp.sign(messageHash, privateKey);
  signature = Buffer.from(signature).toString('hex');

  console.log({message, signature});
  const body = JSON.stringify({message, signature});

  const request = new Request(`${server}/send`, { method: 'POST', body });

  fetch(request, { headers: { 'Content-Type': 'application/json' }}).then(response => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});
