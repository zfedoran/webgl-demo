/**
*   Matrix Class
*   ---------------------------------------------------------------------------
*/
var Matrix4 = function(n11, n21, n31, n41, 
                       n12, n22, n32, n42, 
                       n13, n23, n33, n43, 
                       n14, n24, n34, n44) {

    this.elements = new Float32Array(16);

    var te = this.elements;
    te[0] = ( n11 !== undefined ) ? n11 : 1; te[4] = n12 || 0; te[8] = n13 || 0; te[12] = n14 || 0;
    te[1] = n21 || 0; te[5] = ( n22 !== undefined ) ? n22 : 1; te[9] = n23 || 0; te[13] = n24 || 0;
    te[2] = n31 || 0; te[6] = n32 || 0; te[10] = ( n33 !== undefined ) ? n33 : 1; te[14] = n34 || 0;
    te[3] = n41 || 0; te[7] = n42 || 0; te[11] = n43 || 0; te[15] = ( n44 !== undefined ) ? n44 : 1;
};

Matrix4.prototype = {
    constructor: Matrix4,

    set: function( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {
        var te = this.elements;
        te[0] = n11; te[4] = n12; te[8] = n13; te[12] = n14;
        te[1] = n21; te[5] = n22; te[9] = n23; te[13] = n24;
        te[2] = n31; te[6] = n32; te[10] = n33; te[14] = n34;
        te[3] = n41; te[7] = n42; te[11] = n43; te[15] = n44;
        return this;
    },

    toString: function () {
        var te = this.elements;
        var p = 5; var c = -12;
        var f = function(val) { return ('            ' + val.toPrecision(p)).slice(c); };
        return '\n' + f(te[0]) + f(te[4]) + f(te[8] ) + f(te[12]) +
               '\n' + f(te[1]) + f(te[5]) + f(te[9] ) + f(te[13]) +
               '\n' + f(te[2]) + f(te[6]) + f(te[10]) + f(te[14]) +
               '\n' + f(te[3]) + f(te[7]) + f(te[11]) + f(te[15]);
    },

    compose: function(position, rotation, scale) {
        var re = this.elements;

        var c1 = Math.cos(rotation.x / 2);
        var c2 = Math.cos(rotation.y / 2);
        var c3 = Math.cos(rotation.z / 2);
        var s1 = Math.sin(rotation.x / 2);
        var s2 = Math.sin(rotation.y / 2);
        var s3 = Math.sin(rotation.z / 2);

        var x = s1 * c2 * c3 + c1 * s2 * s3;
        var y = c1 * s2 * c3 - s1 * c2 * s3;
        var z = c1 * c2 * s3 + s1 * s2 * c3;
        var w = c1 * c2 * c3 - s1 * s2 * s3;

        var x2 = x + x, y2 = y + y, z2 = z + z;
        var xx = x * x2, xy = x * y2, xz = x * z2;
        var yy = y * y2, yz = y * z2, zz = z * z2;
        var wx = w * x2, wy = w * y2, wz = w * z2;

        re[0] = 1 - (yy + zz);
        re[4] = xy - wz;
        re[8] = xz + wy;

        re[1] = xy + wz;
        re[5] = 1 - (xx + zz);
        re[9] = yz - wx;

        re[2] = xz - wy;
        re[6] = yz + wx;
        re[10] = 1 - (xx + yy);

        re[3] = 0; re[7] = 0; re[11] = 0; re[15] = 1;

        // Apply scale
        re[0] *= scale.x; re[4] *= scale.y; re[8] *= scale.z;
        re[1] *= scale.x; re[5] *= scale.y; re[9] *= scale.z;
        re[2] *= scale.x; re[6] *= scale.y; re[10] *= scale.z;

        // Apply position
        re[12] = position.x;
        re[13] = position.y;
        re[14] = position.z;

        return this;
    },

    transpose: function() {
        var te = this.elements;
        var tmp;

        tmp = te[1]; te[1] = te[4]; te[4] = tmp;
        tmp = te[2]; te[2] = te[8]; te[8] = tmp;
        tmp = te[6]; te[6] = te[9]; te[9] = tmp;

        tmp = te[3]; te[3] = te[12]; te[12] = tmp;
        tmp = te[7]; te[7] = te[13]; te[13] = tmp;
        tmp = te[11]; te[11] = te[14]; te[14] = tmp;

        return this;
    },

    inverse: function() {
        return Matrix4.inverse(this, this);
    }
};

Matrix4.multiply = (function() {
    // Optimization to keep multiply() from creating these each time the function is called
    var a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34, a41, a42, a43, a44;
    var b11, b12, b13, b14, b21, b22, b23, b24, b31, b32, b33, b34, b41, b42, b43, b44;

    return function(a, b, result) {
        if (typeof result === 'undefined') {
            result = new Matrix4();
        }

        var ae = a.elements;
        var be = b.elements;
        var re = result.elements;

        a11 = ae[0]; a12 = ae[4]; a13 = ae[8]; a14 = ae[12];
        a21 = ae[1]; a22 = ae[5]; a23 = ae[9]; a24 = ae[13];
        a31 = ae[2]; a32 = ae[6]; a33 = ae[10]; a34 = ae[14];
        a41 = ae[3]; a42 = ae[7]; a43 = ae[11]; a44 = ae[15];

        b11 = be[0]; b12 = be[4]; b13 = be[8]; b14 = be[12];
        b21 = be[1]; b22 = be[5]; b23 = be[9]; b24 = be[13];
        b31 = be[2]; b32 = be[6]; b33 = be[10]; b34 = be[14];
        b41 = be[3]; b42 = be[7]; b43 = be[11]; b44 = be[15];

        re[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
        re[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
        re[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
        re[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

        re[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
        re[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
        re[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
        re[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

        re[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
        re[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
        re[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
        re[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

        re[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
        re[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
        re[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
        re[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

        return result;
    };
})();

Matrix4.multiplyScalar = function(m, s, result) {
    if (typeof result === 'undefined') {
        result = new Matrix4();
    }

    var me = m.elements;

    me[0] *= s; me[4] *= s; me[8] *= s; me[12] *= s;
    me[1] *= s; me[5] *= s; me[9] *= s; me[13] *= s;
    me[2] *= s; me[6] *= s; me[10] *= s; me[14] *= s;
    me[3] *= s; me[7] *= s; me[11] *= s; me[15] *= s;

    return result;
};


Matrix4.inverse = function(m, result) {
    if (typeof result === 'undefined') {
        result = new Matrix4();
    }

    // based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
    var me = m.elements;
    var re = result.elements;

    a11 = me[0]; a12 = me[4]; a13 = me[8]; a14 = me[12];
    a21 = me[1]; a22 = me[5]; a23 = me[9]; a24 = me[13];
    a31 = me[2]; a32 = me[6]; a33 = me[10]; a34 = me[14];
    a41 = me[3]; a42 = me[7]; a43 = me[11]; a44 = me[15];

    re[0] = a23*a34*a42 - a24*a33*a42 + a24*a32*a43 - a22*a34*a43 - a23*a32*a44 + a22*a33*a44;
    re[4] = a14*a33*a42 - a13*a34*a42 - a14*a32*a43 + a12*a34*a43 + a13*a32*a44 - a12*a33*a44;
    re[8] = a13*a24*a42 - a14*a23*a42 + a14*a22*a43 - a12*a24*a43 - a13*a22*a44 + a12*a23*a44;
    re[12] = a14*a23*a32 - a13*a24*a32 - a14*a22*a33 + a12*a24*a33 + a13*a22*a34 - a12*a23*a34;
    re[1] = a24*a33*a41 - a23*a34*a41 - a24*a31*a43 + a21*a34*a43 + a23*a31*a44 - a21*a33*a44;
    re[5] = a13*a34*a41 - a14*a33*a41 + a14*a31*a43 - a11*a34*a43 - a13*a31*a44 + a11*a33*a44;
    re[9] = a14*a23*a41 - a13*a24*a41 - a14*a21*a43 + a11*a24*a43 + a13*a21*a44 - a11*a23*a44;
    re[13] = a13*a24*a31 - a14*a23*a31 + a14*a21*a33 - a11*a24*a33 - a13*a21*a34 + a11*a23*a34;
    re[2] = a22*a34*a41 - a24*a32*a41 + a24*a31*a42 - a21*a34*a42 - a22*a31*a44 + a21*a32*a44;
    re[6] = a14*a32*a41 - a12*a34*a41 - a14*a31*a42 + a11*a34*a42 + a12*a31*a44 - a11*a32*a44;
    re[10] = a12*a24*a41 - a14*a22*a41 + a14*a21*a42 - a11*a24*a42 - a12*a21*a44 + a11*a22*a44;
    re[14] = a14*a22*a31 - a12*a24*a31 - a14*a21*a32 + a11*a24*a32 + a12*a21*a34 - a11*a22*a34;
    re[3] = a23*a32*a41 - a22*a33*a41 - a23*a31*a42 + a21*a33*a42 + a22*a31*a43 - a21*a32*a43;
    re[7] = a12*a33*a41 - a13*a32*a41 + a13*a31*a42 - a11*a33*a42 - a12*a31*a43 + a11*a32*a43;
    re[11] = a13*a22*a41 - a12*a23*a41 - a13*a21*a42 + a11*a23*a42 + a12*a21*a43 - a11*a22*a43;
    re[15] = a12*a23*a31 - a13*a22*a31 + a13*a21*a32 - a11*a23*a32 - a12*a21*a33 + a11*a22*a33;

    var det = a11 * re[ 0 ] + a21 * re[ 4 ] + a31 * re[ 8 ] + a41 * re[ 12 ];

    if (det === 0) {
        throw new Error("Matrix4.getInverse(): can't invert matrix, determinant is 0"); 
    } else {
        Matrix4.multiplyScalar(result, 1 / det, /*out*/  result);
    }

    return result;
};

Matrix4.createTranslation = function(position, result) {
    if (typeof result === 'undefined') { result = new Matrix4(); }
    var x, y, z;
    x = position.x;
    y = position.y;
    z = position.z;

    result.set(
        1, 0, 0, x,
        0, 1, 0, y,
        0, 0, 1, z,
        0, 0, 0, 1
    );

    return result;
};

Matrix4.createRotationX = function(theta, result) {
    if (typeof result === 'undefined') { result = new Matrix4(); }

    var c = Math.cos(theta), s = Math.sin(theta);
    result.set(
        1, 0,  0, 0,
        0, c, -s, 0,
        0, s,  c, 0,
        0, 0,  0, 1
    );

    return result;
};

Matrix4.createRotationY = function(theta, result) {
    if (typeof result === 'undefined') { result = new Matrix4(); }

    var c = Math.cos(theta), s = Math.sin(theta);
    result.set(
         c, 0, s, 0,
         0, 1, 0, 0,
        -s, 0, c, 0,
         0, 0, 0, 1
    );

    return result;
};

Matrix4.createRotationZ = function(theta, result) {
    if (typeof result === 'undefined') { result = new Matrix4(); }

    var c = Math.cos(theta), s = Math.sin(theta);
    result.set(
        c, -s, 0, 0,
        s,  c, 0, 0,
        0,  0, 1, 0,
        0,  0, 0, 1
    );

    return result;
};

Matrix4.createScale = function(x, y, z, result) {
    if (typeof result === 'undefined') { result = new Matrix4(); }

    result.set(
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0,
        0, 0, 0, 1
    );

    return result;
};

Matrix4.createFrustum = function(left, right, bottom, top, near, far, result) {
    if (typeof result === 'undefined') { result = new Matrix4(); }

    var re = result.elements;
    var x = 2 * near / (right - left);
    var y = 2 * near / (top - bottom);

    var a = (right + left) / (right - left);
    var b = (top + bottom) / (top - bottom);
    var c = - (far + near) / (far - near);
    var d = - 2 * far * near / (far - near);

    re[0] = x; re[4] = 0; re[8]  = a; re[12] = 0;
    re[1] = 0; re[5] = y; re[9]  = b; re[13] = 0;
    re[2] = 0; re[6] = 0; re[10] = c; re[14] = d;
    re[3] = 0; re[7] = 0; re[11] =-1; re[15] = 0;

    return result;
};

Matrix4.createPerspective = function(fov, aspect, near, far, result) {
    if (typeof result === 'undefined') { result = new Matrix4(); }

    var ymax = near * Math.tan(fov * Math.PI / 360);
    var ymin = - ymax;
    var xmin = ymin * aspect;
    var xmax = ymax * aspect;

    Matrix4.createFrustum(xmin, xmax, ymin, ymax, near, far, /*out*/ result);

    return result;
};

Matrix4.createLookAt = function(eye, target, up, result) {
    if (typeof result === 'undefined') { result = new Matrix4(); }

    var te = result.elements;

    var z = Vector3.subtract(eye, target);
    if (z.length() === 0) {
        z.z = 1;
    }
    z.normalize();

    var x = Vector3.cross(up, z);
    if (x.length() === 0) {
        z.z += 0.0001;
        x = Vector3.cross(up, z);
    }
    x.normalize();

    var y = Vector3.cross(z, x);

    te[0] = x.x; te[4] = x.y; te[8] = x.z;
    te[1] = y.x; te[5] = y.y; te[9] = y.z;
    te[2] = z.x; te[6] = z.y; te[10] = z.z;
    
    te[12] = -(x.x*eye.x + x.y*eye.y + x.z*eye.z);
    te[13] = -(y.x*eye.x + y.y*eye.y + y.z*eye.z);
    te[14] = -(z.x*eye.x + z.y*eye.y + z.z*eye.z);

    return result;
};
