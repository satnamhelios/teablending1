// @ts-nocheck

import React, { useEffect, useState } from "react";
import SubForm from "./SubForm";
import axios from "axios";

interface PackagingItem {
  productName: string;
  unit: string;
  availableQty: number;
  requiredQty: number;
  selectItem: boolean;
}

const TeaBlendingForm: React.FC = () => {
  const [packagingItems, setPackagingItems] = useState<PackagingItem[]>([]);

  const [subForms, setSubForms] = useState([]);

  const [documents, setDocuments] = useState<Document[]>([]);

  const addTeaItem = () => {
    setSubForms([
      ...subForms,
      <SubForm key={subForms.length} sendToTeaBlending={getSubFormData} />,
    ]);
  };

  const addPackagingItem = () => {
    setPackagingItems([
      ...packagingItems,
      {
        productName: "",
        unit: "",
        availableQty: 0,
        requiredQty: 0,
        selectItem: false,
      },
    ]);
  };

  const removePackagingItem = (index: number) => {
    setPackagingItems(packagingItems.filter((_, i) => i !== index));
  };

  // const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();
  //   // Handle form submission logic here
  //   console.log("Form submitted!", { teaItems, packagingItems });
  // };

  // const updateTeaItem = (
  //   index: number,
  //   field: keyof TeaItem,
  //   value: string | number
  // ) => {
  //   console.log(teaItems);
  //   console.log(index, field, value);

  //   const updatedTeaItems = teaItems.map((item, i) =>
  //     i === index ? { ...item, [field]: value } : item
  //   );

  //   setTeaItems(updatedTeaItems);

  //   if (field === "garden") {
  //     setSelectedGarden(updatedTeaItems[index].garden);
  //     setCurrentIndex(0);
  //   }
  //   if (field === "grade") {
  //     setSelectedGrade(updatedTeaItems[index].grade);
  //     setCurrentIndex(0);
  //   }
  // };

  const updatePackagingItem = (
    index: number,
    field: keyof PackagingItem,
    value: string | number | boolean
  ) => {
    const newPackagingItems = [...packagingItems];
    newPackagingItems[index] = { ...newPackagingItems[index], [field]: value };
    setPackagingItems(newPackagingItems);
  };

  const getSubFormData = (documents) => {
    console.log("get form fn is running man", documents);
    setDocuments(documents);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const myHeaders = {
      Authorization:
        "Zoho-oauthtoken 1000.6cd351f1f6213f3af21605616a8e5cfe.c4d8b9b61ce3f4a0826e4727e4a484ec",
      "Content-Type": "application/json",
    };

    const data = {
      data: {
        Blend_No: "Blend No.",
        STD_No: "STD_No",
        Shipment_From: "Shipment_From",
        Inspection_By: "Inspection_By",
        Blend_Quantity_in_kg: "STD_No",
        Total_Remaining_Quantity: "Shipment_From",
        Date_field: "10-Jan-2020",
        Total_Quantity_Selected: "Total_Quantity_Selected",
        STD: "STD",
        Grade: "Grade",
        Brand: "Brand",
        LOT: "LOT",
        Production_Date: "10-Jan-2020",
        Expiry_Date: "10-Jan-2020",
        Net_Weight_in_kgs: "Net_Weight_in_kgs",
        Gross_Weight_in_kgs: "Gross_Weight_in_kgs",
        Net_Qty_per_P_Sacks: "Net_Qty_per_P_Sacks",
        Total_Qty_be_packed_in_kgs: "Blend_Quantity_in_kg",
        SubForm: [
          {
            Garden2: "Garden Name",
            Grade1: "Grade Name",
            Inv_No: "Inv No(Batch No)",
            Product_Name: "Item Name",
            Available_Quantity: "Avl Qty",
            Nett: "Qty/Bag",
            PK: "Avl Bags",
            Required_Bags: "Req Bags",
            Required_Quantity: "Req Qty",
            Select_Item: "true",
            Sale_Broker_Lot: "Sale Broker Lot",
            Warehouse: "WH",
            Batch_ID: "Batch_ID",
            Item_ID: "Item_ID",
          },
          {
            Garden2: "Garden Name",
            Grade1: "Grade Name",
            Inv_No: "Inv No(Batch No)",
            Product_Name: "Item Name",
            Available_Quantity: "Avl Qty",
            Nett: "Qty/Bag",
            PK: "Avl Bags",
            Required_Bags: "Req Bags",
            Required_Quantity: "Req Qty",
            Select_Item: "true",
            Sale_Broker_Lot: "Sale Broker Lot",
            Warehouse: "WH",
            Batch_ID: "Batch_ID",
            Item_ID: "Item_ID",
          },
        ],
      },
    };

    try {
      const response = await axios.post(
        "https://creator.zoho.in/api/v2/upsourcedconsultancyservices/tea-blending/form/Product",
        data,
        { headers: myHeaders }
      );
      console.log(response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="w-full p-3 flex justify-between items-center">
          <h1 className="text-2xl mb-4">Tea Blending</h1>
          {/* <span className="text-2xl text-bold text-gray-500">
            Total Records : {documents.length}
          </span> */}
        </div>
        <div className="mb-4">
          <h2 className="text-xl mb-2">Create Blend</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Blend No.
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="blendNo"
                  type="text"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Date
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="date"
                  type="date"
                  value="2024-07-31"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  STD No.
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="stdNo"
                  type="text"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Blend Quantity (in kg)
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="blendQty"
                  type="number"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Shipment From
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="shipmentFrom"
                  type="text"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Total Quantity Selected
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="totalQty"
                  type="number"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Inspection By
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="inspectionBy"
                  type="text"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Remaining Quantity
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="remainingQty"
                  type="number"
                />
              </div>
            </div>

            <thead>
              <tr>
                <th className="py-2 px-4 w-32 sticky left-0 bg-white border-r border-gray-300">
                  Garden
                </th>
                <th className="py-2 px-4 w-32 sticky left-32 bg-white border-r border-gray-300">
                  Grade
                </th>
                <th className="py-2 px-4 border-r border-gray-300">Inv No.</th>
                <th className="py-2 px-4 border-r border-gray-300">Avl Qty</th>
                <th className="py-2 px-4 border-r border-gray-300">Qty/Bag</th>
                <th className="py-2 px-4 border-r border-gray-300">Avl Bags</th>
                <th className="py-2 px-4 border-r border-gray-300">Req Bags</th>
                <th className="py-2 px-4 border-r border-gray-300">Req Qty</th>
                <th className="py-2 px-4 border-r border-gray-300">
                  Select Item
                </th>
                <th className="py-2 px-4 border-r border-gray-300">
                  Sale Broker Lot
                </th>
                <th className="py-2 px-4 border-r border-gray-300">WH</th>
                <th className="py-2 px-4 border-r border-gray-300">Actions</th>
              </tr>
            </thead>
            <div>
              {subForms.map((form, index) => (
                <div
                  key={index}
                  style={{
                    padding: "0",
                    margin: "0",
                    borderBottom:
                      index < subForms.length - 1
                        ? "1px solid transparent"
                        : "0",
                  }}
                >
                  {form}
                </div>
              ))}
              <button
                type="button"
                onClick={addTeaItem}
                className="bg-blue-500 text-white py-2 px-4 rounded mb-4"
              >
                Add Tea Item
              </button>
            </div>
            <h2 className="text-xl mb-2">Packaging Items</h2>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2">Product Name</th>
                    <th className="py-2">Unit</th>
                    <th className="py-2">Available Qty</th>
                    <th className="py-2">Required Qty</th>
                    <th className="py-2">Select Item</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {packagingItems.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="text"
                          value={item.productName}
                          onChange={(e) =>
                            updatePackagingItem(
                              index,
                              "productName",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) =>
                            updatePackagingItem(index, "unit", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.availableQty}
                          onChange={(e) =>
                            updatePackagingItem(
                              index,
                              "availableQty",
                              +e.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.requiredQty}
                          onChange={(e) =>
                            updatePackagingItem(
                              index,
                              "requiredQty",
                              +e.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={item.selectItem}
                          onChange={(e) =>
                            updatePackagingItem(
                              index,
                              "selectItem",
                              e.target.checked
                            )
                          }
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => removePackagingItem(index)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                type="button"
                onClick={addPackagingItem}
                className="bg-blue-500 text-white py-2 px-4 rounded mt-6"
              >
                Add Packaging Item
              </button>
            </div>
            <h3 className="text-xl font-semibold mb-3">
              To be packed as follows
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="std">
                  STD
                </label>
                <input
                  className="w-full border rounded-md px-3 py-2"
                  type="text"
                  id="std"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="netQty"
                >
                  Net. Qty. per P/Sacks (in kgs)
                </label>
                <input
                  className="w-full border rounded-md px-3 py-2"
                  type="text"
                  id="netQty"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="grade"
                >
                  Grade
                </label>
                <input
                  className="w-full border rounded-md px-3 py-2"
                  type="text"
                  id="grade"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="totalQty"
                >
                  Total Qty to be packed (in kgs)
                </label>
                <input
                  className="w-full border rounded-md px-3 py-2"
                  type="text"
                  id="totalQty"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="brand"
                >
                  Brand
                </label>
                <input
                  className="w-full border rounded-md px-3 py-2"
                  type="text"
                  id="brand"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="totalQtyPSacks"
                >
                  Total Qty of P/Sacks (in pcs)
                </label>
                <input
                  className="w-full border rounded-md px-3 py-2"
                  type="text"
                  id="totalQtyPSacks"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="lotNo"
                >
                  LOT No
                </label>
                <input
                  className="w-full border rounded-md px-3 py-2"
                  type="text"
                  id="lotNo"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="productionDate"
                >
                  Production Date
                </label>
                <input
                  className="w-full border rounded-md px-3 py-2"
                  type="date"
                  id="productionDate"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="expiryDate"
                >
                  Expiry Date
                </label>
                <input
                  className="w-full border rounded-md px-3 py-2"
                  type="date"
                  id="expiryDate"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="netWeight"
                >
                  Net Weight (in kgs)
                </label>
                <input
                  className="w-full border rounded-md px-3 py-2"
                  type="text"
                  id="netWeight"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="grossWeight"
                >
                  Gross Weight (in kgs)
                </label>
                <input
                  className="w-full border rounded-md px-3 py-2"
                  type="text"
                  id="grossWeight"
                />
              </div>
            </div>
            {/* Buttons */}
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Create
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                Save as Draft
              </button>
              <button type="reset" className="px-4 py-2 bg-gray-300 rounded-md">
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeaBlendingForm;
