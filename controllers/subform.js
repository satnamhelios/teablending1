const axios = require("axios");
const data = require("../data.json");
const { updateRequiredQuantity, saveUpdatedJson } = require("./editSubform");
const path = require("path");
const fs = require("fs");

const zohoClientId = "1000.ZW53NLBZ0Y1A3DG0LGWF0NU3N2ZTPI";
const zohoClientSecret = "e80a1e3106a5e9e079908efebf32625c0185900ae1";
const zohoRefreshToken =
  "1000.b5ecc407637fc30c4bf4c0787a28ca4b.9a50b3b5535946bf3bf7cb7cade7f2ee";
let access_token;

getZohoAccessToken().then((data) => {
  access_token = data;
  console.log("access_token", access_token);
});

setInterval(async () => {
  access_token = await getZohoAccessToken();
  console.log("access_token", access_token);
}, 1000 * 60 * 60);

const createErrorString = (error) => {
  if (Array.isArray(error)) {
    // If error is an array, join its elements into a single string
    return error.join(", ");
  } else if (typeof error === "object" && error !== null) {
    // If error is an object, map its keys to their values and join them into a single string
    return Object.keys(error)
      .map((key) => error[key])
      .join(", ");
  } else {
    // For any other type (just in case), return an empty string or a default message
    return "An unknown error occurred";
  }
};

exports.getSubFormData = async (req, res) => {
  try {
    const data = await computeSubFormData();

    res.status(200).json({ message: "Data updated successfully", data });
  } catch (error) {
    console.error("Error updating data.json:", error.message);
  }
};

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

exports.getGardens = (req, res) => {
  const gardenSet = new Set();

  data.forEach((item) => {
    item.Batch_Details.forEach((batch) => {
      if (batch.Garden && batch.Grade) {
        gardenSet.add(batch.Garden);
      }
    });
  });

  const gardens = Array.from(gardenSet);
  res.json(gardens);
};

exports.getGradesByGarden = (req, res) => {
  const { garden } = req.body;

  if (!garden) {
    return res.status(400).json({ error: "Garden is required" });
  }

  const grades = new Set();

  data.forEach((item) => {
    item.Batch_Details.forEach((batch) => {
      if (batch.Garden === garden) {
        grades.add(batch.Grade);
      }
    });
  });

  const uniqueGrades = Array.from(grades);
  res.json(uniqueGrades);
};

// exports.getDocumentsByGardenAndGrade = (req, res) => {
//   const { garden, grades, index } = req.body;
//   const limit = 100;

//   if (
//     !garden ||
//     !grades ||
//     !Array.isArray(grades) ||
//     index === undefined ||
//     index < 0
//   ) {
//     return res.status(400).json({
//       error:
//         "Garden, grades, and a valid index are required. Grades should be an array, and index should be a non-negative number",
//     });
//   }

//   const lowerCaseGarden = garden.toLowerCase();
//   const lowerCaseGrades = grades.map((grade) => grade.toLowerCase());

//   // Filter matching documents
//   const matchingDocuments = data
//     .map((item) => {
//       const filteredBatchDetails = item.Batch_Details.filter((batch) => {
//         const isGardenMatch = batch.Garden.toLowerCase() === lowerCaseGarden;
//         const isGradeMatch = lowerCaseGrades.includes(
//           batch.Grade.toLowerCase()
//         );
//         // console.log("batch", batch.Available_Quantity);
//         const isQuantityAvailable = batch.Available_Quantity > 0;

//         return isGardenMatch && isGradeMatch && isQuantityAvailable;
//       });

//       if (filteredBatchDetails.length > 0) {
//         return {
//           ...item,
//           Batch_Details: filteredBatchDetails,
//         };
//       }
//       return null;
//     })
//     .filter((item) => item !== null);

//   // Paginate results
//   const paginatedDocuments = matchingDocuments.slice(index, index + limit);
//   const hasNext = matchingDocuments.length > index + limit;

//   res.json({
//     documents: paginatedDocuments,
//     hasNext,
//   });
// };

exports.getDocumentsByGardenAndGrade = (req, res) => {
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

  // Filter matching documents
  const matchingDocuments = data
    .map((item) => {
      const filteredBatchDetails = item.Batch_Details.filter((batch) => {
        const isGardenMatch = batch.Garden.toLowerCase() === lowerCaseGarden;
        const isGradeMatch = lowerCaseGrades.includes(
          batch.Grade.toLowerCase()
        );
        const isQuantityAvailable = batch.Available_Quantity > 0;

        return isGardenMatch && isGradeMatch && isQuantityAvailable;
      });

      // Only return the item if filteredBatchDetails is not empty
      if (filteredBatchDetails.length > 0) {
        return {
          ...item,
          Batch_Details: filteredBatchDetails,
        };
      }
      return null;
    })
    .filter((item) => item !== null); // Filter out items with empty Batch_Details

  // Paginate results
  const paginatedDocuments = matchingDocuments.slice(index, index + limit);
  const hasNext = matchingDocuments.length > index + limit;

  res.json({
    documents: paginatedDocuments,
    hasNext,
  });
};

async function computeSubFormData() {
  const filePath = path.join(__dirname, "../data.json");

  const updatedData = [];

  fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));

  return updatedData;
}

