import { expect, it } from "vitest";
import { fetchHeroCompensation, formatSek } from "./compensation";

it.each([
  ["Ögonläkare", "Torsby", "1 660–1 758", "1 221–1 293"],
  ["ssk", "Malå", "586–629", "431–463"],
  ["Barnmorska", "Umeå", "676–725", "497–533"],
])("verifierar RPC-spannen för %s i %s", async (role, city, company, employee) => {
  const result = await fetchHeroCompensation(role, city);
  expect(result.status).toBe("ok");
  if (result.status !== "ok") throw new Error(`Inget exakt resultat: ${result.status}`);
  expect(`${formatSek(result.data.foretagare_low)}–${formatSek(result.data.foretagare_high)}`.replace(/\s/g, " ")).toBe(company);
  expect(`${formatSek(result.data.anstalld_low)}–${formatSek(result.data.anstalld_high)}`.replace(/\s/g, " ")).toBe(employee);
  expect(result.data.municipality_name).toBe(city);
}, 15000);

it("ger kandidater utan direkt belopp för Specialistsjuksköterska i Örebro", async () => {
  const result = await fetchHeroCompensation("Specialistsjuksköterska", "Örebro");
  expect(result.status).toBe("candidates");
  if (result.status !== "candidates") throw new Error("Kandidatlista saknas");
  expect(result.data.length).toBeGreaterThan(1);
}, 15000);

it("ger ingen träff för Ögonläkare i Hälsingland", async () => {
  expect(await fetchHeroCompensation("Ögonläkare", "Hälsingland")).toEqual({ status: "empty" });
}, 15000);