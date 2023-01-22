import { Subject } from '../../../sub/Subject';
/**
 * A module which describes whether the map is following the player airplane.
 */
export class MapFollowAirplaneModule {
    constructor() {
        /** Whether the map is following the player airplane. */
        this.isFollowing = Subject.create(false);
    }
}
