import { Page } from "@/components/common/Page";
import ResultsList from "@/components/results/ResultsList";
import { ResultsView } from "@/components/results/ResultsView";
import { useTranslation } from "react-i18next";

export default function ResultsPage() {
  const { t } = useTranslation();
  return (
    <Page title={t("results.title")}>
      <ResultsList />
    </Page>
  );
}
