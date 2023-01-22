/// <reference types="msfstypes/JS/simvar" />
import { GeoPoint, MagVar, NavMath } from '../../geo';
import { NavSourceType } from '../../instruments';
import { MathUtils, UnitType } from '../../math';
import { Subject } from '../../sub';
import { LinearServo } from '../../utils/controllers';
import { DirectorState } from './PlaneDirector';
/**
 * A BackCourse autopilot director.
 */
export class APBackCourseDirector {
    /**
     * Creates an instance of the BC LateralDirector.
     * @param bus The event bus to use with this instance.
     * @param apValues Is the apValues object.
     * @param mode is the APLateralMode for this instance of the director.
     * @param lateralInterceptCurve The optional curve used to translate DTK and XTK into a track intercept angle.
     */
    constructor(bus, apValues, mode, lateralInterceptCurve) {
        this.bus = bus;
        this.apValues = apValues;
        this.mode = mode;
        this.lateralInterceptCurve = lateralInterceptCurve;
        this.bankServo = new LinearServo(10);
        this.currentBankRef = 0;
        this.currentHeading = 0;
        this.currentTrack = 0;
        this.ppos = new GeoPoint(0, 0);
        this.navLocation = new GeoPoint(NaN, NaN);
        this.tas = 0;
        this.isApproachMode = Subject.create(false);
        this.state = DirectorState.Inactive;
        this.monitorEvents();
    }
    /**
     * Activates this director.
     */
    activate() {
        if (this.onActivate !== undefined) {
            this.onActivate();
        }
        SimVar.SetSimVarValue('AUTOPILOT NAV1 LOCK', 'Bool', true);
        SimVar.SetSimVarValue('AUTOPILOT BACKCOURSE HOLD', 'Bool', true);
        SimVar.SetSimVarValue('AUTOPILOT APPROACH ACTIVE', 'Bool', true);
        this.state = DirectorState.Active;
    }
    /**
     * Arms this director.
     */
    arm() {
        if (this.state === DirectorState.Inactive && this.canArm()) {
            this.state = DirectorState.Armed;
            if (this.onArm !== undefined) {
                this.onArm();
            }
            SimVar.SetSimVarValue('AUTOPILOT NAV1 LOCK', 'Bool', true);
            SimVar.SetSimVarValue('AUTOPILOT BACKCOURSE HOLD', 'Bool', true);
            SimVar.SetSimVarValue('AUTOPILOT APPROACH ACTIVE', 'Bool', true);
        }
    }
    /**
     * Deactivates this director.
     */
    deactivate() {
        this.state = DirectorState.Inactive;
        SimVar.SetSimVarValue('AUTOPILOT NAV1 LOCK', 'Bool', false);
        SimVar.SetSimVarValue('AUTOPILOT BACKCOURSE HOLD', 'Bool', false);
        SimVar.SetSimVarValue('AUTOPILOT APPROACH ACTIVE', 'Bool', false);
    }
    /**
     * Updates this director.
     */
    update() {
        if (!this.canArm()) {
            this.deactivate();
        }
        if (this.state === DirectorState.Armed) {
            if (this.canActivate()) {
                this.activate();
            }
        }
        if (this.state === DirectorState.Active) {
            this.setBank(this.desiredBank());
        }
    }
    /**
     * Method to check whether the director can arm.
     * @returns Whether or not this director can arm.
     */
    canArm() {
        var _a, _b, _c, _d, _e;
        const typeIsCorrect = ((_a = this.navSource) === null || _a === void 0 ? void 0 : _a.type) === NavSourceType.Nav;
        const index = (_b = this.navSource) === null || _b === void 0 ? void 0 : _b.index;
        if (typeIsCorrect) {
            const indexIsCorrect = index == ((_c = this.cdi) === null || _c === void 0 ? void 0 : _c.source.index) && ((_d = this.loc) === null || _d === void 0 ? void 0 : _d.isValid) && index == ((_e = this.loc) === null || _e === void 0 ? void 0 : _e.source.index);
            if (indexIsCorrect) {
                this.isApproachMode.set(true);
                return true;
            }
        }
        this.isApproachMode.set(false);
        return false;
    }
    /**
     * Method to check whether the director can activate.
     * @returns Whether or not this director can activate.
     */
    canActivate() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const typeIsCorrect = ((_a = this.navSource) === null || _a === void 0 ? void 0 : _a.type) === NavSourceType.Nav;
        const index = (_b = this.navSource) === null || _b === void 0 ? void 0 : _b.index;
        const indexIsCorrect = index == ((_c = this.cdi) === null || _c === void 0 ? void 0 : _c.source.index)
            && (((_d = this.loc) === null || _d === void 0 ? void 0 : _d.isValid) && index == ((_e = this.loc) === null || _e === void 0 ? void 0 : _e.source.index));
        if (typeIsCorrect && indexIsCorrect && this.cdi !== undefined && this.cdi.deviation !== null && Math.abs(this.cdi.deviation) < 127 && ((_f = this.loc) === null || _f === void 0 ? void 0 : _f.course)) {
            const dtk = this.loc && this.loc.isValid && this.loc.course ? NavMath.normalizeHeading((this.loc.course * Avionics.Utils.RAD2DEG) + 180) : null;
            if (dtk === null || dtk === undefined) {
                return false;
            }
            const headingDiff = NavMath.diffAngle(this.currentHeading, dtk);
            const isLoc = (_h = (_g = this.loc) === null || _g === void 0 ? void 0 : _g.isValid) !== null && _h !== void 0 ? _h : false;
            const sensitivity = isLoc ? 1 : .6;
            if (Math.abs(this.cdi.deviation * sensitivity) < 127 && Math.abs(headingDiff) < 110) {
                return true;
            }
        }
        return false;
    }
    /**
     * Gets a desired bank from the nav input data.
     * @returns The desired bank angle.
     */
    desiredBank() {
        var _a, _b, _c, _d, _e, _f;
        const isLoc = (_b = (_a = this.loc) === null || _a === void 0 ? void 0 : _a.isValid) !== null && _b !== void 0 ? _b : false;
        const hasValidDeviation = this.cdi !== undefined && this.cdi.deviation !== null && Math.abs(this.cdi.deviation) < 127;
        if (!isLoc || (isLoc && !hasValidDeviation)) {
            this.deactivate();
            return NaN;
        }
        if (this.cdi && this.cdi.deviation !== null) {
            const xtk = (this.cdi && this.cdi.deviation !== null) ? this.getXtk(-this.cdi.deviation, isLoc) : 0;
            const courseMag = isLoc && ((_c = this.loc) === null || _c === void 0 ? void 0 : _c.course) !== undefined ? NavMath.normalizeHeading((this.loc.course * Avionics.Utils.RAD2DEG) + 180) : null;
            if (courseMag === null || courseMag === undefined) {
                this.deactivate();
                return NaN;
            }
            let absInterceptAngle = 0;
            if (this.lateralInterceptCurve !== undefined) {
                absInterceptAngle = this.lateralInterceptCurve(this.getNavDistance(), ((_e = -((_d = this.cdi) === null || _d === void 0 ? void 0 : _d.deviation)) !== null && _e !== void 0 ? _e : 0) / 127, this.tas, isLoc);
            }
            else {
                absInterceptAngle = Math.min(Math.pow(Math.abs(xtk) * 20, 1.35) + (Math.abs(xtk) * 50), 45);
                if (absInterceptAngle <= 2.5) {
                    absInterceptAngle = NavMath.clamp(Math.abs(xtk * 150), 0, 2.5);
                }
            }
            const interceptAngle = xtk > 0 ? absInterceptAngle : -1 * absInterceptAngle;
            const desiredTrack = NavMath.normalizeHeading(MagVar.magneticToTrue(courseMag, (_f = this.magVar) !== null && _f !== void 0 ? _f : 0) + interceptAngle);
            const turnDirection = NavMath.getTurnDirection(this.currentTrack, desiredTrack);
            const trackDiff = Math.abs(NavMath.diffAngle(this.currentTrack, desiredTrack));
            let baseBank = Math.min(1.25 * trackDiff, 25);
            baseBank *= (turnDirection === 'left' ? 1 : -1);
            return baseBank;
        }
        this.deactivate();
        return NaN;
    }
    /**
     * Gets a xtk value from the nav input data.
     * @param deviation is the input deviation value
     * @param isLoc is whether this is a LOC signal.
     * @returns The xtk value.
     */
    getXtk(deviation, isLoc) {
        const scale = isLoc ? 1 : 2;
        const factor = isLoc ? .35 : 1;
        return MathUtils.clamp(this.getNavDistance() * Math.sin(UnitType.DEGREE.convertTo(12, UnitType.RADIAN) * ((factor * deviation) / 127)), -scale, scale);
    }
    /**
     * Gets the lateral distance from PPOS to the nav signal.
     * @returns The distance value in nautical miles.
     */
    getNavDistance() {
        if (!isNaN(this.navLocation.lat)) {
            return UnitType.GA_RADIAN.convertTo(this.navLocation.distance(this.ppos), UnitType.NMILE);
        }
        else {
            return 5;
        }
    }
    /**
     * Sets the desired AP bank angle.
     * @param bankAngle The desired AP bank angle.
     */
    setBank(bankAngle) {
        if (isFinite(bankAngle)) {
            this.currentBankRef = this.bankServo.drive(this.currentBankRef, bankAngle);
            SimVar.SetSimVarValue('AUTOPILOT BANK HOLD REF', 'degrees', this.currentBankRef);
        }
    }
    /**
     * Checks if we might be getting a wild deviation because of the zone of confusion and allows APNavDirector some time to resolve.
     * @returns Whether we might be in the zone of confusion.
     */
    checkForZoneOfConfusion() {
        if (this.getNavDistance() < 2 && this.cdi !== undefined && this.cdi.deviation !== null) {
            return true;
        }
        return false;
    }
    /**
     * Method to monitor nav events to keep track of NAV related data needed for guidance.
     */
    monitorEvents() {
        const sub = this.bus.getSubscriber();
        sub.on('nav_radio_active_cdi_deviation').handle(cdi => this.cdi = cdi);
        sub.on('nav_radio_active_localizer').handle(loc => this.loc = loc);
        sub.on('cdi_select').handle((source) => {
            this.navSource = source;
            if (this.state === DirectorState.Active) {
                this.deactivate();
            }
        });
        sub.on('nav_radio_active_nav_location').handle((loc) => {
            this.navLocation.set(loc.lat, loc.long);
        });
        sub.on('nav_radio_active_magvar').handle(magVar => { this.magVar = magVar; });
        sub.on('hdg_deg')
            .withPrecision(0)
            .handle((h) => {
            this.currentHeading = h;
        });
        sub.on('tas').handle(s => this.tas = s);
        sub.on('gps-position').atFrequency(1).handle((lla) => {
            this.ppos.set(lla.lat, lla.long);
        });
        sub.on('track_deg_true').handle((t) => {
            this.currentTrack = t;
        });
    }
}
