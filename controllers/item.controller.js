import { executeQuery, connectToDb, closeConnection, fetchData } from "../config/db.js";
import sql from "mssql";


// ====================================location master handler=====================================
export const itemMasterHandler = async (req, res) => {
    const { compCode, alias, desc, desc1, uom, recUom, recUomConv, recRate, salUom, salUomConv, salerate, itemTypeName, ItemtypeCode, mrp, itemGroup, barCode, cusdayItem, cusPurStock, subItemCD, itemSubTypeCode, itemGroupID, itemSubGroupID, itemSubTypeID, itemTypeID, createdby, createddate, HSNcode, conversionUnit, conversionQTY, conUnit, conQty } = req.body;

    if (!compCode || !alias || !desc || !desc1 || !uom || !recUom || !recUomConv || !recRate ||
        !salUom || !salUomConv || !salerate || !itemTypeName || !ItemtypeCode || !mrp || !itemGroup ||
        !barCode || !cusdayItem || !cusPurStock || !subItemCD || !itemSubTypeCode || !itemGroupID ||
        !itemSubGroupID || !itemSubTypeID || !itemTypeID || !createdby || !createddate || !HSNcode ||
        !conversionUnit || !conversionQTY || !conUnit || !conQty) {
        return res.status(200).json({
            status: false,
            message: "all fields are required"
        })
    }

    // Function to get the last generated ID
    const getLastCode = async () => {
        const query = `
            SELECT TOP 1 ITEMCD FROM M_ITEM ORDER BY ITEMCD DESC
        `;

        const result = await fetchData(query);

        if (result.length > 0) {
            return result[0].ITEMCD;
        }

        return null; // No previous code found
    };

    // Function to generate the next code
    const generateNextCode = async () => {
        const lastCode = await getLastCode();

        if (!lastCode) {
            return "0000001"; // First code if no records exist
        }

        // Convert to number, increment, and pad with leading zeros
        const lastNumber = parseInt(lastCode, 10);
        const nextNumber = lastNumber + 1;

        return nextNumber.toString().padStart(7, "0"); // Ensures "001", "002", etc.
    };

    const getFinancialYear = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // Months are 0-based in JS

        if (month < 4) {
            // If before April, financial year is (prevYear-currentYear)
            return `${year - 1}-${year.toString().slice(-2)}`;
        } else {
            // If April or later, financial year is (currentYear-nextYear)
            return `${year}-${(year + 1).toString().slice(-2)}`;
        }
    };

    // Create a new item
    const createItem = async (code, compCode, alias, desc, desc1, uom, recUom, recUomConv, recRate, salUom, salUomConv, salerate, itemTypeName, ItemtypeCode, mrp, itemGroup, barCode, cusdayItem, cusPurStock, subItemCD, itemSubTypeCode, itemGroupID, itemSubGroupID, itemTypeID, createdby, itemSubTypeID, HSNcode, conversionUnit, conversionQTY, conUnit, conQty) => {
        try {
            const pool = await connectToDb();
            const date = new Date(); // Use JavaScript Date object
            const today = new Date().toLocaleString(); // Use JavaScript Date object
            const finyr = getFinancialYear();

            // Define the SQL query and parameters
            const query = "INSERT INTO M_ITEM (ITEMCD, COMPCODE, ALIAS, DESCR, DESCR1, UOM, RECUOM, RECUOMCONV, RECRATE, SALUOM, SALUOMCONV, SELRATE, FINYR, ITEMTYPENAME, ITEMTYPECODE, MRP, ITEMGROUP, BARCODE, CUS_DAY_ITEM, CUS_PURCHSTOCKSALE_ITEMTYPE, SUBSITEMCD, ITEMSUBTYPECODE, M_ITEMGROUPID, M_ITEMSUBGROUP_ID, M_ITEMSUBTYPE_ID, M_ITEMTYPE_ID, CREATEDBY, CREATEDDATE, ULM, DLM, ACTIVE, HSNCODE, CONVERSIONUNIT, CONVERSIONQTY, CONUNIT, CONQTY) VALUES (@code, @compCode, @alias, @desc, @desc1, @uom, @recUom, @recUomConv, @recRate, @salUom, @salUomConv, @salerate, @finyr, @itemTypeName, @ItemtypeCode, @mrp, @itemGroup, @barCode, @cusdayItem, @cusPurStock, @subItemCD, @itemSubTypeCode, @itemGroupID, @itemSubGroupID, @itemSubTypeID, @itemTypeID, @createdby, @createdDate, @ulm, @dlm, @active, @HSNcode, @conversionUnit, @conversionQTY, @conUnit, @conQty)";

            // Execute the query with properly bound parameters
            const result = await pool.request()
                .input("code", sql.VarChar, code)
                .input("compCode", sql.VarChar, compCode)
                .input("alias", sql.VarChar, alias)
                .input("desc", sql.VarChar, desc)
                .input("desc1", sql.VarChar, desc1)
                .input("uom", sql.VarChar, uom)
                .input("recUom", sql.VarChar, recUom)
                .input("recUomConv", sql.Decimal, recUomConv)
                .input("recRate", sql.Decimal, recRate)
                .input("salUom", sql.VarChar, salUom)
                .input("salUomConv", sql.Decimal, salUomConv)
                .input("salerate", sql.Decimal, salerate)
                .input("finyr", sql.VarChar, finyr)
                .input("itemTypeName", sql.VarChar, itemTypeName)
                .input("ItemtypeCode", sql.VarChar, ItemtypeCode)
                .input("mrp", sql.Decimal, mrp)
                .input("itemGroup", sql.VarChar, itemGroup)
                .input("barCode", sql.VarChar, barCode)
                .input("cusdayItem", sql.VarChar, cusdayItem)
                .input("cusPurStock", sql.VarChar, cusPurStock)
                .input("subItemCD", sql.VarChar, subItemCD)
                .input("itemSubTypeCode", sql.VarChar, itemSubTypeCode)
                .input("itemGroupID", sql.VarChar, itemGroupID)
                .input("itemSubGroupID", sql.Int, itemSubGroupID)
                .input("itemSubTypeID", sql.VarChar, itemSubTypeID)
                .input("itemTypeID", sql.Int, itemTypeID)
                .input("createdby", sql.VarChar, createdby)
                .input("HSNcode", sql.VarChar, HSNcode)
                .input("conversionUnit", sql.VarChar, conversionUnit)
                .input("conversionQTY", sql.Decimal, conversionQTY)
                .input("conUnit", sql.VarChar, conUnit)
                .input("conQty", sql.Decimal, conQty)
                .input("active", sql.Bit, 1)
                .input("createdDate", sql.DateTime, date)
                .input("ulm", sql.VarChar, today)
                .input("dlm", sql.DateTime, date)
                .query(query);
            return result.rowsAffected;

        } catch (error) {
            console.error("Error:", error);
        }
    };

    try {
        // Generate the next ID
        const nextCode = await generateNextCode();

        // Call the function to create the item
        const result = await createItem(nextCode, compCode, alias, desc, desc1, uom, recUom, recUomConv, recRate, salUom, salUomConv, salerate, itemTypeName, ItemtypeCode, mrp, itemGroup, barCode, cusdayItem, cusPurStock, subItemCD, itemSubTypeCode, itemGroupID, itemSubGroupID, itemTypeID, createdby, createddate, HSNcode, conversionUnit, conversionQTY, conUnit, conQty);
        if (result) {
            return res.status(200).json({
                message: "Item inserted",
                data: { nextCode, compCode, alias, desc, desc1, uom, recUom, recUomConv, recRate, salUom, salUomConv, salerate, itemTypeName, ItemtypeCode, mrp, itemGroup, barCode, cusdayItem, cusPurStock, subItemCD, itemSubTypeCode, itemGroupID, itemSubGroupID, itemTypeID, createdby, createddate, HSNcode, conversionUnit, conversionQTY, conUnit, conQty },
            });
        }
        else {
            return res.status(200).json({
                status: false,
                message: "item insertion failed",
            });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            message: "Error processing the request",
        });
    } finally {
        // Ensure the connection is closed
        await closeConnection();
    }
};


