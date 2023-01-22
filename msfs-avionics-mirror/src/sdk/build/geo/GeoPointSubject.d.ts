import { AbstractSubscribable } from '../sub/AbstractSubscribable';
import { MutableSubscribable } from '../sub/Subscribable';
import { LatLonInterface } from './GeoInterfaces';
import { GeoPoint, GeoPointInterface } from './GeoPoint';
/**
 * A Subject which provides a {@link GeoPointInterface} value.
 */
export declare class GeoPointSubject extends AbstractSubscribable<GeoPointInterface> implements MutableSubscribable<GeoPointInterface, LatLonInterface> {
    private readonly value;
    /** @inheritdoc */
    readonly isMutableSubscribable = true;
    /**
     * Constructor.
     * @param value The value of this subject.
     */
    private constructor();
    /**
     * Creates a GeoPointSubject.
     * @param initialVal The initial value.
     * @returns A GeoPointSubject.
     */
    static create(initialVal: GeoPoint): GeoPointSubject;
    /**
     * Creates a GeoPointSubject.
     * @param initialVal The initial value.
     * @returns A GeoPointSubject.
     * @deprecated Use `GeoPointSubject.create()` instead.
     */
    static createFromGeoPoint(initialVal: GeoPoint): GeoPointSubject;
    /** @inheritdoc */
    get(): GeoPointInterface;
    /**
     * Sets the new value and notifies the subscribers if the value changed.
     * @param value The new value.
     */
    set(value: LatLonInterface): void;
    /**
     * Sets the new value and notifies the subscribers if the value changed.
     * @param lat The latitude of the new value.
     * @param lon The longitude of the new value.
     */
    set(lat: number, lon: number): void;
}
//# sourceMappingURL=GeoPointSubject.d.ts.map