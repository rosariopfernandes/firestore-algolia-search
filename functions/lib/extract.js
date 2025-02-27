'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const logs = require("./logs");
const util_1 = require("./util");
const PAYLOAD_MAX_SIZE = 10240;
const PAYLOAD_TOO_LARGE_ERR_MSG = 'Record is too large.';
const trim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
const getFields = () => config_1.default.fields ? config_1.default.fields.split(',') : [];
const getPayload = (snapshot) => {
    const payload = {
        objectID: snapshot.id,
    };
    const fields = getFields();
    if (fields.length === 0) {
        return {
            ...snapshot.data(),
            ...payload,
        };
    }
    // Fields have been defined by user.  Start pulling data from the document to create payload
    // to send to Algolia.
    fields.forEach(item => {
        const field = item.replace(trim, '');
        const value = snapshot.get(field);
        if (value !== null) {
            payload[field] = value;
        }
        else {
            logs.fieldNotExist(field);
        }
    });
    return payload;
};
function extract(snapshot) {
    // Check payload size and make sure its within limits before sending for indexing
    const payload = getPayload(snapshot);
    if (util_1.getObjectSizeInBytes(payload) < PAYLOAD_MAX_SIZE) {
        return payload;
    }
    else {
        throw new Error(PAYLOAD_TOO_LARGE_ERR_MSG);
    }
}
exports.default = extract;
