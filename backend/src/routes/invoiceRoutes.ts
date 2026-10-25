import { Router } from "express";
import { verifyAuth } from "../middleware/authMiddleware.js";
import { getInvoices } from "../controller/invoiceController.js";

const router = Router();

router.get('/', verifyAuth, getInvoices);

export default router;