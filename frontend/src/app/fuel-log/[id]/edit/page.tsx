import { FuelLogFormPage } from "@/components/fuel-log/FuelLogFormPage";

export default async function EditFuelLogPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  return <FuelLogFormPage mode="edit" fuelLogId={id} />;
}
