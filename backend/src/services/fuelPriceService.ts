import { FuelType } from "../types/fuelLog";

interface FuelPriceRequest {
  fuel_station_name: string;
  city?: string | null;
  state?: string | null;
  fuel_type: FuelType;
}

interface FuelPriceProvider {
  name: string;
  getPrice(request: FuelPriceRequest): Promise<number | null>;
}

class FuelPriceService {
  private providers: FuelPriceProvider[] = [];

  registerProvider(provider: FuelPriceProvider) {
    this.providers.push(provider);
  }

  async getSuggestedPrice(request: FuelPriceRequest) {
    for (const provider of this.providers) {
      try {
        const price = await provider.getPrice(request);
        if (price !== null) {
          return {
            price,
            source: provider.name,
            manual_required: false,
            message: "Fuel price fetched successfully.",
          };
        }
      } catch {
        continue;
      }
    }

    return {
      price: null,
      source: null,
      manual_required: true,
      message: "Fuel price could not be fetched automatically. Please enter the price manually.",
    };
  }
}

export const fuelPriceService = new FuelPriceService();
