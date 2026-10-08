import express from "express";
import { findShortestPath, listNodes } from "../controllers/pathfinding.controller.js";

const router = express.Router();

router.get("/nodes", listNodes);
router.post("/", findShortestPath);

export default router;
