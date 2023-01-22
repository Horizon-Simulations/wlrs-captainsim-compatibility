import { ConsumerSubject } from '../../data';
import { Subject } from '../../sub';
/**
 * Contains data necessary for predicting flight plan legs
 */
export class FlightPlanPredictorStore {
    /**
     * Ctor
     *
     * @param bus           the event bus
     * @param flightPlanner a flight planner
     * @param planIndexSub  a subscribable regarding the index of the flight plan we want to predict for
     */
    constructor(bus, flightPlanner, planIndexSub) {
        this.bus = bus;
        this.flightPlanner = flightPlanner;
        this.planIndexSub = planIndexSub;
        this.activeLegSubject = Subject.create(null);
        this.ppos = ConsumerSubject.create(null, new LatLongAlt());
        this.groundSpeed = ConsumerSubject.create(null, 150);
        /**
         * Total fuel quantity in gallons
         */
        this.fuelTotalQuantity = ConsumerSubject.create(null, 0);
        /**
         * Total fuel quantity in gallons per hour
         */
        this.fuelFlow = ConsumerSubject.create(null, 0);
        /**
         * Fuel weight in pounds per gallons
         */
        this.fuelWeight = ConsumerSubject.create(null, 0);
        this.lnavDtg = ConsumerSubject.create(null, 0);
        this.unixSimTime = ConsumerSubject.create(null, 0);
        const sub = this.bus.getSubscriber();
        this.ppos.setConsumer(sub.on('gps-position').atFrequency(1));
        this.groundSpeed.setConsumer(sub.on('ground_speed'));
        this.fuelFlow.setConsumer(sub.on('fuel_flow_total'));
        this.fuelTotalQuantity.setConsumer(sub.on('fuel_total'));
        this.fuelWeight.setConsumer(sub.on('fuel_weight_per_gallon'));
        this.lnavDtg.setConsumer(sub.on('lnavdata_waypoint_distance'));
        this.unixSimTime.setConsumer(sub.on('simTime'));
        sub.on('fplActiveLegChange').handle((data) => {
            if (data.planIndex === this.planIndexSub.get()) {
                this.handleNewActiveLeg();
            }
        });
        sub.on('fplCopied').handle((data) => {
            if (data.planIndex === this.planIndexSub.get()) {
                this.handleNewActiveLeg();
            }
        });
    }
    /**
     * Handles the active leg changing
     */
    handleNewActiveLeg() {
        const plan = this.flightPlanner.getFlightPlan(this.planIndexSub.get());
        const activeLegIndex = plan.activeLateralLeg;
        const activeLeg = plan.tryGetLeg(activeLegIndex);
        this.activeLegSubject.set(activeLeg);
    }
}
