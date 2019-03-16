import { Map } from 'immutable';
import isPlainObject from 'is-plain-object';

export type DataMap = Map<string, any>;
export type DataJSON = object;

// Argument to create a data set
export type DataCreateProps = Map | DataJSON;

/*
 * Data. It isn't a class but a tiny wrapper around "Map".
 */
const Data = {
    /*
     * Create a new `Data` with `attrs`.
     */
    create(attrs: DataJSON | Map = {}): DataMap {
        if (Map.isMap(attrs)) {
            return attrs;
        }

        if (isPlainObject(attrs)) {
            return Data.fromJS(attrs);
        }

        throw new Error(
            `\`Data.create\` only accepts objects or maps, but you passed it: ${attrs}`
        );
    },

    /*
     * Create a `Data` from a JSON `object`.
     */
    fromJS(object: DataJSON): DataMap {
        return new Map(object);
    }
};

export default Data;
