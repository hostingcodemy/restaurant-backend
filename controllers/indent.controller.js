import { executeQuery, connectToDb, closeConnection } from "../config/db.js";
import sql from "mssql";

// ====================================get last code=====================================
export const lastReqno = async (req, res) => {
    // Function to get the last generated ID
    const getLastCode = async () => {
        const query = `
            SELECT TOP 1 STORESREQNO FROM TFA_REQUISITIONHDR WHERE STORESREQNO LIKE 'REQ/%' ORDER BY STORESREQNO DESC
        `;

        const result = await executeQuery(query);

        if (result.length > 0) {
            return result[0].STORESREQNO;
        }

        return null; // No previous code found
    };

    // Function to determine the current financial year
    const getFinancialYear = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // JavaScript months are 0-based

        if (month >= 4) {
            return `${year}-${year + 1}`;
        } else {
            return `${year - 1}-${year}`;
        }
    };

    // Function to generate the next request number
    const generateNextCode = async () => {
        const lastCode = await getLastCode();
        const financialYear = getFinancialYear();

        if (!lastCode) {
            return `REQ/00001/${financialYear}`; // First code if no records exist
        }

        // Extract the numeric part from the last generated ID
        const lastNumber = parseInt(lastCode.split('/')[1], 10);
        const nextNumber = lastNumber + 1;

        return `REQ/${nextNumber.toString().padStart(5, "0")}/${financialYear}`;
    };

    try {
        const nextCode = await generateNextCode();
        res.status(200).json({ nextCode });
    } catch (error) {
        res.status(500).json({ error: "Error generating request number" });
    }
};


// ====================================new indent=====================================
export const indentHandler = async (req, res) => {
    const { reqNo, date, type, reqFrom, reqTo, reqDate, remarks, reqDetails } = req.body;

    if (!reqNo || !date || !type || !reqFrom || !reqTo || !reqDate || !remarks || !Array.isArray(reqDetails) || reqDetails.length === 0) {
        return res.status(400).json({
            status: false,
            message: "All fields are required, including a non-empty reqDetails array.",
        });
    }

    const getFinancialYear = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
    };

    const createHeader = async (reqNo, date, type, reqFrom, reqTo, reqDate, remarks) => {
        try {
            const pool = await connectToDb();
            const today = new Date();
            const finyr = getFinancialYear();

            const query = `INSERT INTO TFA_REQUISITIONHDR 
                (FINYR, STORESREQNO, TYPE, STORESREQDT, SECTIONCDFROM, SECTIONCDTO, ENTRYDT, ENTRYTIME, LMDT, REMARKS, CREATEDDATE, ULM, DLM, ACTIVE) 
                VALUES (@finyr, @reqNo, @type, @date, @reqFrom, @reqTo, @reqDate, @reqTime, @lmdate, @remarks, @createdDate, @ulm, @dlm, @active)`;

            const result = await pool.request()
                .input("finyr", sql.VarChar, finyr)
                .input("reqNo", sql.VarChar, reqNo)
                .input("type", sql.VarChar, type)
                .input("date", sql.VarChar, date)
                .input("reqFrom", sql.VarChar, reqFrom)
                .input("reqTo", sql.VarChar, reqTo)
                .input("reqDate", sql.VarChar, reqDate)
                .input("reqTime", sql.VarChar, reqDate)
                .input("lmdate", sql.VarChar, date)
                .input("remarks", sql.VarChar, remarks)
                .input("createdDate", sql.DateTime, today)
                .input("ulm", sql.DateTime, today)
                .input("dlm", sql.DateTime, today)
                .input("active", sql.Bit, 1)
                .query(query);

            return result.rowsAffected > 0;
        } catch (error) {
            console.error("Error inserting header:", error);
            return false;
        }
    };

    const insertDetails = async (reqNo, reqDate, reqDetails) => {
        try {
            const pool = await connectToDb();
            const today = new Date();
            const finyr = getFinancialYear();

            const insertPromises = reqDetails.map(async (detail) => {
                const { details, description, unit, quantity, job, } = detail; // Adjust fields as per your table schema

                const query = `INSERT INTO TFA_REQUISITIONDTL 
                    (FINYR, STORESREQNO, STORESREQDT, ITEMCD, DTLDESCR, UOM, QTY, SPREM, CREATEDDATE, ULM, DLM, ACTIVE) 
                    VALUES (@finyr, @reqNo, @reqDate, @details, @description, @unit, @quantity, @job, @createdDate, @ulm, @dlm, @active)`;

                return pool.request()
                    .input("finyr", sql.VarChar, finyr)
                    .input("reqNo", sql.VarChar, reqNo)
                    .input("reqDate", sql.DateTime, reqDate)
                    .input("details", sql.VarChar, details)
                    .input("description", sql.VarChar, description)
                    .input("unit", sql.VarChar, unit)
                    .input("quantity", sql.VarChar, quantity)
                    .input("job", sql.VarChar, job)
                    .input("createdDate", sql.DateTime, today)
                    .input("ulm", sql.DateTime, today)
                    .input("dlm", sql.DateTime, today)
                    .input("active", sql.Bit, 1)
                    .query(query);
            });

            await Promise.all(insertPromises);
            return true;
        } catch (error) {
            console.error("Error inserting details:", error);
            return false;
        }
    };

    try {
        const headerInserted = await createHeader(reqNo, date, type, reqFrom, reqTo, reqDate, remarks);
        if (!headerInserted) {
            return res.status(500).json({ status: false, message: "Header insertion failed." });
        }

        const detailsInserted = await insertDetails(reqNo, reqDate, reqDetails);
        if (!detailsInserted) {
            return res.status(500).json({ status: false, message: "Details insertion failed." });
        }

        return res.status(200).json({
            status: true,
            message: "Requisition successfully inserted",
            data: { reqNo, date, type, reqFrom, reqTo, reqDate, remarks, reqDetails },
        });
    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({ message: "Error processing the request" });
    } finally {
        await closeConnection();
    }
};