// ====================================get location handler=====================================
export const getItems = async (req, res) => {
    // Function to fetch all UOMs from the database
    const getLoc = async () => {
        const query = `
            SELECT * FROM M_LOCATION
        `;
        const result = await fetchData(query); // Fetch data using the query
        return result;
    };

    try {
        const locations = await getLoc(); // Await the result of the async function
        res.status(200).json({
            message: "Locations fetched successfully", // Success message
            data: locations, // Send the result (UOM details) in the response
        });
    } catch (error) {
        console.error("Error fetching locations:", error); // Improved error logging
        res.status(500).json({
            message: "Error fetching locations", // Error message
            error: error.message, // Optionally send the error message for debugging
        });
    }
};


// ====================================item group handler=====================================
export const itemGroupHandler = async (req, res) => {
    const { name, code } = req.body;

    if (!name || !code) {
        return res.status(200).json({
            status: false,
            message: "all fields are required"
        })
    }

    // Function to get the last generated ID
    const getLastGeneratedId = async () => {
        const query = `
            SELECT TOP 1 M_ITEMGROUPID FROM M_ITEMGROUP 
            WHERE M_ITEMGROUPID LIKE 'MIG%' 
            ORDER BY M_ITEMGROUPID DESC
        `;

        const result = await fetchData(query); // helper function call
        if (result.length > 0) {
            return result[0].M_ITEMGROUPID;
        }

        return null; // No previous ID found
    };

    // Function to generate the next ID
    const generateNextId = async () => {
        const lastId = await getLastGeneratedId();

        if (!lastId) {
            return "MIG000000000000001"; // First ID if no records exist
        }

        // Extract numeric part and increment
        const lastNumber = parseInt(lastId.replace("MIG", ""), 10);
        const nextNumber = lastNumber + 1;

        // Format with leading zeros
        return `MIG${nextNumber.toString().padStart(15, "0")}`;
    };

    // Create a new item
    const createItem = async (name, code, nextId) => {
        try {
            const pool = await connectToDb();
            const date = new Date(); // Use JavaScript Date object

            // Define the SQL query
            const query = `
                INSERT INTO M_ITEMGROUP (GROUPNAME, GROUPCODE, M_ITEMGROUPID, CREATEDDATE, ULM, DLM, ACTIVE) 
                VALUES (@name, @code, @nextId, @createdDate, @ulm, @dlm, @active)
            `;

            // Execute the query with properly bound parameters
            const result = await pool.request()
                .input("name", sql.VarChar, name)
                .input("code", sql.VarChar, code)
                .input("nextId", sql.VarChar, nextId)
                .input("createdDate", sql.DateTime, date)
                .input("ulm", sql.DateTime, date)
                .input("dlm", sql.DateTime, date)
                .input("active", sql.Bit, 1)
                .query(query);

            return result.rowsAffected;
        } catch (error) {
            console.error("Error inserting data:", error);
        }
    };

    try {
        // Generate the next ID
        const nextId = await generateNextId();
        // Call the function to create the item
        const result = await createItem(name, code, nextId);
        if (result) {
            return res.status(200).json({
                message: "Item group successfully inserted",
                data: { name, code },
            });
        }
        else {
            return res.status(200).json({
                status: false,
                message: "Item group insertion failed",
            });
        }

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            message: "Error processing the request",
        });
    } finally {
        // Ensure the connection is closed
        await closeConnection();
    }
};


