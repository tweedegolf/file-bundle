// @flow
// import R from 'ramda';

let uid = 0;
/**
 * Returns an id that is unique whithin this application
 *
 * @return     {string}  The uid.
 */
export function getUID(): string {
    uid += 1;
    return `${uid}${Date.now()}`;
}

/**
 * Returns a globally unique id
 */
export function getUUID() {
  // not needed yet
  // see: http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
}