// ====================================get all indent=====================================
export const allIndent = async (req, res) => {
    // Function to fetch all headers from the database
    const getReqHdr = async () => {
        const query = `SELECT * FROM TFA_REQUISITIONHDR`;
        return await executeQuery(query); // Fetch all headers
    };

    const getReqDetails = async () => {
        const allHeaders = await getReqHdr();

        const headersWithDetails = await Promise.all(
            allHeaders.map(async (item) => {
                const query = `SELECT * FROM TFA_REQUISITIONDTL WHERE STORESREQNO = @param0`;
                const details = await executeQuery(query, [item.STORESREQNO]);

                return {
                    ...item, // Spread the individual header
                    details, // Attach the details array to the header object
                };
            })
        );

        return headersWithDetails; // Return structured data
    };

    try {
        const details = await getReqDetails(); // Await the result of the async function
        res.status(200).json({
            message: "Requisition fetched successfully", // Success message
            details, // Send the result in the response
        });
    } catch (error) {
        console.error("Error fetching requisition:", error); // Improved error logging
        res.status(500).json({
            message: "Error fetching requisition", // Error message
            error: error.message, // Optionally send the error message for debugging
        });
    }
};


// ====================================get all indent=====================================
export const reqIndent = async (req, res) => {
    // Function to fetch all req indent from the database
    const { reqNo } = req.body;
    if (!reqNo) {
        return res.status(400).json({
            status: false,
            message: "Requisition no is required",
        });
    }
    console.log(reqNo);
    const getReqHdr = async () => {
        const query = `SELECT * FROM TFA_REQUISITIONHDR WHERE STORESREQNO = @param0`;
        const result = await executeQuery(query, [reqNo]); // Fetch the header

        return result.length > 0 ? result[0] : null; // Return the first header or null
    };

    const getReqDetails = async () => {
        const header = await getReqHdr(reqNo);
        console.log(header);

        if (!header) {
            return { error: "No header found for the given request number" };
        }

        const query = `SELECT * FROM TFA_REQUISITIONDTL WHERE STORESREQNO = @param0`;
        const details = await executeQuery(query, [reqNo]);

        return {
            header,   // Keep header as an object
            details,  // Attach details array
        };
    };

    try {
        const data = await getReqDetails(); // Await the result of the async function
        res.status(200).json({
            message: "requisition fetched successfully", // Success message
            data // Send the result in the response
        });
    } catch (error) {
        console.error("Error fetching requisition:", error); // Improved error logging
        res.status(500).json({
            message: "Error fetching requisition", // Error message
            error: error.message, // Optionally send the error message for debugging
        });
    }
};