import { executeQuery, connectToDb, closeConnection } from "../config/db.js";
import sql from "mssql";
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

        const result = await executeQuery(query);

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


// ====================================location update=====================================
export const locationUpdate = async (req, res) => {
    const { locCode } = req.body;

    if (!locCode) {
        return res.status(200).json({
            status: false,
            message: "locCode is required"
        })
    }
}


// ====================================location delete=====================================
export const LocationDelete = async (req, res) => {
    const { locCode } = req.body;

    if (!locCode) {
        return res.status(400).json({
            status: false,
            message: "locCode is required"
        });
    }

    const getActive = async () => {
        try {
            const query = `SELECT ACTIVE FROM M_LOCATION WHERE CODE = @param0`;
            const result = await executeQuery(query, [locCode]);
            return result.length ? result[0].ACTIVE : null;
        } catch (error) {
            console.error("Error fetching ACTIVE flag:", error);
            throw error;
        }
    };

    try {
        const isActive = await getActive();

        if (isActive === null) {
            return res.status(404).json({
                status: false,
                message: "location not found",
            });
        }

        // Toggle ACTIVE flag (1 -> 0, 0 -> 1)
        const newActiveStatus = isActive ? 0 : 1;
        const updateQuery = `UPDATE M_LOCATION SET ACTIVE = @param0 WHERE CODE = @param1`;
        await executeQuery(updateQuery, [newActiveStatus, locCode]);

        return res.status(200).json({
            status: true,
            message: `Item ACTIVE flag updated to ${newActiveStatus}`
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            status: false,
            message: "Error processing the request",
        });
    } finally {
        await closeConnection();
    }
};


// ====================================get location handler=====================================
export const getlocation = async (req, res) => {
    // Function to fetch all locations from the database
    const getLoc = async () => {
        const query = `
            SELECT * FROM M_LOCATION
        `;
        const result = await executeQuery(query); // Fetch data using the query
        return result;
    };

    try {
        const locations = await getLoc(); // Await the result of the async function
        res.status(200).json({
            message: "Locations fetched successfully", // Success message
            data: locations, // Send the result in the response
        });
    } catch (error) {
        console.error("Error fetching locations:", error); // Improved error logging
        res.status(500).json({
            message: "Error fetching locations", // Error message
            error: error.message, // Optionally send the error message for debugging
        });
    }
};