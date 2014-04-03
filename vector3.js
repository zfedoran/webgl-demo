/**
*   Vector Class
*   ---------------------------------------------------------------------------
*/
var Vector3 = function(x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
};

Vector3.prototype = {
    constructor: Vector3,

    length: function() {
        return Math.sqrt( this.x * this.x 
                        + this.y * this.y
                        + this.z * this.z );
    },

    normalize: function() {
        var length = this.length();
        this.x = this.x / length;
        this.y = this.y / length;
        this.z = this.z / length;
        return this;
    }
};

Vector3.add = function(a, b, result) {
    if (typeof result === 'undefined') { result = new Vector3(); }

    result.x = a.x + b.x;
    result.y = a.y + b.y;
    result.z = a.z + b.z;

    return result;
};

Vector3.subtract = function(a, b, result) {
    if (typeof result === 'undefined') { result = new Vector3(); }

    result.x = a.x - b.x;
    result.y = a.y - b.y;
    result.z = a.z - b.z;

    return result;
};

Vector3.multiply = function(a, b, result) {
    if (typeof result === 'undefined') { result = new Vector3(); }

    result.x = a.x * b.x;
    result.y = a.y * b.y;
    result.z = a.z * b.z;

    return result;
};

Vector3.multiplyScalar = function(v, s, result) {
    if (typeof result === 'undefined') { result = new Vector3(); }

    result.x = v.x * s;
    result.y = v.y * s;
    result.z = v.z * s;

    return result;
};

Vector3.cross = function(a, b, result) {
    if (typeof result === 'undefined') { result = new Vector3(); }

    result.x = a.y * b.z - a.z * b.y;
    result.y = a.z * b.x - a.x * b.z;
    result.z = a.x * b.y - a.y * b.x;

    return result;
};
