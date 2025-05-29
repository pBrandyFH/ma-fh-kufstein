import express from "express";

const router = express.Router();

import { auth, authorize } from "../middleware/auth";
import {
  batchCreateNominations,
  createNomination,
  getNominationsByCompetitionId,
  deleteNomination,
} from "../controllers/nominationController";

router.get("/competition/:id", getNominationsByCompetitionId);

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

export default router;
