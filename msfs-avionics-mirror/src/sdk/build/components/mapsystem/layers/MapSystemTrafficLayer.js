import { GeoPoint } from '../../../geo';
import { BitFlags, UnitType, VecNMath, VecNSubject } from '../../../math';
import { Subject } from '../../../sub/Subject';
import { TcasAlertLevel, TcasOperatingMode } from '../../../traffic';
import { FSComponent } from '../../FSComponent';
import { MapLayer, MapProjectionChangeType, MapSyncedCanvasLayer } from '../../map';
import { MapSystemKeys } from '../MapSystemKeys';
import { MapTrafficAlertLevelVisibility } from '../modules/MapTrafficModule';
/**
 * A map layer which displays traffic intruders.
 */
export class MapSystemTrafficLayer extends MapLayer {
    constructor() {
        var _a;
        super(...arguments);
        this.iconLayerRef = FSComponent.createRef();
        this.trafficModule = this.props.model.getModule(MapSystemKeys.Traffic);
        this.intruderIcons = {
            [TcasAlertLevel.None]: new Map(),
            [TcasAlertLevel.ProximityAdvisory]: new Map(),
            [TcasAlertLevel.TrafficAdvisory]: new Map(),
            [TcasAlertLevel.ResolutionAdvisory]: new Map()
        };
        this.needHandleOffscaleOob = this.props.offScaleIntruders !== undefined || this.props.oobIntruders !== undefined;
        this.oobOffset = (_a = this.props.oobOffset) !== null && _a !== void 0 ? _a : Subject.create(VecNMath.create(4));
        this.oobBounds = VecNSubject.createFromVector(VecNMath.create(4));
        this.isInit = false;
    }
    /** @inheritdoc */
    onVisibilityChanged(isVisible) {
        var _a, _b;
        if (!isVisible) {
            if (this.isInit) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.iconLayerRef.instance.display.clear();
            }
            (_a = this.props.offScaleIntruders) === null || _a === void 0 ? void 0 : _a.clear();
            (_b = this.props.oobIntruders) === null || _b === void 0 ? void 0 : _b.clear();
        }
    }
    /** @inheritdoc */
    onAttached() {
        this.iconLayerRef.instance.onAttached();
        this.oobOffset.sub(this.updateOobBounds.bind(this), true);
        this.trafficModule.operatingMode.sub(this.updateVisibility.bind(this));
        this.trafficModule.show.sub(this.updateVisibility.bind(this), true);
        this.initCanvasStyles();
        this.initIntruders();
        this.initTCASHandlers();
        this.isInit = true;
    }
    /**
     * Initializes canvas styles.
     */
    initCanvasStyles() {
        this.props.initCanvasStyles && this.props.initCanvasStyles(this.iconLayerRef.instance.display.context);
    }
    /**
     * Initializes all currently existing TCAS intruders.
     */
    initIntruders() {
        const intruders = this.trafficModule.tcas.getIntruders();
        const len = intruders.length;
        for (let i = 0; i < len; i++) {
            this.onIntruderAdded(intruders[i]);
        }
    }
    /**
     * Initializes handlers to respond to TCAS events.
     */
    initTCASHandlers() {
        const tcasSub = this.props.context.bus.getSubscriber();
        tcasSub.on('tcas_intruder_added').handle(this.onIntruderAdded.bind(this));
        tcasSub.on('tcas_intruder_removed').handle(this.onIntruderRemoved.bind(this));
        tcasSub.on('tcas_intruder_alert_changed').handle(this.onIntruderAlertLevelChanged.bind(this));
    }
    /** @inheritdoc */
    onMapProjectionChanged(mapProjection, changeFlags) {
        this.iconLayerRef.instance.onMapProjectionChanged(mapProjection, changeFlags);
        if (BitFlags.isAll(changeFlags, MapProjectionChangeType.ProjectedSize)) {
            this.initCanvasStyles();
            this.updateOobBounds();
        }
    }
    /**
     * Updates the boundaries of the intruder out-of-bounds area.
     */
    updateOobBounds() {
        const projectedSize = this.props.mapProjection.getProjectedSize();
        const oobOffset = this.oobOffset.get();
        this.oobBounds.set(oobOffset[0], oobOffset[1], projectedSize[0] - oobOffset[2], projectedSize[1] - oobOffset[3]);
    }
    /** @inheritdoc */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onUpdated(time, elapsed) {
        if (!this.isVisible()) {
            return;
        }
        this.redrawIntruders();
    }
    /**
     * Redraws all tracked intruders.
     */
    redrawIntruders() {
        const alertLevelVisFlags = this.trafficModule.alertLevelVisibility.get();
        const offScaleRange = this.trafficModule.offScaleRange.get();
        const oobBounds = this.oobBounds.get();
        const iconDisplay = this.iconLayerRef.instance.display;
        iconDisplay.clear();
        for (let i = 0; i < MapSystemTrafficLayer.DRAW_GROUPS.length; i++) {
            const group = MapSystemTrafficLayer.DRAW_GROUPS[i];
            if (BitFlags.isAll(alertLevelVisFlags, group.alertLevelVisFlag)) {
                this.intruderIcons[group.alertLevel].forEach(icon => {
                    var _a, _b, _c, _d, _e, _f;
                    icon.draw(this.props.mapProjection, iconDisplay.context, offScaleRange);
                    if (this.needHandleOffscaleOob) {
                        if (icon.isOffScale) {
                            (_a = this.props.oobIntruders) === null || _a === void 0 ? void 0 : _a.delete(icon.intruder);
                            (_b = this.props.offScaleIntruders) === null || _b === void 0 ? void 0 : _b.add(icon.intruder);
                        }
                        else if (!this.props.mapProjection.isInProjectedBounds(icon.projectedPos, oobBounds)) {
                            (_c = this.props.offScaleIntruders) === null || _c === void 0 ? void 0 : _c.delete(icon.intruder);
                            (_d = this.props.oobIntruders) === null || _d === void 0 ? void 0 : _d.add(icon.intruder);
                        }
                        else {
                            (_e = this.props.offScaleIntruders) === null || _e === void 0 ? void 0 : _e.delete(icon.intruder);
                            (_f = this.props.oobIntruders) === null || _f === void 0 ? void 0 : _f.delete(icon.intruder);
                        }
                    }
                });
            }
            else if (this.needHandleOffscaleOob) {
                this.intruderIcons[group.alertLevel].forEach(icon => {
                    var _a, _b;
                    (_a = this.props.offScaleIntruders) === null || _a === void 0 ? void 0 : _a.delete(icon.intruder);
                    (_b = this.props.oobIntruders) === null || _b === void 0 ? void 0 : _b.delete(icon.intruder);
                });
            }
        }
    }
    /**
     * Updates this layer's visibility.
     */
    updateVisibility() {
        this.setVisible(this.trafficModule.tcas.getOperatingMode() !== TcasOperatingMode.Standby && this.trafficModule.show.get());
    }
    /**
     * A callback which is called when a TCAS intruder is added.
     * @param intruder The new intruder.
     */
    onIntruderAdded(intruder) {
        const icon = this.props.iconFactory(intruder, this.props.context);
        this.intruderIcons[intruder.alertLevel.get()].set(intruder, icon);
    }
    /**
     * A callback which is called when a TCAS intruder is removed.
     * @param intruder The removed intruder.
     */
    onIntruderRemoved(intruder) {
        var _a, _b;
        (_a = this.props.offScaleIntruders) === null || _a === void 0 ? void 0 : _a.delete(intruder);
        (_b = this.props.oobIntruders) === null || _b === void 0 ? void 0 : _b.delete(intruder);
        this.intruderIcons[intruder.alertLevel.get()].delete(intruder);
    }
    /**
     * A callback which is called when the alert level of a TCAS intruder is changed.
     * @param intruder The intruder.
     */
    onIntruderAlertLevelChanged(intruder) {
        let oldAlertLevel;
        let view = this.intruderIcons[oldAlertLevel = TcasAlertLevel.None].get(intruder);
        view !== null && view !== void 0 ? view : (view = this.intruderIcons[oldAlertLevel = TcasAlertLevel.ProximityAdvisory].get(intruder));
        view !== null && view !== void 0 ? view : (view = this.intruderIcons[oldAlertLevel = TcasAlertLevel.TrafficAdvisory].get(intruder));
        view !== null && view !== void 0 ? view : (view = this.intruderIcons[oldAlertLevel = TcasAlertLevel.ResolutionAdvisory].get(intruder));
        if (view) {
            this.intruderIcons[oldAlertLevel].delete(intruder);
            this.intruderIcons[intruder.alertLevel.get()].set(intruder, view);
        }
    }
    /** @inheritdoc */
    render() {
        return (FSComponent.buildComponent(MapSyncedCanvasLayer, { ref: this.iconLayerRef, model: this.props.model, mapProjection: this.props.mapProjection }));
    }
}
MapSystemTrafficLayer.DRAW_GROUPS = [
    { alertLevelVisFlag: MapTrafficAlertLevelVisibility.Other, alertLevel: TcasAlertLevel.None },
    { alertLevelVisFlag: MapTrafficAlertLevelVisibility.ProximityAdvisory, alertLevel: TcasAlertLevel.ProximityAdvisory },
    { alertLevelVisFlag: MapTrafficAlertLevelVisibility.TrafficAdvisory, alertLevel: TcasAlertLevel.TrafficAdvisory },
    { alertLevelVisFlag: MapTrafficAlertLevelVisibility.ResolutionAdvisory, alertLevel: TcasAlertLevel.ResolutionAdvisory },
];
/**
 * An abstract implementation of {@link MapTrafficIntruderIcon} which handles the projection of the intruder's position
 * and off-scale calculations.
 */
