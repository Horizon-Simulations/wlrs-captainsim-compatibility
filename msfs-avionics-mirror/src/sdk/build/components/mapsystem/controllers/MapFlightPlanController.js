import { MapSystemController } from '../MapSystemController';
import { MapSystemKeys } from '../MapSystemKeys';
/**
 * Controls the map system's flight plan module.
 */
export class MapFlightPlanController extends MapSystemController {
    constructor() {
        super(...arguments);
        this.flightPlanModule = this.context.model.getModule(MapSystemKeys.FlightPlan);
        this.planCopiedHandler = (evt) => {
            this.flightPlanModule.getPlanSubjects(evt.targetPlanIndex).flightPlan.set(this.context[MapSystemKeys.FlightPlanner].getFlightPlan(evt.targetPlanIndex));
            this.flightPlanModule.getPlanSubjects(evt.targetPlanIndex).planChanged.notify(this);
        };
        this.planCreatedHandler = (evt) => {
            this.flightPlanModule.getPlanSubjects(evt.planIndex).flightPlan.set(this.context[MapSystemKeys.FlightPlanner].getFlightPlan(evt.planIndex));
        };
        this.planDeletedHandler = (evt) => {
            this.flightPlanModule.getPlanSubjects(evt.planIndex).flightPlan.set(undefined);
        };
        this.planChangeHandler = (evt) => {
            this.flightPlanModule.getPlanSubjects(evt.planIndex).planChanged.notify(this);
        };
        this.planCalculatedHandler = (evt) => {
            this.flightPlanModule.getPlanSubjects(evt.planIndex).planCalculated.notify(this);
        };
        this.activeLegChangedHandler = (evt) => {
            this.flightPlanModule.getPlanSubjects(evt.planIndex).activeLeg.set(evt.legIndex);
        };
    }
    /** @inheritdoc */
    onAfterMapRender() {
        const sub = this.context.bus.getSubscriber();
        this.fplCopiedSub = sub.on('fplCopied').handle(this.planCopiedHandler);
        this.fplCreatedSub = sub.on('fplCreated').handle(this.planCreatedHandler);
        this.fplDeletedSub = sub.on('fplDeleted').handle(this.planDeletedHandler);
        this.fplDirectToDataChangedSub = sub.on('fplDirectToDataChanged').handle(this.planChangeHandler);
        this.fplLoadedSub = sub.on('fplLoaded').handle(this.planCreatedHandler);
        this.fplOriginDestChangedSub = sub.on('fplOriginDestChanged').handle(this.planChangeHandler);
        this.fplProcDetailsChangedSub = sub.on('fplProcDetailsChanged').handle(this.planChangeHandler);
        this.fplSegmentChangeSub = sub.on('fplSegmentChange').handle(this.planChangeHandler);
        this.fplUserDataDeleteSub = sub.on('fplUserDataDelete').handle(this.planChangeHandler);
        this.fplUserDataSetSub = sub.on('fplUserDataSet').handle(this.planChangeHandler);
        this.fplActiveLegChangeSub = sub.on('fplActiveLegChange').handle(this.activeLegChangedHandler);
        this.fplCalculatedSub = sub.on('fplCalculated').handle(this.planCalculatedHandler);
    }
    /** @inheritdoc */
    onMapDestroyed() {
        this.destroy();
    }
    /** @inheritdoc */
    destroy() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        super.destroy();
        (_a = this.fplCopiedSub) === null || _a === void 0 ? void 0 : _a.destroy();
        (_b = this.fplCreatedSub) === null || _b === void 0 ? void 0 : _b.destroy();
        (_c = this.fplDeletedSub) === null || _c === void 0 ? void 0 : _c.destroy();
        (_d = this.fplDirectToDataChangedSub) === null || _d === void 0 ? void 0 : _d.destroy();
        (_e = this.fplLoadedSub) === null || _e === void 0 ? void 0 : _e.destroy();
        (_f = this.fplOriginDestChangedSub) === null || _f === void 0 ? void 0 : _f.destroy();
        (_g = this.fplProcDetailsChangedSub) === null || _g === void 0 ? void 0 : _g.destroy();
        (_h = this.fplSegmentChangeSub) === null || _h === void 0 ? void 0 : _h.destroy();
        (_j = this.fplUserDataDeleteSub) === null || _j === void 0 ? void 0 : _j.destroy();
        (_k = this.fplUserDataSetSub) === null || _k === void 0 ? void 0 : _k.destroy();
        (_l = this.fplActiveLegChangeSub) === null || _l === void 0 ? void 0 : _l.destroy();
        (_m = this.fplCalculatedSub) === null || _m === void 0 ? void 0 : _m.destroy();
    }
}
