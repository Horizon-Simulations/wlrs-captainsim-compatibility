import { normaliseApproachName } from '@shared/flightplan';
import { FlightPlanManager } from './flightplanning/FlightPlanManager';
import { getFlightPhaseManager } from './flightphase';
import { FlightPlanAsoboSync } from './flightplanning/FlightPlanAsoboSync';
import { GuidanceManager } from './guidance/GuidanceManager';
import { ManagedFlightPlan } from './flightplanning/ManagedFlightPlan';
import { GuidanceController } from './guidance/GuidanceController';
import { NavRadioManager } from './radionav/NavRadioManager';
import { EfisSymbols } from './efis/EfisSymbols';
import { DescentBuilder } from './guidance/vnav/descent/DescentBuilder';
import { DecelPathBuilder } from './guidance/vnav/descent/DecelPathBuilder';
import { VerticalFlightPlanBuilder } from './guidance/vnav/verticalFlightPlan/VerticalFlightPlanBuilder';
import { initComponents, updateComponents, recallMessageById } from './components';
import { WaypointBuilder } from './flightplanning/WaypointBuilder';
import { Navigation } from './navigation/Navigation';

function initFmgcLoop(baseInstrument: BaseInstrument, flightPlanManager: FlightPlanManager): void {
    initComponents(baseInstrument, flightPlanManager);
}

function updateFmgcLoop(deltaTime: number): void {
    updateComponents(deltaTime);
}

export {
    getFlightPhaseManager,
    FlightPlanManager,
    ManagedFlightPlan,
    FlightPlanAsoboSync,
    GuidanceManager,
    GuidanceController,
    NavRadioManager,
    initFmgcLoop,
    updateFmgcLoop,
    recallMessageById,
    EfisSymbols,
    DescentBuilder,
    DecelPathBuilder,
    VerticalFlightPlanBuilder,
    WaypointBuilder,
    normaliseApproachName,
    Navigation,
};