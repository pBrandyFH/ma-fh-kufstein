import { Federation, Competition } from "../../types";

export const getCompetitionType = (
  competition: Competition,
  federations: Federation[]
): string => {
  const hostFederation =
    typeof competition.hostFederationId === "string"
      ? federations.find((f) => f._id === competition.hostFederationId)
      : competition.hostFederationId;

  if (!hostFederation) return "";

  switch (hostFederation.type) {
    case "INTERNATIONAL":
      return "International";
    case "REGIONAL":
      return "Continental";
    case "NATIONAL":
      return "National";
    case "STATE":
      return "Federal State";
    default:
      return "";
  }
};
