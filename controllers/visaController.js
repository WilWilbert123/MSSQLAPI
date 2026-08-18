const { getPool, sql } = require('../config/dbConfig');

// Handles the insertion of data into MSSQL across 4 tables in a single transaction
const insertData = async (req, res) => {
    let transaction;
    try {
        const { header, details, payments, discounts } = req.body;

        // Basic validation
        if (!header || !details || !Array.isArray(details) || details.length === 0) {
            return res.status(400).json({ error: 'Invalid payload. Requires "header" object and non-empty "details" array.' });
        }

        const pool = getPool();
        if (!pool) {
            return res.status(500).json({ error: 'Database connection is not established.' });
        }

        // Initialize and begin transaction
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // 1. Insert Header
        const headerReq = new sql.Request(transaction);
        const headerCols = Object.keys(header);
        const headerVals = [];
        headerCols.forEach(key => {
            let val = header[key];
            if (val === 'NULL' || (key.includes('Date') || key.includes('Time') || key.includes('Birthday')) && val === 'N/A') {
                val = null;
            }
            headerReq.input(`h_${key}`, val);
            headerVals.push(`@h_${key}`);
        });
        const hasHeaderId = headerCols.includes('HeaderID');
        await headerReq.query(`
            ${hasHeaderId ? 'SET IDENTITY_INSERT [tblOrderHeader] ON;' : ''}
            INSERT INTO [tblOrderHeader] (${headerCols.map(c => `[${c}]`).join(', ')}) 
            VALUES (${headerVals.join(', ')})
            ${hasHeaderId ? 'SET IDENTITY_INSERT [tblOrderHeader] OFF;' : ''}
        `);

        // 2. Insert Details
        for (const detail of details) {
            const detailReq = new sql.Request(transaction);
            const dCols = Object.keys(detail);
            const dVals = [];
            dCols.forEach(key => {
                let val = detail[key];
                if (val === 'NULL' || (key.includes('Date') || key.includes('Time') || key.includes('Birthday')) && val === 'N/A') {
                    val = null;
                }
                detailReq.input(`d_${key}`, val);
                dVals.push(`@d_${key}`);
            });
            const hasDetailId = dCols.includes('DetailID');
            await detailReq.query(`
                ${hasDetailId ? 'SET IDENTITY_INSERT [tblOrderDetails] ON;' : ''}
                INSERT INTO [tblOrderDetails] (${dCols.map(c => `[${c}]`).join(', ')})
                VALUES (${dVals.join(', ')})
                ${hasDetailId ? 'SET IDENTITY_INSERT [tblOrderDetails] OFF;' : ''}
            `);
        }

        // 3. Insert Payments
        if (payments && Array.isArray(payments) && payments.length > 0) {
            for (const payment of payments) {
                const payReq = new sql.Request(transaction);
                const pCols = Object.keys(payment);
                const pVals = [];
                pCols.forEach(key => {
                    let val = payment[key];
                    if (val === 'NULL' || (key.includes('Date') || key.includes('Time') || key.includes('Birthday')) && val === 'N/A') {
                        val = null;
                    }
                    payReq.input(`p_${key}`, val);
                    pVals.push(`@p_${key}`);
                });
                const hasPaymentId = pCols.includes('PaymentID');
                await payReq.query(`
                    ${hasPaymentId ? 'SET IDENTITY_INSERT [tblOrderPayment] ON;' : ''}
                    INSERT INTO [tblOrderPayment] (${pCols.map(c => `[${c}]`).join(', ')})
                    VALUES (${pVals.join(', ')})
                    ${hasPaymentId ? 'SET IDENTITY_INSERT [tblOrderPayment] OFF;' : ''}
                `);
            }
        }

        // 4. Insert Discounts
        if (discounts && Array.isArray(discounts) && discounts.length > 0) {
            for (const discount of discounts) {
                const discReq = new sql.Request(transaction);
                const dsCols = Object.keys(discount);
                const dsVals = [];
                dsCols.forEach(key => {
                    let val = discount[key];
                    if (val === 'NULL' || (key.includes('Date') || key.includes('Time') || key.includes('Birthday')) && val === 'N/A') {
                        val = null;
                    }
                    discReq.input(`ds_${key}`, val);
                    dsVals.push(`@ds_${key}`);
                });
                // tblOrderDiscDetail uses PaymentID as its identity key according to the schema
                const hasDiscPaymentId = dsCols.includes('PaymentID');
                await discReq.query(`
                    ${hasDiscPaymentId ? 'SET IDENTITY_INSERT [tblOrderDiscDetail] ON;' : ''}
                    INSERT INTO [tblOrderDiscDetail] (${dsCols.map(c => `[${c}]`).join(', ')})
                    VALUES (${dsVals.join(', ')})
                    ${hasDiscPaymentId ? 'SET IDENTITY_INSERT [tblOrderDiscDetail] OFF;' : ''}
                `);
            }
        }

        // Commit transaction if all queries succeed
        await transaction.commit();

        return res.status(201).json({
            message: 'Order successfully saved across all tables!'
        });

    } catch (error) {
        // Rollback transaction on error
        if (transaction) {
            try {
                await transaction.rollback();
                console.log('Transaction rolled back due to error.');
            } catch (rollbackError) {
                console.error('Error rolling back transaction:', rollbackError);
            }
        }

        console.error('Error inserting order data:', error);
        return res.status(500).json({
            error: 'An error occurred while inserting data. Transaction rolled back.',
            details: error.message
        });
    }
};

// Handles fetching a specific transaction from MSSQL (updated for tblOrderHeader)
const getVisaData = async (req, res) => {
    try {
        const orderId = req.params.id; // Using orderCode here

        const pool = await getPool();
        const request = pool.request();

        request.input('OrderCode', sql.VarChar(20), orderId);

        // 1. Get Header
        const headerResult = await request.query(`SELECT * FROM [tblOrderHeader] WHERE OrderCode = @OrderCode`);
        
        if (headerResult.recordset.length === 0) {
            return res.status(404).json({ message: "Order not found." });
        }

        // 2. Get Details
        const detailsResult = await request.query(`SELECT * FROM [tblOrderDetails] WHERE OrderCode = @OrderCode`);
        
        // 3. Get Payments
        const paymentsResult = await request.query(`SELECT * FROM [tblOrderPayment] WHERE OrderCode = @OrderCode`);
        
        // 4. Get Discounts
        const discountsResult = await request.query(`SELECT * FROM [tblOrderDiscDetail] WHERE OrderCode = @OrderCode`);

        // Group everything together exactly like the POST payload format
        const fullOrderData = {
            header: headerResult.recordset[0],
            details: detailsResult.recordset,
            payments: paymentsResult.recordset,
            discounts: discountsResult.recordset
        };

        return res.status(200).json(fullOrderData);
    } catch (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({
            error: 'An error occurred while fetching data from the database.',
            details: error.message
        });
    }
};

// Fetch all orders
const getAllVisaData = async (req, res) => {
    try {
        const pool = await getPool();
        const request = pool.request();
        const query = `SELECT TOP 50 * FROM [tblOrderHeader] ORDER BY OrderDateCreated DESC, OrderTimeCreated DESC`;
        const result = await request.query(query);
        
        return res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ error: 'An error occurred while fetching the data.' });
    }
};

module.exports = {
    insertData,
    getVisaData,
    getAllVisaData
};