// ====================================get all group handler=====================================
export const allItemGroup = async (req, res) => {
    const getItemGroupNames = async () => {
        const query = `
           SELECT * FROM M_ITEMGROUP;
        `;
        const result = await fetchData(query);
        return result;
    };

    try {
        const itemGroups = await getItemGroupNames(); // Await the result of the async function
        res.status(200).json({
            itemGroups, // Send the result in the response
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching item groups" });
    }
};


// ====================================item sub group handler=====================================
export const itemSubGroupHandler = async (req, res) => {
    const { name, code, groupid, accode } = req.body;
    if (!name || !code || !groupid || !accode) {
        return res.status(200).json({
            status: false,
            message: "all fields are required"
        })
    }

    // Function to get the last generated ID
    const getLastGeneratedId = async () => {
        const query = `
            SELECT TOP 1 M_ITEMSUBGROUP_ID FROM M_ITEMSUBGROUP 
            WHERE M_ITEMSUBGROUP_ID LIKE 'MISG%' 
            ORDER BY M_ITEMSUBGROUP_ID DESC
        `;

        const result = await fetchData(query);

        if (result.length > 0) {
            return result[0].M_ITEMSUBGROUP_ID;
        }

        return null; // No previous ID found
    };

    // Function to generate the next ID
    const generateNextId = async () => {
        const lastId = await getLastGeneratedId();

        if (!lastId || lastId == undefined) {
            return "MISG000000000000001"; // First ID if no records exist
        }

        // Extract numeric part and increment
        const lastNumber = parseInt(lastId.replace("MISG", ""), 14);
        const nextNumber = lastNumber + 1;

        // Format with leading zeros
        return `MISG${nextNumber.toString().padStart(15, "0")}`;
    };

    // Create a new item
    const createItem = async (name, code, nextId, groupid, accode) => {
        try {
            const pool = await connectToDb();
            const date = new Date(); // Use JavaScript Date object
            const shcode = name.slice(0, 2);

            // Define the SQL query and parameters
            const query = "INSERT INTO M_ITEMSUBGROUP (M_ITEMSUBGROUP_ID, CODE, DESCR, SHORTCODE, ACCD, M_ITEMGROUPID, CREATEDDATE, ULM, DLM, ACTIVE) VALUES (@nextId, @code, @descr, @shortcode, @accode, @gid, @createdDate, @ulm, @dlm, @active)";

            // Execute the query with properly bound parameters
            const result = await pool.request()
                .input("nextId", sql.VarChar, nextId)
                .input("code", sql.VarChar, code)
                .input("descr", sql.VarChar, name)
                .input("shortcode", sql.VarChar, shcode)
                .input("accode", sql.VarChar, accode)
                .input("gid", sql.VarChar, groupid)
                .input("createdDate", sql.DateTime, date)
                .input("ulm", sql.DateTime, date)
                .input("dlm", sql.DateTime, date)
                .input("active", sql.Bit, 1)
                .query(query);
            return result.rowsAffected;

        } catch (error) {
            console.error("Error:", error);
        }
    };

    try {
        // Generate the next ID
        const nextId = await generateNextId();
        console.log(nextId);

        // Call the function to create the item
        const result = await createItem(name, code, nextId, groupid, accode);
        if (result) {
            return res.status(200).json({
                message: "Item sub-group successfully inserted",
                data: { name, code, nextId, accode, groupid },
            });
        }
        else {
            return res.status(200).json({
                status: false,
                message: "Item group insertion failed",
            });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            message: "Error processing the request",
        });
    } finally {
        // Ensure the connection is closed
        await closeConnection();
    }
};


// ====================================get all sub-group handler=====================================
export const allItemSubGroup = async (req, res) => {
    const getItemSubGroupNames = async () => {
        const query = `
           SELECT * FROM M_ITEMSUBGROUP;
        `;
        const result = await fetchData(query);
        return result;
    };

    try {
        const itemSubGroups = await getItemSubGroupNames(); // Await the result of the async function
        res.status(200).json({
            message: itemSubGroups, // Send the result in the response
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching item sub-groups" });
    }
};


// ====================================item category handler=====================================
export const itemCategoryHandler = async (req, res) => {
    const { name, shcode, grpId, subGrpId, qtyOb, valueOb, belongs } = req.body;

    if (!name || !shcode || !grpId || !subGrpId || !qtyOb || !valueOb || !belongs) {
        return res.status(200).json({
            status: false,
            message: "all fields are required"
        })
    }

    // Function to get the last generated ID
    const getLastGeneratedId = async () => {
        const query = `
            SELECT TOP 1 M_ITEMTYPE_ID FROM M_ITEMTYPE
            WHERE M_ITEMTYPE_ID LIKE 'MIT%' 
            ORDER BY M_ITEMTYPE_ID DESC
        `;

        const result = await fetchData(query); // helper function call
        if (result.length > 0) {
            return result[0].M_ITEMTYPE_ID;
        }

        return null; // No previous ID found
    };

    // Function to generate the next ID
    const generateNextId = async () => {
        const lastId = await getLastGeneratedId();

        if (!lastId) {
            return "MIT000000000000001"; // First ID if no records exist
        }

        // Extract numeric part and increment
        const lastNumber = parseInt(lastId.replace("MIT", ""), 10);
        const nextNumber = lastNumber + 1;

        // Format with leading zeros
        return `MIT${nextNumber.toString().padStart(15, "0")}`;
    };

    // Function to get the last generated ID
    const getLastGeneratedCode = async () => {
        const query = `
            SELECT TOP 1 ITEMTYPECODE FROM M_ITEMTYPE ORDER BY ITEMTYPECODE DESC
        `;

        const result = await fetchData(query); // helper function call
        if (result.length > 0 && result[0].ITEMTYPECODE) {
            return result[0].ITEMTYPECODE.trim(); // Ensure it's a clean string
        }

        return null; // No previous ID found
    };

    // Function to generate the next ID
    const generateNextCode = async () => {
        const lastId = await getLastGeneratedCode();

        if (!lastId || isNaN(lastId)) {
            return "1"; // First ID if no records exist or invalid data
        }

        // Convert to number and increment
        return (parseInt(lastId, 10) + 1).toString();
    };

    const getFinancialYear = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // Months are 0-based in JS

        if (month < 4) {
            // If before April, financial year is (prevYear-currentYear)
            return `${year - 1}-${year.toString().slice(-2)}`;
        } else {
            // If April or later, financial year is (currentYear-nextYear)
            return `${year}-${(year + 1).toString().slice(-2)}`;
        }
    };

    // Create a new item
    const createItem = async (nextId, nextCode, name, shcode, grpId, subGrpId, qtyOb, valueOb, belongs) => {
        try {
            const pool = await connectToDb();
            const date = new Date(); // Use JavaScript Date object
            const finyr = getFinancialYear();

            // Define the SQL query
            const query = `
                INSERT INTO M_ITEMTYPE (M_ITEMTYPE_ID, ITEMTYPECODE, FINYR, ITEMTYPENAME, BELONGSTO, QTYOB, VALOB, LMDT, ITEMTYPESHORTCODE, M_ITEMSUBGROUP_ID, M_ITEMGROUPID, CREATEDDATE, ULM, DLM, ACTIVE) 
                VALUES (@nextId, @nextCode, @finyr, @name, @belongs, @qtyOb, @valueOb, @lmdt, @shcode, @grpId, @subGrpId,   @createdDate, @ulm, @dlm, @active)
            `;

            // Execute the query with properly bound parameters
            const result = await pool.request()
                .input("nextId", sql.VarChar, nextId)
                .input("nextCode", sql.VarChar, nextCode)
                .input("finyr", sql.VarChar, finyr)
                .input("name", sql.VarChar, name)
                .input("belongs", sql.Decimal, belongs)
                .input("qtyOb", sql.Decimal, qtyOb)
                .input("valueOb", sql.Decimal, valueOb)
                .input("lmdt", sql.DateTime, date)
                .input("shcode", sql.VarChar, shcode)
                .input("grpId", sql.VarChar, grpId)
                .input("subGrpId", sql.VarChar, subGrpId)
                .input("createdDate", sql.DateTime, date)
                .input("ulm", sql.DateTime, date)
                .input("dlm", sql.DateTime, date)
                .input("active", sql.Bit, 1)
                .query(query);

            return result.rowsAffected;
        } catch (error) {
            console.error("Error inserting data:", error);
        }
    };

    try {
        // Generate the next ID
        const nextId = await generateNextId();
        const nextCode = await generateNextCode();
        // Call the function to create the item
        const result = await createItem(nextId, nextCode, name, shcode, grpId, subGrpId, qtyOb, valueOb, belongs);
        if (result) {
            return res.status(200).json({
                message: "Item category successfully inserted",
                data: { nextId, nextCode, name, shcode, grpId, subGrpId, qtyOb, valueOb, belongs },
            });
        }
        else {
            return res.status(200).json({
                status: false,
                message: "Item category insertion failed",
            });
        }

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            message: "Error processing the request",
        });
    } finally {
        // Ensure the connection is closed
        await closeConnection();
    }
};


