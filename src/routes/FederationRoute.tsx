import { FederationDetail } from "../components/federations/FederationDetail"
import { useParams } from "react-router-dom"

export function FederationRoute() {
  const { id } = useParams<{ id: string }>()

  if (!id) {
    return null
  }

  return <FederationDetail />
} 