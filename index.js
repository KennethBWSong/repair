const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

let currentId = 0;
let memoryStorage = {};
const engineerNames = [
  "Karin Blair",
  "Issac Fielder",
  "Kat Larsson",
  "Ashley McCarthy",
  "Cecil Folk",
  "Daisy Phillips",
];
const phoneNumbers = ["123456789", "987654321", "135792468", "246813579"];
const imageUrls = [
  "https://upload.wikimedia.org/wikipedia/commons/7/71/Disk_brake_dsc03680.jpg",
  "https://www.howmuchisit.org/wp-content/uploads/2011/01/oil-change.jpg",
  "https://th.bing.com/th/id/OIP.N64J4jmqmnbQc5dHvTm-QAHaE8?pid=ImgDet&rs=1",
  "https://i.stack.imgur.com/4ftuj.jpg",
];

app.get("/assignRepair", (req, res) => {
  const carType = req.query.carType;
  const repairType = req.query.repairType;
  const customerName = req.query.customerName;
  const customerPhoneNumber = req.query.customerPhoneNumber;

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send('Unauthorized');
    return;
  }
  const auth = authHeader.split(' ');
  if (auth.length !== 2 || auth[0] !== 'Bearer') {
    res.status(401).send('Unauthorized');
    return;
  }
  const token = auth[1];

  console.log(`Receive request /assignRepair with parameters: carType: ${carType}, repairType: ${repairType}, customerName: ${customerName}, customerPhoneNumber: ${customerPhoneNumber}`);

  if (!carType || !repairType || !customerName || !customerPhoneNumber) {
    res
      .status(400)
      .send("CarType, repairType, customerPhoneNumber and customerName are required parameters");
    return;
  }

  var result = generateRandomMockResult(
    currentId,
    carType,
    repairType,
    customerName,
    customerPhoneNumber,
    token
  );
  memoryStorage[currentId] = result;
  currentId++;
  res.json(result);
});

app.get("/payRepair", (req, res) => {
  const customerName = req.query.customerName;
  console.log(`Receive request /payRepair with parameters: customerName: ${customerName}`);

  if (!customerName) {
    res.status(400).send("customerName is required parameter");
    return;
  }

  res.json({
    message: `Payment for customer: ${customerName} Success`
  });
});

app.get("/findRepair", (req, res) => {
  const customerName = req.query.customerName;
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send('Unauthorized');
    return;
  }
  const auth = authHeader.split(' ');
  if (auth.length !== 2 || auth[0] !== 'Bearer') {
    res.status(401).send('Unauthorized');
    return;
  }
  const token = auth[1];

  console.log(`Receive request /findRepair with parameters: customerName: ${customerName}`);

  if (!customerName) {
    res.status(400).send("customerName is required parameter");
    return;
  }

  const result = findRepairByCustomerName(customerName, token);

  if (!result) {
    res
      .status(404)
      .send(
        "Cannot find any repairs that belong to the customer: " + customerName
      );
    return;
  }

  res.json(result);
});

function findRepairByCustomerName(customerName, token) {
  let result;
  const apiKey = getNameFromToken(token);
  for (let id in memoryStorage) {
    if (memoryStorage[id].customerName === customerName) {
      result = memoryStorage[id];
    }
  }
  result.apiKey = apiKey;
  return result;
}

function generateRandomMockResult(id, carType, repairType, customerName, customerPhoneNumber, token) {
  const apiKey = getApiKeyFromToken(token);
  return {
    id: id,
    title:
      carType +
      " " +
      repairType +
      " " +
      "task has been assigned to the engineer",
    assignedTo: engineerNames[id % engineerNames.length],
    customerName: customerName,
    customerPhoneNumber: customerPhoneNumber,
    date: new Date().toString(),
    image: imageUrls[id % imageUrls.length],
    apiKey: apiKey,
  };
}

function getApiKeyFromToken(token) {
  return token;
}

app.listen(port, () => {
  console.log(`Repair app listening on port ${port}`);
});