// ====================================get all category handler=====================================
export const allItemCategory = async (req, res) => {
    const getItemCategory = async () => {
        const query = `
           SELECT * FROM M_ITEMTYPE;
        `;
        const result = await fetchData(query);
        return result;
    };

    try {
        const itemCategory = await getItemCategory(); // Await the result of the async function
        res.status(200).json({
            itemCategory, // Send the result in the response
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching item category" });
    }
};


// ====================================item sub category handler=====================================
export const itemSubCategoryHandler = async (req, res) => {
    const { name, shcode, ctgId, subGrpId, qtyOb, valueOb, serial } = req.body;

    if (!name || !shcode || !ctgId || !subGrpId || !qtyOb || !valueOb || !serial) {
        return res.status(200).json({
            status: false,
            message: "all fields are required"
        })
    }

    // Function to get the last generated ID
    const getLastGeneratedId = async () => {
        const query = `
            SELECT TOP 1 M_ITEMSUBTYPE_ID FROM M_ITEMSUBTYPE
            WHERE M_ITEMSUBTYPE_ID LIKE 'MIST%' 
            ORDER BY M_ITEMSUBTYPE_ID DESC
        `;

        const result = await fetchData(query); // helper function call
        if (result.length > 0) {
            return result[0].M_ITEMSUBTYPE_ID;
        }

        return null; // No previous ID found
    };

    // Function to generate the next ID
    const generateNextId = async () => {
        const lastId = await getLastGeneratedId();

        if (!lastId) {
            return "MIT000000000000001"; // First ID if no records exist
        }

        // Extract numeric part and increment
        const lastNumber = parseInt(lastId.replace("MIST", ""), 10);
        const nextNumber = lastNumber + 1;

        // Format with leading zeros
        return `MIST${nextNumber.toString().padStart(15, "0")}`;
    };

    // Function to get the last generated ID
    const getLastGeneratedCode = async () => {
        const query = `
            SELECT TOP 1 ITEMSUBTYPECODE FROM M_ITEMSUBTYPE ORDER BY ITEMSUBTYPECODE DESC
        `;

        const result = await fetchData(query); // helper function call
        if (result.length > 0 && result[0].ITEMSUBTYPECODE) {
            return result[0].ITEMSUBTYPECODE.trim(); // Ensure it's a clean string
        }

        return null; // No previous ID found
    };

    // Function to generate the next ID
    const generateNextCode = async () => {
        const lastId = await getLastGeneratedCode();

        if (!lastId || isNaN(lastId)) {
            return "0001"; // First ID if no records exist or invalid data
        }
        // Extract numeric part and increment
        const lastNumber = parseInt(lastId, 10);
        const nextNumber = lastNumber + 1;

        return nextNumber.toString().padStart(4, "0");
    };

    const getFinancialYear = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // Months are 0-based in JS

        if (month < 4) {
            // If before April, financial year is (prevYear-currentYear)
            return `${year - 1}-${year.toString().slice(-2)}`;
        } else {
            // If April or later, financial year is (currentYear-nextYear)
            return `${year}-${(year + 1).toString().slice(-2)}`;
        }
    };

    // Create a new item
    const createItem = async (nextId, nextCode, name, shcode, ctgId, subGrpId, qtyOb, valueOb, serial) => {
        try {
            const pool = await connectToDb();
            const date = new Date(); // Use JavaScript Date object
            const finyr = getFinancialYear();

            // Define the SQL query
            const query = `
                INSERT INTO M_ITEMSUBTYPE (M_ITEMSUBTYPE_ID, ITEMSUBTYPECODE, FINYR, ITEMSUBTYPENAME, ITEMSUBTYPESHORTCODE, QTYOB, VALOB, ITEMTYPECODE, PRINTSRLNO, LMDT, M_ITEMSUBGROUP_ID, CREATEDDATE, ULM, DLM, ACTIVE) 
                VALUES (@nextId, @nextCode, @finyr, @name, @shcode, @qtyOb, @valueOb, @ctgId, @serial, @lmdt, @subGrpId, @createdDate, @ulm, @dlm, @active)
            `;

            // Execute the query with properly bound parameters
            const result = await pool.request()
                .input("nextId", sql.VarChar, nextId)
                .input("nextCode", sql.VarChar, nextCode)
                .input("finyr", sql.VarChar, finyr)
                .input("name", sql.VarChar, name)
                .input("qtyOb", sql.Decimal, qtyOb)
                .input("valueOb", sql.Decimal, valueOb)
                .input("ctgId", sql.VarChar, ctgId)
                .input("serial", sql.Decimal, serial)
                .input("lmdt", sql.DateTime, date)
                .input("shcode", sql.VarChar, shcode)
                .input("subGrpId", sql.VarChar, subGrpId)
                .input("createdDate", sql.DateTime, date)
                .input("ulm", sql.DateTime, date)
                .input("dlm", sql.DateTime, date)
                .input("active", sql.Bit, 1)
                .query(query);

            return result.rowsAffected;
        } catch (error) {
            console.error("Error inserting data:", error);
        }
    };

    try {
        // Generate the next ID
        const nextId = await generateNextId();
        const nextCode = await generateNextCode();
        // Call the function to create the item
        const result = await createItem(nextId, nextCode, name, shcode, ctgId, subGrpId, qtyOb, valueOb, serial);
        if (result) {
            return res.status(200).json({
                message: "Item sub-category successfully inserted",
                data: { nextId, nextCode, name, shcode, ctgId, subGrpId, qtyOb, valueOb, serial },
            });
        }
        else {
            return res.status(200).json({
                status: false,
                message: "Item sub-category insertion failed",
            });
        }

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            message: "Error processing the request",
        });
    } finally {
        // Ensure the connection is closed
        await closeConnection();
    }
};


