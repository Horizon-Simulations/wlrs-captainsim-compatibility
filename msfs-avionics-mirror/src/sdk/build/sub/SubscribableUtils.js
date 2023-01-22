import { Subject } from './Subject';
/**
 * Utility methods for working with Subscribables.
 */
export class SubscribableUtils {
    /**
     * Checks if a query is a subscribable.
     * @param query A query.
     * @returns Whether the query is a subscribable.
     */
    static isSubscribable(query) {
        return typeof query === 'object' && query !== null && query.isSubscribable === true;
    }
    /**
     * Checks if a query is a mutable subscribable.
     * @param query A query.
     * @returns Whether the query is a mutable subscribable.
     */
    static isMutableSubscribable(query) {
        return typeof query === 'object' && query !== null && query.isMutableSubscribable === true;
    }
    /**
     * Converts a value to a subscribable.
     *
     * If the `excludeSubscribables` argument is `true` and the value is already a subscribable, then the value is
     * returned unchanged. Otherwise, a new subscribable whose state is always equal to the value will be created and
     * returned.
     * @param value The value to convert to a subscribable.
     * @param excludeSubscribables Whether to return subscribable values as-is instead of wrapping them in another
     * subscribable.
     * @returns A subscribable.
     */
    static toSubscribable(value, excludeSubscribables) {
        if (excludeSubscribables && SubscribableUtils.isSubscribable(value)) {
            return value;
        }
        else {
            return Subject.create(value);
        }
    }
}
/**
 * A numeric equality function which returns `true` if and only if two numbers are strictly equal or if they are both
 * `NaN`.
 * @param a The first number to compare.
 * @param b The second number to compare.
 * @returns Whether the two numbers are strictly equal or both `NaN`.
 */
SubscribableUtils.NUMERIC_NAN_EQUALITY = (a, b) => a === b || (isNaN(a) && isNaN(b));
