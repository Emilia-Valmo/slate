import Operation from '../models/operation';
import Value from '../models/value';

/*
 * Changes.
 */

const Changes = {};

/*
 * Set `properties` on the value.
 */
Changes.setValue = (change, properties, options = {}) => {
    properties = Value.createProperties(properties);
    const { value } = change;

    change.applyOperation(
        Operation.create({
            type: 'set_value',
            properties,
            value
        }),
        options
    );
};

export default Changes;