// ====================================get all sub category handler=====================================
export const allItemSubCategory = async (req, res) => {
    const getItemSubCategory = async () => {
        const query = `
           SELECT * FROM M_ITEMSUBTYPE;
        `;
        const result = await fetchData(query);
        return result;
    };

    try {
        const itemSubCategory = await getItemSubCategory(); // Await the result of the async function
        res.status(200).json({
            message: itemSubCategory, // Send the result in the response
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching item sub-groups" });
    }
};


// ====================================UOM handler=====================================
export const itemUOMHandler = async (req, res) => {
    const { name, code } = req.body;

    if (!name || !code) {
        return res.status(200).json({
            status: false,
            message: "all fields are required"
        })
    }

    const getUomCode = async () => {
        const query = `
            SELECT TOP 1 CODE FROM M_UOM WHERE CODE LIKE '00%' ORDER BY CODE DESC;
        `;

        const result = await fetchData(query);

        if (result && result.length > 0 && result[0].CODE) {
            return result[0].CODE.trim(); // Trim in case of extra spaces
        }

        return null; // No previous code found
    };

    // Function to generate the next code
    const nextUomCode = async () => {
        const lastCode = await getUomCode();

        if (!lastCode || isNaN(parseInt(lastCode, 10))) {
            return "001"; // First code if no records exist or invalid data
        }

        // Convert to number, increment, and pad with leading zeros
        const lastNumber = parseInt(lastCode, 10);
        const nextNumber = lastNumber + 1;

        return nextNumber.toString().padStart(3, "0"); // Ensures "001", "002", etc.
    };

    const getFinancialYear = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // Months are 0-based in JS

        if (month < 4) {
            // If before April, financial year is (prevYear-currentYear)
            return `${year - 1}-${year.toString().slice(-2)}`;
        } else {
            // If April or later, financial year is (currentYear-nextYear)
            return `${year}-${(year + 1).toString().slice(-2)}`;
        }
    };


    // Create a new item
    const createItem = async (name, code, nextCode) => {
        try {
            const pool = await connectToDb();
            const date = new Date(); // Use JavaScript Date object
            const finyr = getFinancialYear();
            // Define the SQL query and parameters
            const query = "INSERT INTO M_UOM (DESCR, FINYR, CODE, SHORTCODE, CREATEDDATE, ULM, DLM, ACTIVE) VALUES (@descr, @finyr, @code, @shortcode, @createdDate, @ulm, @dlm, @active)";

            // Execute the query with properly bound parameters
            const result = await pool.request()
                .input("descr", sql.VarChar, name)
                .input("finyr", sql.VarChar, finyr)
                .input("code", sql.VarChar, nextCode)
                .input("shortcode", sql.VarChar, code)
                .input("createdDate", sql.DateTime, date)
                .input("ulm", sql.DateTime, date)
                .input("dlm", sql.DateTime, date)
                .input("active", sql.Bit, 1)
                .query(query);
            return result.rowsAffected;

        } catch (error) {
            console.error("Error:", error);
        }
    };

    try {
        const newCode = await nextUomCode();

        // Call the function to create the item
        const result = await createItem(name, code, newCode);

        if (result) {
            // Respond with the success message
            res.status(200).json({
                message: "Item UOM successfully created",
                data: { name, code },
            });
        }
        else {
            return res.status(200).json({
                status: false,
                message: "Item UOM insertion failed",
            });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            message: "Error processing the request",
        });
    } finally {
        // Ensure the connection is closed
        await closeConnection();
    }
};


