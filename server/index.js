const secp = require('@noble/secp256k1');
const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

// Maps Public Keys to Amounts
let accounts = {
  "0x508e2ce37cb80296005a1bfb9b23a958f0c0376a": {
    amount: 100,
    fullPublicKey: "04049270e90ca01b390c4c48fca482b212a1e3140b4768048af8ff6096005775ad9ce1abfebf25802246646f68508e2ce37cb80296005a1bfb9b23a958f0c0376a"
  },
  "0xde8a37901b2ff4aa0de460b725e1ac660ea51175": {
    amount: 100,
    fullPublicKey: "04f31f962f8fa6100efe47a8db0d88dbfb617b8cc1d77b153c43e4f42078ca20e0f44a947c8b9dc455aa7300fcde8a37901b2ff4aa0de460b725e1ac660ea51175"
  },
  "0x4d5852ffb0976e0d7bb62d537753d5da412c222e": {
    amount: 100,
    fullPublicKey: "04c96abec62cf74061bc31bff2bc8695badd0d5c2db0a132e6b005ea09683d8b0ee8409e31fd40458962e47faf4d5852ffb0976e0d7bb62d537753d5da412c222e"
  },
};

console.log(accounts);

app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = accounts[address].amount || 0;
  res.send({ balance });
});

app.post('/send', async (req, res) => {
  console.log(req.body);

  const {message, signature} = req.body;
  const {sender, amount, recipient} = message;

  // Verify Signature
  const messageBuf = Buffer.from(JSON.stringify(message));
  let messageHash = await secp.utils.sha256(messageBuf);
  const isValid = secp.verify(signature, messageHash, accounts[sender].fullPublicKey);

  console.log("Signature isValid=" + isValid);
  if(isValid) {
    accounts[sender].amount -= amount;
    accounts[recipient].amount = (accounts[recipient].amount || 0) + +amount;
    res.send({ balance: accounts[sender].amount });
  } else {
    console.error("Signature is invalid!");
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
