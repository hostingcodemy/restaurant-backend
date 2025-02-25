import { executeQuery, connectToDb, closeConnection, fetchData } from "../config/db.js";
import sql from "mssql";

// ====================================get last code=====================================
export const lastOrderno = async (req, res) => {
    // Function to get the last generated ID
    const getLastCode = async () => {
        const query = `
            SELECT TOP 1 PORDERNO FROM TFA_POHDR WHERE PORDERNO LIKE 'POR/%' ORDER BY PORDERNO DESC
        `;

        const result = await fetchData(query);

        if (result.length > 0) {
            return result[0].PORDERNO; // Assuming TAX_ID is stored as "REQ/00001/2024-2025"
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
            return `POR/00001/${financialYear}`; // First code if no records exist
        }

        // Extract the numeric part from the last generated ID
        const lastNumber = parseInt(lastCode.split('/')[1], 10);
        const nextNumber = lastNumber + 1;

        return `POR/${nextNumber.toString().padStart(5, "0")}/${financialYear}`;
    };

    try {
        const nextCode = await generateNextCode();
        res.status(200).json({ nextCode });
    } catch (error) {
        res.status(500).json({ error: "Error generating request number" });
    }
};


// ====================================new indent=====================================
export const purchaseHandler = async (req, res) => {
    const { orderNo, date, reqNo, quotation, type, section, supplier, valid, orderDetails } = req.body;

    if (!orderNo || !reqNo || !date || !quotation || !type || !section || !supplier || !valid || !Array.isArray(orderDetails) || orderDetails.length === 0) {
        return res.status(400).json({
            status: false,
            message: "All fields are required, including a non-empty order details array.",
        });
    }

    const totalAmount = orderDetails.reduce((sum, item) => sum + item.amount, 0);

    const getFinancialYear = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
    };

    const createHeader = async (totalAmount, orderNo, date, reqNo, quotation, type, section, supplier, valid) => {
        try {
            const pool = await connectToDb();
            const today = new Date();
            const finyr = getFinancialYear();

            const query = `INSERT INTO TFA_POHDR 
                (FINYR, PORDERNO, TYPE, PORDERDT, AMT, SORDERNO, QUOTNO,  SECTIONCD, SUPPLPORDERNO, DLVDT, CREATEDDATE, ULM, DLM, POVALIDDAYS) 
                VALUES (@finyr, @orderNo, @type, @date, @amt, @reqNo, @quotation, @section, @supplier, @valid, @createdDate, @ulm, @dlm, @validDay)`;

            const result = await pool.request()
                .input("finyr", sql.VarChar, finyr)
                .input("orderNo", sql.VarChar, orderNo)
                .input("type", sql.VarChar, type)
                .input("date", sql.Date, date)
                .input("amt", sql.Decimal, totalAmount)
                .input("reqNo", sql.VarChar, reqNo)
                .input("quotation", sql.VarChar, quotation)
                .input("section", sql.VarChar, section)
                .input("supplier", sql.VarChar, supplier)
                .input("valid", sql.DateTime, valid)
                .input("createdDate", sql.DateTime, today)
                .input("ulm", sql.VarChar, today.toLocaleString())
                .input("dlm", sql.DateTime, today)
                .input("validDay", sql.Decimal, 1)
                .query(query);

            return result.rowsAffected > 0;
        } catch (error) {
            console.error("Error inserting header:", error);
            return false;
        }
    };

    const insertDetails = async (orderNo, date, orderDetails) => {
        try {
            const pool = await connectToDb();
            const finyr = getFinancialYear();

            const insertPromises = orderDetails.map(async (detail) => {
                const { itemCD, description, unit, qty, rate, amount, tax, tax2, tax3, disc } = detail; // Adjust fields as per your table schema

                const query = `INSERT INTO TFA_PODTL 
                    (FINYR, PORDERNO, PORDERDT, ITEMCD, DTLDESCR, UOM, QTY, RATE, AMT, TAXAMNT, TAXAMNT2, TAXAMNT3, DISC) 
                    VALUES (@finyr, @orderNo, @date, @itemCD, @description, @unit, @qty, @rate, @amount, @tax, @tax2, @tax3, @disc)`;

                return pool.request()
                    .input("finyr", sql.VarChar, finyr)
                    .input("orderNo", sql.VarChar, orderNo)
                    .input("date", sql.Date, date)
                    .input("itemCD", sql.VarChar, itemCD)
                    .input("description", sql.VarChar, description)
                    .input("unit", sql.VarChar, unit)
                    .input("qty", sql.Decimal, qty)
                    .input("rate", sql.Decimal, rate)
                    .input("amount", sql.Decimal, amount)
                    .input("tax", sql.VarChar, tax)
                    .input("tax2", sql.VarChar, tax2)
                    .input("tax3", sql.VarChar, tax3)
                    .input("disc", sql.Decimal, disc)
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
        const headerInserted = await createHeader(totalAmount, orderNo, date, reqNo, quotation, type, section, supplier, valid);
        if (!headerInserted) {
            return res.status(500).json({ status: false, message: "Header insertion failed." });
        }

        const detailsInserted = await insertDetails(orderNo, date, orderDetails);
        if (!detailsInserted) {
            return res.status(500).json({ status: false, message: "Details insertion failed." });
        }

        return res.status(200).json({
            status: true,
            message: "Purchase successfully inserted",
            data: { orderNo, date, reqNo, quotation, type, section, supplier, orderDetails },
        });
    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({ message: "Error processing the request" });
    } finally {
        await closeConnection();
    }
};



// ====================================get all indent=====================================
export const allPurchase = async (req, res) => {
    // Function to fetch all headers from the database
    const getPoHdr = async () => {
        const query = `SELECT * FROM TFA_POHDR`;
        return await fetchData(query); // Fetch all headers
    };

    const getReqDetails = async () => {
        const allHeaders = await getPoHdr();

        const headersWithDetails = await Promise.all(
            allHeaders.map(async (item) => {
                const query = `SELECT * FROM TFA_PODTL WHERE PORDERNO = @param1`;
                const details = await fetchData(query, [item.PORDERNO]);

                return {
                    ...allHeaders,
                    details, // Attach the details array to the header object
                };
            })
        );

        return headersWithDetails; // Return structured data
    };


    try {
        const details = await getReqDetails(); // Await the result of the async function
        res.status(200).json({
            message: "purchase order fetched successfully", // Success message
            data: details, // Send the result (UOM details) in the response
        });
    } catch (error) {
        console.error("Error fetching:", error); // Improved error logging
        res.status(500).json({
            message: "Error fetching", // Error message
            error: error.message, // Optionally send the error message for debugging
        });
    }
};



// ====================================get all indent=====================================
export const reqPurchase = async (req, res) => {
    // Function to fetch all UOMs from the database
    const { reqNo } = req.body;
    if (!reqNo) {
        return res.status(400).json({
            status: false,
            message: "Order no is required",
        });
    }
    console.log(reqNo);
    const getReqHdr = async () => {
        const query = `SELECT * FROM TFA_POHDR WHERE PORDERNO = @param1`;
        const result = await fetchData(query, [reqNo]); // Fetch the header

        return result.length > 0 ? result[0] : null; // Return the first header or null
    };

    const getReqDetails = async () => {
        const header = await getReqHdr(reqNo);

        if (!header) {
            return { error: "No header found for the given request number" };
        }

        const query = `SELECT * FROM TFA_PODTL WHERE PORDERNO = @param1`;
        const details = await fetchData(query, [reqNo]);

        return {
            header,   // Keep header as an object
            details,  // Attach details array
        };
    };


    try {
        const data = await getReqDetails(); // Await the result of the async function
        res.status(200).json({
            message: "Order details fetched successfully", // Success message
            data // Send the result (UOM details) in the response
        });
    } catch (error) {
        console.error("Error fetching taxes:", error); // Improved error logging
        res.status(500).json({
            message: "Error fetching taxes", // Error message
            error: error.message, // Optionally send the error message for debugging
        });
    }
};