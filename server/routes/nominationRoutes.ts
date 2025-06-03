import express from "express";

const router = express.Router();

import { auth, authorize } from "../middleware/auth";
import {
  batchCreateNominations,
  createNomination,
  getNominationsByCompetitionId,
  getNominationsByCompetitionIdAndWeightCategories,
  deleteNomination,
  batchUpdateNominations,
} from "../controllers/nominationController";

router.get("/competition/:id", getNominationsByCompetitionId);
router.get("/competition/:id/weight-categories", getNominationsByCompetitionIdAndWeightCategories);

router.post(
  "/",
  auth,
  authorize([
    { role: "MEMBER_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },
    { role: "SUPERADMIN", federationId: "*" },
  ]),
  createNomination
);

router.post(
  "/batch",
  auth,
  authorize([
    { role: "MEMBER_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },
    { role: "SUPERADMIN", federationId: "*" },
  ]),
  batchCreateNominations
);

router.delete(
  "/:id",
  auth,
  authorize([
    { role: "MEMBER_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },
    { role: "SUPERADMIN", federationId: "*" },
  ]),
  deleteNomination
);

router.patch(
  "/batch",
  auth,
  authorize([
    { role: "MEMBER_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },
    { role: "SUPERADMIN", federationId: "*" },
  ]),
  batchUpdateNominations
);

export default router;
