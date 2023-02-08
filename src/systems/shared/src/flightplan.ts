import { FlightPlanManager, ManagedFlightPlan } from '../../aims/src';

export {
    FlightPlanManager,
    ManagedFlightPlan,
};

export type ApproachNameComponents = {
    // the approach type, e.g. ILS or RNAV
    type: string,

    // the runway
    runway: string,

    // alphanumeric designator when multiple approaches of the same type exist for the same runway
    designator: string | undefined,
};

export const parseApproachName = (name: string): ApproachNameComponents | undefined => {
    // L(eft), C(entre), R(ight), T(true North) are the possible runway designators (ARINC424)
    // If there are multiple procedures for the same type of approach, an alphanumeric suffix is added to their names (last subpattern)
    // We are a little more lenient than ARINC424 in an effort to match non-perfect navdata, so we allow dashes, spaces, or nothing before the suffix
    const match = name.trim().match(/^(ILS|LOC|RNAV|NDB|VOR|GPS) (RW)?([0-9]{1,2}[LCRT]?)([\s-]*([A-Z0-9]))?$/);
    if (!match) {
        return undefined;
    }
    return {
        type: match[1],
        runway: match[3],
        designator: match[5],
    };
};

/**
 *
 * @param name approach name from the nav database
 * @returns max 9 digit name in the format <approach type><runway with leading zero><option -designator><spaces if needed>
 */
export const normaliseApproachName = (name: string): string => {
    const appr = parseApproachName(name);
    if (!appr) {
        return name;
    }
    const runway = Avionics.Utils.formatRunway(appr.runway);
    const suffix = appr.designator ? `${runway.length > 2 ? '' : '-'}${appr.designator}` : '';
    return `${appr.type.replace('RNAV', 'RNV')}${runway}${suffix}`;
};