// ====================================get UOM handler=====================================
export const getItemUOM = async (req, res) => {
    // Function to fetch all UOMs from the database
    const getUOM = async () => {
        const query = `
            SELECT * FROM M_UOM
        `;
        const result = await fetchData(query); // Fetch data using the query
        return result;
    };

    try {
        const uoms = await getUOM(); // Await the result of the async function
        res.status(200).json({
            message: "UOMs fetched successfully", // Success message
            data: uoms, // Send the result (UOM details) in the response
        });
    } catch (error) {
        console.error("Error fetching UOMs:", error); // Improved error logging
        res.status(500).json({
            message: "Error fetching UOMs", // Error message
            error: error.message, // Optionally send the error message for debugging
        });
    }
};


// ====================================location master handler=====================================
export const locationMasterHandler = async (req, res) => {
    const { name, billprefix, subgroup, sales, account, dept, substore, remarks } = req.body;
    if (!name || !billprefix || !subgroup || !sales || !account || !dept || !substore || !remarks) {
        return res.status(200).json({
            status: false,
            message: "all fields are required"
        })
    }

    // Function to get the last generated ID
    const getLastCode = async () => {
        const query = `
            SELECT TOP 1 CODE FROM M_LOCATION ORDER BY CODE DESC
        `;

        const result = await fetchData(query);

        if (result.length > 0) {
            return result[0].CODE; // Assuming CODE is stored as "001", "002", etc.
        }

        return null; // No previous code found
    };

    // Function to generate the next code
    const generateNextCode = async () => {
        const lastCode = await getLastCode();

        if (!lastCode) {
            return "001"; // First code if no records exist
        }

        // Convert to number, increment, and pad with leading zeros
        const lastNumber = parseInt(lastCode, 10);
        const nextNumber = lastNumber + 1;

        return nextNumber.toString().padStart(3, "0"); // Ensures "001", "002", etc.
    };

    // Create a new item
    const createItem = async (code, name, billprefix, subgroup, sales, account, dept, substore, remarks) => {
        try {
            const pool = await connectToDb();
            const date = new Date(); // Use JavaScript Date object

            // Define the SQL query and parameters
            const query = "INSERT INTO M_LOCATION (CODE, DESCR, BILLPREFIX, ITEMSUBGRSC, SUSPSALES, ACCD, DEPTID, CUSTOMER, REMARKS, ACTIVE, CREATEDDATE, ULM, DLM) VALUES (@code, @name, @billprefix, @subgroup, @sales, @account, @dept, @substore, @remarks, @active, @createdDate, @ulm, @dlm)";

            // Execute the query with properly bound parameters
            const result = await pool.request()
                .input("code", sql.VarChar, code)
                .input("name", sql.VarChar, name)
                .input("billprefix", sql.VarChar, billprefix)
                .input("subgroup", sql.VarChar, subgroup)
                .input("sales", sql.VarChar, sales)
                .input("account", sql.VarChar, account)
                .input("dept", sql.VarChar, dept)
                .input("substore", sql.VarChar, substore)
                .input("remarks", sql.VarChar, remarks)
                .input("active", sql.Bit, 1)
                .input("createdDate", sql.DateTime, date)
                .input("ulm", sql.DateTime, date)
                .input("dlm", sql.DateTime, date)
                .query(query);
            return result.rowsAffected;

        } catch (error) {
            console.error("Error:", error);
        }
    };

    try {
        // Generate the next ID
        const nextCode = await generateNextCode();

        // Call the function to create the item
        const result = await createItem(nextCode, name, billprefix, subgroup, sales, account, dept, substore, remarks);
        if (result) {
            return res.status(200).json({
                message: "Location successfully inserted",
                data: { nextCode, name, billprefix, subgroup, sales, account, dept, substore, remarks },
            });
        }
        else {
            return res.status(200).json({
                status: false,
                message: "Location insertion failed",
            });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            message: "Error processing the request",
        });
    } finally {
        // Ensure the connection is closed
        await closeConnection();
    }
};