// Function to send data to Zoho Creator
async function sendDataToZohoCreator(payload) {
  console.log("access_token", access_token);
  const myHeaders = {
    "Content-Type": "application/json",
    Authorization: `Zoho-oauthtoken ${access_token}`,
  };

  try {
    const response = await axios.post(
      "https://creator.zoho.in/api/v2/upsourcedconsultancyservices/tea-blending/form/Create_Blend",
      payload,
      {
        headers: myHeaders,
      }
    );

    if (response.data.error) {
      console.log("response.data.error", response.data.error);
      const errorString = createErrorString(response.data.error);
      console.log(errorString); // Output: "Enter a valid number for Total Qty be packed (in kgs), Enter a valid date format for Production Date"

      return { error: errorString };
    }

    console.log("Data sent successfully:", response.data);
    //here

    if (payload.data.type_field === "create") {
      const updatedJson = updateRequiredQuantity(
        payload.data.Subform,
        data,
        "approve"
      );

      console.log("done updating");

      // console.log("updatedJson", updatedJson);

      const dataFilePath = path.join(__dirname, "../data.json");

      saveUpdatedJson(updatedJson, dataFilePath);
    }

    return { message: response.data.message };
  } catch (error) {
    console.log("error", error);
    if (error?.response?.data?.error) {
      console.log("error", error.response.data.error);
      throw new Error(error.response.data.error.message);
    }
    throw new Error(error);
  }
}

async function updateToZohoCreator(payload, record_id) {
  console.log("access_token", access_token);
  const myHeaders = {
    "Content-Type": "application/json",
    Authorization: `Zoho-oauthtoken ${access_token}`,
  };

  try {
    const response = await axios.patch(
      `https://creator.zoho.in/api/v2/upsourcedconsultancyservices/tea-blending/report/All_Blends/${record_id}`,
      payload,
      {
        headers: myHeaders,
      }
    );

    if (response.data.error) {
      console.log("response.data.error", response.data.error);
      const errorString = createErrorString(response.data.error);
      console.log(errorString); // Output: "Enter a valid number for Total Qty be packed (in kgs), Enter a valid date format for Production Date"

      return { error: errorString };
    }

    console.log("Data sent successfully:", response.data);

    // here

    if (payload.data.type_field === "create") {
      const updatedJson = updateRequiredQuantity(
        payload.data.Subform,
        data,
        "approve"
      );

      console.log("done updating");

      // console.log("updatedJson", updatedJson);

      const dataFilePath = path.join(__dirname, "../data.json");

      saveUpdatedJson(updatedJson, dataFilePath);
    }

    return { message: response.data.message };
  } catch (error) {
    console.log("error", error);
    if (error?.response?.data?.error) {
      console.log("error", error.response.data.error);
      throw new Error(error.response.data.error.message);
    }
    throw new Error(error);
  }
}

// Export the function
exports.sendDataToZohoCreator = async (req, res) => {
  const payload = req.body;

  if (!payload) {
    return res.status(400).json({ error: "Payload is required" });
  }

  try {
    console.log("payload", payload);
    const data = await sendDataToZohoCreator(payload);
    if (data.error) {
      return res.status(400).json({ error: data.error });
    }

    // we have reduce the value in json for subform according to payload

    res.status(200).json({ message: "Data sent to Zoho Creator successfully" });
  } catch (error) {
    res.status(500).send(error);
  }
};

// Export the function
exports.updateDataToZohoCreator = async (req, res) => {
  const payload = req.body;
  const record_id = req.params.id;

  if (!payload) {
    return res.status(400).json({ error: "Payload is required" });
  }

  try {
    console.log("payload", payload);
    const data = await updateToZohoCreator(payload, record_id);
    if (data.error) {
      return res.status(400).json({ error: data.error });
    }

    // we have reduce the value in json for subform according to payload

    res.status(200).json({ message: "Data sent to Zoho Creator successfully" });
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.getJSONData = (req, res) => {
  res.json(data);
};

// --------------------------------------------------------------------------

const orgId = "60015091101";
const workspaceId = "243549000000036425";
const viewId = "243549000001864122";

exports.getJobid = async () => {
  const encodedConfig = encodeURIComponent(
    JSON.stringify({
      responseFormat: "json",
    })
  );

  const apiUrl = `https://analyticsapi.zoho.in/restapi/v2/bulk/workspaces/${workspaceId}/views/${viewId}/data?CONFIG=${encodedConfig}`;

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        "ZANALYTICS-ORGID": orgId,
        Authorization: `Zoho-oauthtoken ${access_token}`,
      },
    });

    console.log("jobId", response.data.data.jobId);
    return response?.data?.data?.jobId;
    // process.exit(0);
    return response?.data?.data?.jobId; // Returns the fetched data array
  } catch (error) {
    console.log(error);
  }
};

// let jobiddata = exports.getJobid();

// setInterval(async () => {
//   jobiddata = await exports.getJobid();
//   console.log("jobiddata", jobiddata);
// }, 1000 * 60 * 60);

// exports.getJobidData = () => {
//   return jobiddata;
// };

exports.getRecordsInCreator = async () => {
  const url =
    "https://www.zohoapis.in/creator/v2.1/data/upsourcedconsultancyservices/tea-blending/report/All_Blends?max_records=200&field_config=detail_view";

  const options = {
    method: "GET",
    headers: {
      Authorization: `Zoho-oauthtoken ${access_token}`,
    },
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    // Get current date in the format 'yyyy-MM-dd'
    const currentDate = new Date().toISOString().split("T")[0];

    // Filter records where Added_Date equals current date
    const filteredByDate = data.data.filter(
      (item) => item.Added_Date === currentDate
    );

    console.log("filteredByDate", filteredByDate);

    // Further filter by 'draft' type_field
    const isDraft = filteredByDate.filter(
      (item) => item.type_field === "draft"
    );

    console.log("isDraft", isDraft);

    return isDraft.length > 0;
  } catch (err) {
    console.error("Error getting records in creator:", err);
  }
};
