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
    case "international":
      return "International";
    case "continental":
      return "Continental";
    case "national":
      return "National";
    case "federalState":
      return "Federal State";
    default:
      return "";
  }
};
