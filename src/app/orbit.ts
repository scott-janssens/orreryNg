export interface Orbit {
    semiMajorAxis: number; // in AU
    semiMinorAxis: number; // in AU
    eccentricity: number;
    inclination?: number; // in degrees
    longitudeOfAscendingNode?: number; // in degrees
    longitudeOfPerihelion?: number; // in degrees
}
