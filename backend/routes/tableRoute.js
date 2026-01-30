import express from "express";
import { addTable, listTables, updateTableStatus, clearTable, removeTable } from "../controllers/tableController.js";

const tableRouter = express.Router();

tableRouter.post("/add", addTable);
tableRouter.get("/list", listTables);
tableRouter.post("/update-status", updateTableStatus);
tableRouter.post("/clear", clearTable);
tableRouter.post("/remove", removeTable);

export default tableRouter;