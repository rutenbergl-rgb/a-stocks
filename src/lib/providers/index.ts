import { demoProvider } from "./demo-provider";
import { fmpProvider } from "./fmp-provider";

export const provider = process.env.FMP_API_KEY ? fmpProvider : demoProvider;
