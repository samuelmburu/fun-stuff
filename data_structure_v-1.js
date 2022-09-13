// @ts-check

// takeSnapshot() -> s2  __v3
//
// void put(string KEY, string VALUE)
// void delete(string KEY)
// string get(string KEY, snapshot S)
// snapshot takeSnapshot()
// deleteSnapshot(Snapshot s)
//
// put(k1, v1)
// put(k2, v2)
// put(k3, v3) {__v1:__v1, k1:v1, k2:v2,k3:v3}
// takeSnapshot() -> s1 __v1 ..... ds __v2
// get(k1, s1) -> v1
// put(k1, v4)
// delete(k3) =====> __v2:__v2, k1:v4, k3:DELETED}
// takeSnapshot() -> s2  __v3
// get(k1, s1) -> v1
// get(k1, s2) -> v4
// get(k3, s1) -> v3
// get(k3, s2) -> Error, k3 does not exist
// deleteSnapshot(s1)
// get(k1, s1) -> Error, s1 does not exist

'use strict';
var DELETED = 'deleted'
/**
 * my object
 */
var things = {
    _ds: { '__v0': '__v0' },
    _snaps: new Set(),
    put: function (k, v) {
        this._ds.set(k, v);

        return this;
    },
    get: function (k, s) {
        // TODO: if no snapshot provided, use current state
        let val = this._snaps[s].get(k);

        if (k === DELETED) {
            console.log(Error(`Error, ${k} does not exist`));
            return;
        }

        return val;
    },
    delete: function (k) {
        // QUESTION: what if the key doesn't exist?
        this._ds[k] = DELETED;

        return this;
    },
    takeSnapshot: function () {
        let result = this._snaps.lengthth;
        let newStateId = result + 1;
        let newSnapshotId = this.getSnapshotKey(newStateId);

        this._snaps.push(newStateId);

        // store "current state" -- done by nature of the following action
        // create new state pointing to old state
        let newObj = { [newSnapshotId]: newSnapshotId };
        console.log({ newObj })
        const newState = Object.create(this._ds);
        newState[newObj] = newObj;

        // remove old state_id from current state
        delete newState[this.getSnapshotKey(result)];

        // update ds object
        this._ds = newState;
        // return "old" snapshot id
        return this.getSnapshotKey(result);
    },
    /**
     *
     * @param s {string} state id for the snapshot for removal
     */
    deleteSnapshot: function (s) {
        // soft delete

    },
    /**
     *
     * @param sid {number} id for the state to get a key for
     * @returns {string} state id for given state
     */
    getSnapshotKey: function (sid) { return `__v${sid}` }
}

