import { executeQuery, connectToDb, closeConnection, fetchData } from "../config/db.js";

export const itemGroupHandler = async (req, res) => {
    const { name, code } = req.body;

    // Function to get the last generated ID
    const getLastGeneratedId = async () => {
        const query = `
            SELECT TOP 1 M_ITEMGROUPID FROM M_ITEMGROUP 
            WHERE M_ITEMGROUPID LIKE 'MIG%' 
            ORDER BY M_ITEMGROUPID DESC
        `;

        const result = await fetchData(query);

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
    const createItem = async (name, code, id) => {
        try {
            const pool = await connectToDb();

            // Define the SQL query and parameters
            const query = "INSERT INTO M_ITEMGROUP (GROUPNAME, GROUPCODE, M_ITEMGROUPID) VALUES (@param0, @param1, @param2)";
            const params = [name, code, id];

            // Execute the query
            await executeQuery(query, params);
            console.log("Data inserted!");
        } catch (error) {
            console.error("Error:", error);
        }
    };

    try {
        // Generate the next ID
        const nextId = await generateNextId();

        // Call the function to create the item
        await createItem(name, code, nextId);

        // Respond with the success message
        res.status(200).json({
            message: "Item group successfully created",
            data: { name, code },
        });
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


export const itemSubGroupHandler = async (req, res) => {
    const { name, code, groupid, accode } = req.body;
    console.log(req.body);

    // Function to get the last generated ID
    const getLastGeneratedId = async () => {
        const query = `
            SELECT TOP 1 M_ITEMSUBGROUP_ID FROM M_ITEMSUBGROUP 
            WHERE M_ITEMSUBGROUP_ID LIKE 'MISG%' 
            ORDER BY M_ITEMSUBGROUP_ID DESC
        `;

        const result = await fetchData(query);
        console.log(result);

        if (result.length > 0) {
            return result[0].M_ITEMSUBGROUP_ID;
        }

        return null; // No previous ID found
    };

    // Function to generate the next ID
    const generateNextId = async () => {
        const lastId = await getLastGeneratedId();
        console.log(lastId);

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
    const createItem = async (name, code, id, groupid, accd) => {
        try {
            const pool = await connectToDb();

            // Define the SQL query and parameters
            const query = "INSERT INTO M_ITEMSUBGROUP (SHORTCODE, CODE, M_ITEMSUBGROUP_ID, M_ITEMGROUPID,ACCD) VALUES (@param0, @param1, @param2, @param3, @param4)";
            const params = [name, code, id, groupid, accd];

            // Execute the query
            await executeQuery(query, params);
            console.log("Data inserted!");
        } catch (error) {
            console.error("Error:", error);
        }
    };

    try {
        // Generate the next ID
        const nextId = await generateNextId();
        console.log(nextId);

        // Call the function to create the item
        await createItem(name, code, nextId, groupid, accode);

        // Respond with the success message
        res.status(200).json({
            message: "Item sub-group successfully created",
            data: { name, code, nextId, accode, groupid },
        });
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


export const allItemSubGroup = async (req, res) =>{
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


export const itemUOMHandler = async (req, res) => {
    const { name, code } = req.body;
    console.log(req.body);

    const getUomCode = async (code) => {
        const query = `SELECT CODE FROM M_UOM WHERE CODE = @param1;`;
        const result = await fetchData(query, [code]);
        return result.length > 0 ? result[0].CODE : null;
    };

    // Create a new item
    const createItem = async (name, code) => {
        try {
            await connectToDb();
            // Define the SQL query and parameters
            const query = "INSERT INTO M_UOM (CODE, SHORTCODE, DESCR) VALUES (@param0, @param1, @param2)";
            const params = [name, code, name];

            // Execute the query
            await executeQuery(query, params);
            console.log("Data inserted!");
        } catch (error) {
            console.error("Error:", error);
        }
    };

    try {
        const isCode = await getUomCode(code);
        console.log(isCode);
        if (isCode) {
            return res.status(201).json({
                message: "Unit code is already exists"
            })
        }
        else {

            // Call the function to create the item
            await createItem(name, code);

            // Respond with the success message
            res.status(200).json({
                message: "Item UOM successfully created",
                data: { name, code },
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
