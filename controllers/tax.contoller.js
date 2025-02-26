import { executeQuery, connectToDb, closeConnection } from "../config/db.js";
import sql from "mssql";
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

        const result = await executeQuery(query);

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


// ====================================tax update=====================================
export const taxUpdate = async (req, res) => {
    const { taxID } = req.body;

    if (!taxID) {
        return res.status(200).json({
            status: false,
            message: "taxID is required"
        })
    }
}


// ====================================tax delete=====================================
export const taxDelete = async (req, res) => {
    const { taxID } = req.body;

    if (!taxID) {
        return res.status(400).json({
            status: false,
            message: "taxID is required"
        });
    }

    const getActive = async () => {
        try {
            const query = `SELECT ACTIVE FROM M_TAX WHERE TAX_ID = @param0`;
            const result = await executeQuery(query, [taxID]);
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
                message: "tax not found",
            });
        }

        // Toggle ACTIVE flag (1 -> 0, 0 -> 1)
        const newActiveStatus = isActive ? 0 : 1;
        const updateQuery = `UPDATE M_TAX SET ACTIVE = @param0 WHERE TAX_ID = @param1`;
        await executeQuery(updateQuery, [newActiveStatus, taxID]);

        return res.status(200).json({
            status: true,
            message: `tax ACTIVE flag updated to ${newActiveStatus}`
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


// ====================================get tax handler=====================================
export const getTax = async (req, res) => {
    const getTax = async () => {
        const query = `
            SELECT * FROM M_TAX
        `;
        const result = await executeQuery(query); // Fetch data using the query
        return result;
    };

    try {
        const taxes = await getTax(); // Await the result of the async function
        res.status(200).json({
            message: "taxes fetched successfully", // Success message
            data: taxes, // Send the result in the response
        });
    } catch (error) {
        console.error("Error fetching taxes:", error); // Improved error logging
        res.status(500).json({
            message: "Error fetching taxes", // Error message
            error: error.message, // Optionally send the error message for debugging
        });
    }
};