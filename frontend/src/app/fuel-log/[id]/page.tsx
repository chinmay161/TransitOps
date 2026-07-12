import { FuelLogDetailPage } from "@/components/fuel-log/FuelLogDetailPage";

export default async function FuelLogDetailRoute({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  return <FuelLogDetailPage fuelLogId={id} />;
}
