import tableModel from "../models/tableModel.js";

// Add table
const addTable = async (req, res) => {
    try {
        // [EMERGENCY FIX] Drop the legacy index that blocks new seat additions
        try {
            await tableModel.collection.dropIndex("tableNumber_1_type_1").catch(() => { });
            await tableModel.collection.dropIndex("tableId_1").catch(() => { });
            console.log("✅ Dropped problematic legacy indexes");
        } catch (err) {
            // Indexes already gone, ignore
        }

        const { name } = req.body;

        if (!name) {
            return res.json({ success: false, message: "Seat name is required" });
        }

        const existingTable = await tableModel.findOne({ name });
        if (existingTable) {
            return res.json({ success: false, message: "This name already exists" });
        }

        const table = new tableModel({
            name,
            status: 'available',
            qrCodeLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}?table=${encodeURIComponent(name)}`
        });

        await table.save();
        res.json({ success: true, message: "Seat Added", data: table });
    } catch (error) {
        console.error("Error adding seat:", error);
        res.json({ success: false, message: error.message || "Error adding seat" });
    }
};

// List all tables
const listTables = async (req, res) => {
    try {
        const tables = await tableModel.find({}).sort({ name: 1 });
        res.json({ success: true, data: tables });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching tables" });
    }
};

// Update table status
const updateTableStatus = async (req, res) => {
    try {
        const { name, status } = req.body;

        if (!name) {
            return res.json({ success: false, message: "Name is required" });
        }

        const table = await tableModel.findOneAndUpdate(
            { name },
            { status },
            { new: true }
        );

        if (!table) {
            return res.json({ success: false, message: "Seat not found" });
        }

        res.json({ success: true, message: "Status Updated", data: table });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating status" });
    }
};

// Clear table (set to available)
const clearTable = async (req, res) => {
    try {
        const { tableId } = req.body;

        if (!tableId) {
            return res.json({ success: false, message: "ID is required" });
        }

        const table = await tableModel.findByIdAndUpdate(
            tableId,
            { status: 'available' },
            { new: true }
        );

        if (!table) {
            return res.json({ success: false, message: "Seat not found" });
        }

        const io = req.app.get('io');
        if (io) {
            io.emit('tableUpdated', {
                tableId: table._id,
                status: 'available',
                tableName: table.name
            });
            console.log(`📢 Seat ${table.name} availability broadcasted`);
        }

        res.json({ success: true, message: "Seat cleared successfully", data: table });
    } catch (error) {
        console.error("Error clearing seat:", error);
        res.json({ success: false, message: "Error clearing seat" });
    }
};

// Remove table
const removeTable = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.json({ success: false, message: "ID is required" });
        }

        await tableModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Seat Removed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error removing seat" });
    }
};

export { addTable, listTables, updateTableStatus, removeTable, clearTable };