export class AbstractMapTrafficIntruderIcon {
    /**
     * Constructor.
     * @param intruder This icon's associated intruder.
     * @param trafficModule The traffic module for this icon's parent map.
     * @param ownshipModule The ownship module for this icon's parent map.
     */
    constructor(intruder, trafficModule, ownshipModule) {
        this.intruder = intruder;
        this.trafficModule = trafficModule;
        this.ownshipModule = ownshipModule;
        this.projectedPos = new Float64Array(2);
        this.isOffScale = false;
    }
    /**
     * Draws this icon.
     * @param projection The map projection.
     * @param context The canvas rendering context to which to draw this icon.
     * @param offScaleRange The distance from the own airplane to this icon's intruder beyond which the intruder is
     * considered off-scale. If the value is `NaN`, the intruder is never considered off-scale.
     */
    draw(projection, context, offScaleRange) {
        this.updatePosition(projection, offScaleRange);
        this.drawIcon(projection, context, this.projectedPos, this.isOffScale);
    }
    /**
     * Updates this icon's intruder's projected position and off-scale status.
     * @param projection The map projection.
     * @param offScaleRange The distance from the own airplane to this icon's intruder beyond which the intruder is
     * considered off-scale. If the value is `NaN`, the intruder is never considered off-scale.
     */
    updatePosition(projection, offScaleRange) {
        const ownAirplanePos = this.ownshipModule.position.get();
        if (offScaleRange.isNaN()) {
            projection.project(this.intruder.position, this.projectedPos);
            this.isOffScale = false;
        }
        else {
            this.handleOffScaleRange(projection, ownAirplanePos, offScaleRange);
        }
    }
    /**
     * Updates this icon's intruder's projected position and off-scale status using a specific range from the own
     * airplane to define off-scale.
     * @param projection The map projection.
     * @param ownAirplanePos The position of the own airplane.
     * @param offScaleRange The distance from the own airplane to this icon's intruder beyond which the intruder is
     * considered off-scale.
     */
    handleOffScaleRange(projection, ownAirplanePos, offScaleRange) {
        const intruderPos = this.intruder.position;
        const horizontalSeparation = intruderPos.distance(ownAirplanePos);
        const offscaleRangeRad = offScaleRange.asUnit(UnitType.GA_RADIAN);
        if (horizontalSeparation > offscaleRangeRad) {
            this.isOffScale = true;
            projection.project(ownAirplanePos.offset(ownAirplanePos.bearingTo(intruderPos), offscaleRangeRad, AbstractMapTrafficIntruderIcon.geoPointCache[0]), this.projectedPos);
        }
        else {
            this.isOffScale = false;
            projection.project(intruderPos, this.projectedPos);
        }
    }
}
AbstractMapTrafficIntruderIcon.geoPointCache = [new GeoPoint(0, 0)];
