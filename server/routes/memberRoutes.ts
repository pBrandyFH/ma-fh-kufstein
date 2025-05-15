import express from "express";
import {
  createMember,
  deleteMember,
  getMemberById,
  getMembersByFederationId,
  updateMember,
} from "../controllers/memberController";
import { auth, authorize } from "../middleware/auth";

const router = express.Router();

router.get("/:id", getMemberById);

router.get("/federation/:federationId", getMembersByFederationId);

router.post(
  "/",
  auth,
  authorize([
    { role: "FEDERATION_ADMIN", federationId: "*" },
    { role: "SUPERADMIN", federationId: "*" },
  ]),
  createMember
);

router.put(
  "/:id",
  auth,
  authorize([
    { role: "MEMBER_ADMIN", federationId: "*" },
    { role: "FEDERATION_ADMIN", federationId: "*" },
    { role: "SUPERADMIN", federationId: "*" },
  ]),
  updateMember
);

router.delete(
  "/:id",
  auth,
  authorize([
    { role: "FEDERATION_ADMIN", federationId: "*" },
    { role: "SUPERADMIN", federationId: "*" },
  ]),
  deleteMember
);

export default router;
