import React, { useState, useEffect } from 'react';
import './ManageTables.css';
import axios from 'axios';

const ManageTables = () => {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');

    const url = "http://localhost:4000";

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const tablesRes = await axios.get(url + "/api/table/list");

            if (tablesRes.data.success) {
                setTables(tablesRes.data.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTable = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(url + "/api/table/add", { name });
            if (response.data.success) {
                alert("Seat added successfully!");
                setName('');
                fetchData();
            } else {
                alert("Error adding seat: " + (response.data.message || "Unknown error"));
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error adding seat. Name might already exist.");
        }
    };

    const handleDeleteTable = async (id) => {
        if (!window.confirm("Are you sure you want to delete this seat?")) return;
        try {
            const response = await axios.post(url + "/api/table/remove", { id });
            if (response.data.success) {
                fetchData();
            }
        } catch (error) {
            console.error("Error deleting:", error);
        }
    };

    const handleClearTable = async (tableId) => {
        try {
            const response = await axios.post(url + "/api/table/clear", { tableId });
            if (response.data.success) {
                alert("Seat cleared successfully!");
                fetchData();
            }
        } catch (error) {
            console.error("Error clearing seat:", error);
            alert("Error clearing seat");
        }
    };

    return (
        <div className="manage-tables">
            <h2>Seat Management</h2>

            {/* Add Table Form */}
            <form className="table-form" onSubmit={handleAddTable}>
                <div className="form-group">
                    <label>Seat/Table Name</label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Table 1 or Cabin 5"
                    />
                </div>
                <button type="submit" className="add-btn">Add Seat</button>
            </form>

            {/* Table List */}
            {loading ? <p>Loading...</p> : (
                <div className="tables-grid">
                    {tables.map(table => (
                        <div key={table._id} className="table-card">
                            <div className="table-header">
                                <span className="table-number">🪑 {table.name}</span>
                                <span className={`table-status status-${table.status}`}>{table.status}</span>
                            </div>

                            {table.status === 'occupied' && (
                                <button className="clear-btn" onClick={() => {
                                    if (window.confirm("Clear this seat?")) {
                                        handleClearTable(table._id);
                                    }
                                }}>
                                    🧹 Clear Seat
                                </button>
                            )}

                            <div className="table-actions">
                                <button className="action-btn delete-btn" onClick={() => handleDeleteTable(table._id)}>
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageTables;