// ====================================get location handler=====================================
export const getlocation = async (req, res) => {
    // Function to fetch all UOMs from the database
    const getLoc = async () => {
        const query = `
            SELECT * FROM M_LOCATION
        `;
        const result = await fetchData(query); // Fetch data using the query
        return result;
    };

    try {
        const locations = await getLoc(); // Await the result of the async function
        res.status(200).json({
            message: "Locations fetched successfully", // Success message
            data: locations, // Send the result (UOM details) in the response
        });
    } catch (error) {
        console.error("Error fetching locations:", error); // Improved error logging
        res.status(500).json({
            message: "Error fetching locations", // Error message
            error: error.message, // Optionally send the error message for debugging
        });
    }
};


// ====================================tax master handler=====================================
export const taxMasterHandler = async (req, res) => {
    const { name, ledger, rate, type, scode, exempted, method, fromamt, toamt, parenttax, remarks } = req.body;
    if (!name || !ledger || !rate || !type || !scode || !exempted || !method || !fromamt || !toamt || !parenttax || !remarks) {
        return res.status(200).json({
            status: false,
            message: "all fields are required"
        })
    }

    // Function to get the last generated ID
    const getLastCode = async () => {
        const query = `
            SELECT TOP 1 TAX_ID FROM M_TAX ORDER BY TAX_ID DESC
        `;

        const result = await fetchData(query);

        if (result.length > 0) {
            return result[0].TAX_ID; // Assuming CODE is stored as "001", "002", etc.
        }

        return null; // No previous code found
    };

    // Function to generate the next code
    const generateNextCode = async () => {
        const lastCode = await getLastCode();

        if (!lastCode) {
            return "001"; // First code if no records exist
        }

        // Convert to number, increment, and pad with leading zeros
        const lastNumber = parseInt(lastCode, 10);
        const nextNumber = lastNumber + 1;

        return nextNumber.toString().padStart(3, "0"); // Ensures "001", "002", etc.
    };

    // Create a new item
    const createItem = async (taxid, name, ledger, rate, type, scode, exempted, method, fromamt, toamt, parenttax, remarks) => {
        try {
            const pool = await connectToDb();
            const date = new Date(); // Use JavaScript Date object

            // Define the SQL query and parameters
            const query = "INSERT INTO M_TAX (TAX_ID, SHORTNAME, DESCR, RATE, TYPE, ACCD, EXEMPTED, PER_AMT_TYPE, FROM_AMT_PER, TO_AMT_PER, P_TAX_ID, REMARKS, CREATEDDATE, ULM, DLM, ACTIVE) VALUES (@taxid, @name, @ledger, @rate, @type, @scode, @exempted, @method, @fromamt, @toamt, @parenttax, @remarks, @createdDate, @ulm, @dlm, @active)";

            // Execute the query with properly bound parameters
            const result = await pool.request()
                .input("taxid", sql.VarChar, taxid)
                .input("name", sql.VarChar, name)
                .input("ledger", sql.VarChar, ledger)
                .input("rate", sql.Decimal(10, 2), parseFloat(rate) || 0)
                .input("type", sql.VarChar, type)
                .input("scode", sql.VarChar, scode)
                .input("exempted", sql.VarChar, exempted)
                .input("method", sql.VarChar, method)
                .input("fromamt", sql.Decimal(10, 2), parseFloat(fromamt) || 0)
                .input("toamt", sql.Decimal(10, 2), parseFloat(toamt) || 0)
                .input("parenttax", sql.VarChar, parenttax)
                .input("remarks", sql.VarChar, remarks)
                .input("createdDate", sql.DateTime, date)
                .input("ulm", sql.DateTime, date)
                .input("dlm", sql.DateTime, date)
                .input("active", sql.Bit, 1)
                .query(query);

            return result.rowsAffected;

        } catch (error) {
            console.error("Error:", error);
        }
    };

    try {
        // Generate the next ID
        const taxid = await generateNextCode();

        // Call the function to create the item
        const result = await createItem(taxid, name, ledger, rate, type, scode, exempted, method, fromamt, toamt, parenttax, remarks);
        if (result) {
            return res.status(200).json({
                message: "Tax successfully inserted",
                data: { taxid, name, ledger, rate, type, scode, exempted, method, fromamt, toamt, parenttax, remarks },
            });
        }
        else {
            return res.status(200).json({
                status: false,
                message: "Tax insertion failed",
            });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            message: "Error processing the request",
        });
    } finally {
        // Ensure the connection is closed
        await closeConnection();
    }
};


