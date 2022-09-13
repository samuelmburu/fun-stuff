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
    _snaps: new Map(),
    put: function (k, v) {
        this._ds[k] = v;

        return this;
    },
    get: function (k, s) {
        var __snaps = this._snaps;
        var __ds = this._ds; // when no snapshot provided, use current state

        if (s) {
            // check for existence of s
            if (!__snaps.has(s) || __snaps.get(s) === DELETED) {
                console.log(Error(`Error, snapshot ${s} does not exist`));
                return;
            }

            __ds = __snaps.get(s);
        }

        const val = __ds[k];

        if (typeof val === 'undefined' || val === DELETED) {
            console.log(Error(`Error, key ${k} does not exist`));
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
        // create id for current state
        let currentSnapCount = this._snaps.size;
        let currentStateId = this.getSnapshotKey(currentSnapCount);
        // store pointer for current state in snapshot map
        this._snaps.set(currentStateId, this._ds);

        // create new state pointing to old state
        let newStateId = this.getSnapshotKey(currentSnapCount + 1);
        let newObj = { [newStateId]: newStateId };
        console.log({ newObj })
        const newState = Object.create(this._ds);
        newState[newObj] = newObj;

        // remove old state_id from current state
        delete newState[this.getSnapshotKey(currentSnapCount)];

        // update ds object
        this._ds = newState;

        // return "old" snapshot id
        return currentStateId
    },
    /**
     *
     * @param s {string} state id for the snapshot for removal
     */
    deleteSnapshot: function (s) {
        // QUESTION: what happens if snapshot does not exist?
        // soft delete
        if (this._snaps.has(s)) {
            this._snaps.set(s, DELETED);

            return;
        }

        console.log(Error(`Error, Snapshot ${s} does not exist`));
    },
    /**
     *
     * @param sid {number} id for the state to get a key for
     * @returns {string} state id for given state
     */
    getSnapshotKey: function (sid) { return `__v${sid}` }
}

things.put('k1', 'v1');
things.get('k1');
things.put('k2', 'v2');
var s1 = things.takeSnapshot(); console.log(s1)
console.log(Array.from(things._snaps.entries()))
things.get('k1', s1)
things.put('k1', 'v4');
console.log(`current "k1":${things.get('k1')} ---- snapshot(s1) "k1": ${things.get('k1', s1)}`)

things.delete('k2')
console.log(`current "k2":${things.get('k2')} ---- snapshot(s1) "k2": ${things.get('k2', s1)}`)


var s2 = things.takeSnapshot(); console.log(s2);
things.get('k3', s2)