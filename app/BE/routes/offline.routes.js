
import { Router } from 'express';

import {
    downloadOfflinePackage,
    getOfflineMetadata
} from '../controllers/offline.controller.js';

const router = Router();

// Lấy thông tin package offline
router.get('/', getOfflineMetadata);

// Download package ZIP
router.get('/download', downloadOfflinePackage);

export default router;
