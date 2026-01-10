import { Orbit } from "./orbit";

export interface Planet {
    name: string;
    color: string;
    size: number;
    orbit: Orbit;
    longitude: number;
    radius: number;
}
