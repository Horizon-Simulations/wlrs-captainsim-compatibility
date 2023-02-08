export type Spherical = [number, number, number]

declare global {
    interface StateMachineStateTransition {
        target: StateMachineState,
    }

    interface StateMachineState {
        transitions: { [event: number]: StateMachineStateTransition }
    }

    interface StateMachineDefinition {
        init: StateMachineState,
    }

    interface StateMachine {
        value: StateMachineState,

        action(event: number): void,

        setState(newState: StateMachineState): void,
    }

    // eslint-disable-next-line camelcase
    namespace B77HS_Util {
        function createDeltaTimeCalculator(startTime: number): () => number

        function createFrameCounter(interval: number): number

        function createMachine(machineDef: StateMachineDefinition): StateMachine

        function trueToMagnetic(heading: Degrees, magVar?: Degrees): Degrees

        function magneticToTrue(heading: Degrees, magVar?: Degrees): Degrees

        function latLonToSpherical(ll: LatLongData): Spherical

        function sphericalToLatLon(s: Spherical): LatLongData

        function greatCircleIntersection(latlon1: LatLongData, brg1: Degrees, latlon2: LatLongData, brg2: Degrees): LatLongData

        function bothGreatCircleIntersections(latlon1: LatLongData, brg1: Degrees, latlon2: LatLongData, brg2: Degrees): [LatLongData, LatLongData]

        function getIsaTemp(alt?: Feet): number;

        function getIsaTempDeviation(alt?: Feet, sat?: Celsius): Celsius

        class UpdateThrottler {
            constructor(intervalMs: number);

            /**
             * Checks whether the instrument should be updated in the current frame according to the
             * configured update interval.
             *
             * @param deltaTime
             * @param forceUpdate - True if you want to force an update during this frame.
             * @returns -1 if the instrument should not update, or the time elapsed since the last
             *          update in milliseconds
             */
            canUpdate(deltaTime: number, forceUpdate?: boolean);
        }
    }
}

export {};
