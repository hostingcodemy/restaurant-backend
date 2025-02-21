import { executeQuery, connectToDb, closeConnection, fetchData } from "../config/db.js";
import sql from "mssql";

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
                INSERT INTO M_ITEMGROUP (GROUPNAME, GROUPCODE, M_ITEMGROUPID, CREATEDDATE, ULM, DLM) 
                VALUES (@name, @code, @nextId, @createdDate, @ulm, @dlm)
            `;

            // Execute the query with properly bound parameters
            const result = await pool.request()
                .input("name", sql.VarChar, name)
                .input("code", sql.VarChar, code)
                .input("nextId", sql.VarChar, nextId)
                .input("createdDate", sql.DateTime, date)
                .input("ulm", sql.DateTime, date)
                .input("dlm", sql.DateTime, date)
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
            const query = "INSERT INTO M_ITEMSUBGROUP (M_ITEMSUBGROUP_ID, CODE, SHORTCODE, ACCD, M_ITEMGROUPID, CREATEDDATE, ULM, DLM) VALUES (@nextId, @code, @shortcode, @accode, @gid, @createdDate, @ulm, @dlm)";

            // Execute the query with properly bound parameters
            const result = await pool.request()
                .input("nextId", sql.VarChar, nextId)
                .input("code", sql.VarChar, code)
                .input("shortcode", sql.VarChar, shcode)
                .input("accode", sql.VarChar, accode)
                .input("gid", sql.VarChar, groupid)
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


// ====================================UOM handler=====================================
export const itemUOMHandler = async (req, res) => {
    const { name, code } = req.body;
    console.log(req.body);

    if (!name || !code) {
        return res.status(200).json({
            status: false,
            message: "all fields are required"
        })
    }

    const getUomCode = async (code) => {
        const query = `SELECT CODE FROM M_UOM WHERE CODE = @param1;`;
        const result = await fetchData(query, [code]);
        return result.length > 0 ? result[0].CODE : null;
    };

    // Create a new item
    const createItem = async (name, code) => {
        try {
            const pool = await connectToDb();
            const date = new Date(); // Use JavaScript Date object
            // Define the SQL query and parameters
            const query = "INSERT INTO M_UOM (DESCR, CODE, SHORTCODE, CREATEDDATE, ULM, DLM) VALUES (@descr, @code, @shortcode, @createdDate, @ulm, @dlm)";

            // Execute the query with properly bound parameters
            const result = await pool.request()
                .input("descr", sql.VarChar, name)
                .input("code", sql.VarChar, code)
                .input("shortcode", sql.VarChar, code)
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
        const isCode = await getUomCode(code);
        if (isCode) {
            return res.status(201).json({
                message: "Unit code is already exists"
            })
        }
        else {

            // Call the function to create the item
            const result = await createItem(name, code);

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
            const query = "INSERT INTO M_LOCATION (CODE, DESCR, BILLPREFIX, ITEMSUBGRSC, SUSPSALES, ACCD, DEPTID, CUSTOMER, REMARKS, CREATEDDATE, ULM, DLM) VALUES (@code, @name, @billprefix, @subgroup, @sales, @account, @dept, @substore, @remarks, @createdDate, @ulm, @dlm)";

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
    // if (!name || !ledger || !rate || !type || !scode || !exempted || !method || !fromamt || !toamt || !parenttax || !remarks) {
    //     return res.status(200).json({
    //         status: false,
    //         message: "all fields are required"
    //     })
    // }

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
            const query = "INSERT INTO M_TAX (TAX_ID, SHORTNAME, DESCR, RATE, TYPE, ACCD, EXEMPTED, PER_AMT_TYPE, FROM_AMT_PER, TO_AMT_PER, P_TAX_ID, REMARKS, CREATEDDATE, ULM, DLM) VALUES (@taxid, @name, @ledger, @rate, @type, @scode, @exempted, @method, @fromamt, @toamt, @parenttax, @remarks, @createdDate, @ulm, @dlm)";

            // Execute the query with properly bound parameters
            const result = await pool.request()
                .input("taxid", sql.VarChar, taxid)
                .input("name", sql.VarChar, name)
                .input("ledger", sql.VarChar, ledger)
                .input("rate", sql.VarChar, rate)
                .input("type", sql.VarChar, type)
                .input("scode", sql.VarChar, scode)
                .input("exempted", sql.VarChar, exempted)
                .input("method", sql.VarChar, method)
                .input("fromamt", sql.VarChar, fromamt)
                .input("toamt", sql.VarChar, toamt)
                .input("parenttax", sql.VarChar, parenttax)
                .input("remarks", sql.VarChar, remarks)
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
        const taxid = await generateNextCode();
        console.log(taxid);

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