// ====================================get tax handler=====================================
export const getTax = async (req, res) => {
    // Function to fetch all UOMs from the database
    const getTax = async () => {
        const query = `
            SELECT * FROM M_TAX
        `;
        const result = await fetchData(query); // Fetch data using the query
        return result;
    };

    try {
        const taxes = await getTax(); // Await the result of the async function
        res.status(200).json({
            message: "taxes fetched successfully", // Success message
            data: taxes, // Send the result (UOM details) in the response
        });
    } catch (error) {
        console.error("Error fetching taxes:", error); // Improved error logging
        res.status(500).json({
            message: "Error fetching taxes", // Error message
            error: error.message, // Optionally send the error message for debugging
        });
    }
};


// ====================================supplier price list handler=====================================
export const supplierPricelistHandler = async (req, res) => {
    const { supplierID, itemcd, date, price } = req.body;
    if (!supplierID || !itemcd || !date || !price) {
        return res.status(200).json({
            status: false,
            message: "all fields are required"
        })
    }

    const getFinancialYear = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // Months are 0-based in JS

        if (month < 4) {
            // If before April, financial year is (prevYear-currentYear)
            return `${year - 1}-${year.toString().slice(-2)}`;
        } else {
            // If April or later, financial year is (currentYear-nextYear)
            return `${year}-${(year + 1).toString().slice(-2)}`;
        }
    };

    // Create a new item
    const createItem = async (supplierID, itemcd, date, price) => {
        try {
            const pool = await connectToDb();
            const today = new Date(); // Use JavaScript Date object
            const finyr = getFinancialYear();

            // Define the SQL query and parameters
            const query = "INSERT INTO M_PRICELIST (ACCD, ITEMCD, SUBLEDTYPE, RATE, EFFECTIVEFROM, ENTRYDT, FINYR, CREATEDDATE, ULM, DLM, ACTIVE) VALUES (@supplierID, @itemcd, @subLed, @price, @date, @entry, @finyr, @createdDate, @ulm, @dlm, @active)";

            // Execute the query with properly bound parameters
            const result = await pool.request()
                .input("supplierID", sql.VarChar, supplierID)
                .input("itemcd", sql.VarChar, itemcd)
                .input("subLed", sql.VarChar, 'x')
                .input("price", sql.Decimal, price)
                .input("date", sql.DateTime, date)
                .input("entry", sql.DateTime, today)
                .input("finyr", sql.VarChar, finyr)
                .input("createdDate", sql.DateTime, today)
                .input("ulm", sql.DateTime, today)
                .input("dlm", sql.DateTime, today)
                .input("active", sql.Bit, 1)
                .query(query);
            return result.rowsAffected;

        } catch (error) {
            console.error("Error:", error);
        }
    };

    try {
        // Call the function to create the item
        const result = await createItem(supplierID, itemcd, date, price);
        if (result) {
            return res.status(200).json({
                message: "successfully inserted",
                data: { supplierID, itemcd, date, price },
            });
        }
        else {
            return res.status(200).json({
                status: false,
                message: "insertion failed",
            });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            message: "Error processing the request",
        });
    } finally {
        // Ensure the connection is closed
        await closeConnection();
    }
};


// // ====================================get supplier price list handler=====================================
export const getSupplierPriceList = async (req, res) => {
    // Function to fetch all UOMs from the database
    const getSupplier = async () => {
        const query = `
            SELECT * FROM M_PRICELIST
        `;
        const result = await fetchData(query); // Fetch data using the query
        return result;
    };

    try {
        const supplier = await getSupplier(); // Await the result of the async function
        res.status(200).json({
            message: "supplier fetched successfully", // Success message
            data: supplier, // Send the result (UOM details) in the response
        });
    } catch (error) {
        console.error("Error fetching taxes:", error); // Improved error logging
        res.status(500).json({
            message: "Error fetching taxes", // Error message
            error: error.message, // Optionally send the error message for debugging
        });
    }
};

