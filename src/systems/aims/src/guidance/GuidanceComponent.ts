import { Geometry } from '@aims/guidance/Geometry';

export interface GuidanceComponent {
    init(): void;

    update(deltaTime: number): void;

    /**
     * Callback invoked when the FMS decides to generate new multiple leg geometry
     *
     * @param geometry the new multiple leg geometry
     */
    acceptMultipleLegGeometry?(geometry: Geometry): void;
}
